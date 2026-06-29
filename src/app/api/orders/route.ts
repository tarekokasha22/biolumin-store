import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { releaseExpiredReservations } from "@/lib/catalog";
import {
  availablePaymentMethods,
  priceOrder,
  toPrismaMethod,
  type PaymentMethodId,
} from "@/lib/payments";
import { createPaymobPayment } from "@/lib/payments/paymob";
import { notifyOwnerOfOrder } from "@/lib/notify";

const schema = z.object({
  customerName: z.string().trim().min(2).max(80),
  phone: z.string().trim().min(8).max(20),
  altPhone: z.string().trim().max(20).optional().or(z.literal("")),
  governorate: z.string().trim().min(2).max(60),
  address: z.string().trim().min(5).max(300),
  notes: z.string().trim().max(500).optional().or(z.literal("")),
  paymentMethod: z.enum(["cod", "manual_transfer", "paymob"]),
  discountCode: z.string().trim().max(40).optional().or(z.literal("")),
  productIds: z.array(z.string().min(1)).min(1).max(20),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "bad_request" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "validation" }, { status: 422 });
  }
  const data = parsed.data;

  const allowed = availablePaymentMethods().map((m) => m.id);
  if (!allowed.includes(data.paymentMethod as PaymentMethodId)) {
    return Response.json({ error: "method_unavailable" }, { status: 422 });
  }

  // Free up any legacy time-boxed holds, then place this order. A placed
  // order holds its one-of-one pieces indefinitely (reservedUntil = null) —
  // the piece stays RESERVED until the owner confirms or cancels the order
  // from the admin panel. This is deliberate: for a unique piece, locking it
  // until reviewed is far safer than auto-releasing and risking a double-sale.
  await releaseExpiredReservations();

  try {
    const order = await prisma.$transaction(async (tx) => {
      // Atomically claim each one-of-one piece. If any claim fails, the
      // whole transaction rolls back — two buyers can't both win.
      for (const id of data.productIds) {
        const claim = await tx.product.updateMany({
          where: { id, status: "AVAILABLE" },
          data: { status: "RESERVED", reservedUntil: null },
        });
        if (claim.count === 0) {
          throw new Error("UNAVAILABLE");
        }
      }

      const products = await tx.product.findMany({
        where: { id: { in: data.productIds } },
      });

      // Server is the price authority — never trust client amounts.
      const subtotal = products.reduce((s, p) => s + p.price, 0);

      // Re-validate the discount code against the live DB (the client quote
      // is advisory only) and claim a redemption atomically.
      let discountValue = 0;
      let appliedCode: string | null = null;
      const rawCode = (data.discountCode || "").trim();
      if (rawCode) {
        const dc = await tx.discountCode.findUnique({
          where: { code: rawCode.toUpperCase() },
        });
        const usable =
          dc &&
          dc.active &&
          (!dc.expiresAt || dc.expiresAt.getTime() >= Date.now()) &&
          (dc.maxRedemptions == null || dc.timesUsed < dc.maxRedemptions) &&
          subtotal >= dc.minSubtotal;
        if (dc && usable) {
          discountValue =
            dc.type === "PERCENT"
              ? Math.min(Math.round((subtotal * dc.value) / 100), subtotal)
              : Math.min(dc.value, subtotal);
          appliedCode = dc.code;
          await tx.discountCode.update({
            where: { id: dc.id },
            data: { timesUsed: { increment: 1 } },
          });
        }
      }

      const breakdown = priceOrder({
        subtotal,
        method: data.paymentMethod as PaymentMethodId,
        governorate: data.governorate,
        discountValue,
      });

      const created = await tx.order.create({
        data: {
          customerName: data.customerName,
          phone: data.phone,
          altPhone: data.altPhone || null,
          governorate: data.governorate,
          address: data.address,
          notes: data.notes || null,
          paymentMethod: toPrismaMethod(data.paymentMethod as PaymentMethodId),
          status: "PENDING",
          subtotal: breakdown.subtotal,
          shipping: breakdown.shipping,
          discount: breakdown.discount,
          discountCode: appliedCode,
          codFee: breakdown.codFee,
          total: breakdown.total,
          items: {
            create: products.map((p) => ({
              productId: p.id,
              nameAr: p.nameAr,
              nameEn: p.nameEn,
              priceAtPurchase: p.price,
            })),
          },
        },
      });
      // Return the total alongside the order so the (post-commit) Paymob call
      // bills the server-authoritative amount, never a client-supplied one.
      return { ...created, _total: breakdown.total };
    });

    // Ping the owner (fire-and-forget; no-op until WHATSAPP_NOTIFY_URL is set).
    notifyOwnerOfOrder({
      id: order.id,
      customerName: order.customerName,
      phone: order.phone,
      governorate: order.governorate,
      total: order.total,
      paymentMethod: order.paymentMethod,
      itemCount: data.productIds.length,
    });

    // Card payments redirect to Paymob's hosted iFrame. The order stays PENDING
    // and its pieces RESERVED until the HMAC-verified webhook confirms payment —
    // the browser redirect is never trusted to confirm money.
    if (data.paymentMethod === "paymob") {
      try {
        const redirectUrl = await createPaymobPayment({
          merchantOrderId: order.id,
          amountCents: Math.round(order._total * 100),
          billing: {
            customerName: data.customerName,
            phone: data.phone,
            governorate: data.governorate,
            address: data.address,
          },
        });
        return Response.json({ orderId: order.id, redirectUrl });
      } catch (err) {
        // The order exists (pieces reserved) but we couldn't reach Paymob.
        // Surface the confirmation page so the buyer can retry / contact us
        // rather than losing the order entirely.
        console.error("paymob payment init failed", err);
        return Response.json({ orderId: order.id });
      }
    }

    return Response.json({ orderId: order.id });
  } catch (err) {
    if (err instanceof Error && err.message === "UNAVAILABLE") {
      return Response.json({ error: "unavailable" }, { status: 409 });
    }
    console.error("order creation failed", err);
    return Response.json({ error: "server" }, { status: 500 });
  }
}
