import type { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verifyPaymobHmac, type PaymobTxnObj } from "@/lib/payments/paymob";

// Paymob's server-to-server "Transaction processed" callback. This — not the
// browser redirect — is the source of truth for whether money actually moved.
// Paymob signs the payload with HMAC-SHA512 and passes the digest as the
// `?hmac=` query param; we recompute it before trusting a single field.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  let payload: { type?: string; obj?: PaymobTxnObj };
  try {
    payload = await request.json();
  } catch {
    return new Response("bad request", { status: 400 });
  }

  const obj = payload.obj;
  if (!obj || payload.type !== "TRANSACTION") {
    // Acknowledge non-transaction callbacks so Paymob stops retrying them.
    return new Response("ignored", { status: 200 });
  }

  const received = request.nextUrl.searchParams.get("hmac") || "";
  if (!verifyPaymobHmac(obj, received)) {
    return new Response("invalid signature", { status: 401 });
  }

  const orderId = obj.order?.merchant_order_id;
  if (!orderId) {
    return new Response("no merchant order", { status: 200 });
  }

  // Only a genuinely successful, non-error, non-refunded, non-voided capture
  // confirms the order. Anything else (decline, pending, refund) is logged but
  // leaves the order PENDING for the owner to review.
  const paid =
    obj.success === true &&
    obj.error_occured === false &&
    obj.is_refunded === false &&
    obj.is_voided === false &&
    obj.pending === false;

  if (!paid) {
    return new Response("not paid", { status: 200 });
  }

  try {
    // Idempotent: only a still-PENDING order is advanced, so a duplicate
    // delivery is a no-op. Confirming turns the checkout hold into a permanent
    // reservation (clear reservedUntil so the sweeper can't release it),
    // mirroring the owner's manual confirm in /admin/orders. The piece is
    // flipped to SOLD by hand once it actually ships.
    const result = await prisma.order.updateMany({
      where: { id: orderId, status: "PENDING" },
      data: { status: "CONFIRMED" },
    });
    if (result.count > 0) {
      const items = await prisma.orderItem.findMany({
        where: { orderId },
        select: { productId: true },
      });
      await prisma.product.updateMany({
        where: { id: { in: items.map((i) => i.productId) }, status: "RESERVED" },
        data: { reservedUntil: null },
      });
      revalidatePath("/admin/orders");
      revalidatePath("/admin/inventory");
    }
  } catch (err) {
    console.error("paymob webhook: order update failed", err);
    return new Response("server error", { status: 500 });
  }

  return new Response("ok", { status: 200 });
}
