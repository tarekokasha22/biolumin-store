import "server-only";
import { prisma } from "@/lib/prisma";
import type { DiscountCode } from "@prisma/client";

export type DiscountResult =
  | { ok: true; code: string; amount: number; type: "PERCENT" | "FIXED"; value: number }
  | { ok: false; reason: "NOT_FOUND" | "INACTIVE" | "EXPIRED" | "USED_UP" | "MIN_SUBTOTAL"; minSubtotal?: number };

// Pure: how much a code knocks off a given subtotal. Never exceeds subtotal.
export function discountAmount(
  type: "PERCENT" | "FIXED",
  value: number,
  subtotal: number,
): number {
  const raw = type === "PERCENT" ? Math.round((subtotal * value) / 100) : value;
  return Math.min(raw, subtotal);
}

// Validates a code against the live DB and the current subtotal. Read-only —
// redemption count is incremented atomically inside the order transaction.
export async function validateDiscount(
  rawCode: string,
  subtotal: number,
): Promise<DiscountResult> {
  const code = rawCode.trim().toUpperCase();
  if (!code) return { ok: false, reason: "NOT_FOUND" };

  const dc: DiscountCode | null = await prisma.discountCode.findUnique({
    where: { code },
  });
  if (!dc) return { ok: false, reason: "NOT_FOUND" };
  if (!dc.active) return { ok: false, reason: "INACTIVE" };
  if (dc.expiresAt && dc.expiresAt.getTime() < Date.now())
    return { ok: false, reason: "EXPIRED" };
  if (dc.maxRedemptions != null && dc.timesUsed >= dc.maxRedemptions)
    return { ok: false, reason: "USED_UP" };
  if (subtotal < dc.minSubtotal)
    return { ok: false, reason: "MIN_SUBTOTAL", minSubtotal: dc.minSubtotal };

  const type = dc.type as "PERCENT" | "FIXED";
  return {
    ok: true,
    code: dc.code,
    amount: discountAmount(type, dc.value, subtotal),
    type,
    value: dc.value,
  };
}
