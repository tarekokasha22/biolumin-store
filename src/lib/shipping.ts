import { zoneForGovernorate, type ShippingZone } from "@/lib/governorates";

// Single source of truth for delivery money + timing. Imported by both the
// client checkout (live quote as the customer types) and the server order
// route (final authority). Keep it pure — no DB, no server-only deps.

const num = (v: string | undefined, fallback: number) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

// Per-zone courier fee (EGP) and estimated delivery window (business days).
const ZONES: Record<
  ShippingZone,
  { fee: number; minDays: number; maxDays: number }
> = {
  CAIRO: { fee: num(process.env.NEXT_PUBLIC_SHIP_CAIRO, 50), minDays: 2, maxDays: 5 },
  DELTA: { fee: num(process.env.NEXT_PUBLIC_SHIP_DELTA, 50), minDays: 2, maxDays: 5 },
  CANAL: { fee: num(process.env.NEXT_PUBLIC_SHIP_CANAL, 70), minDays: 2, maxDays: 5 },
  UPPER: { fee: num(process.env.NEXT_PUBLIC_SHIP_UPPER, 85), minDays: 2, maxDays: 5 },
  REMOTE: { fee: num(process.env.NEXT_PUBLIC_SHIP_REMOTE, 110), minDays: 2, maxDays: 5 },
};

// Spend this much (in EGP, on subtotal) and shipping is on us.
export const FREE_SHIP_THRESHOLD = num(
  process.env.NEXT_PUBLIC_FREE_SHIP_THRESHOLD,
  1000,
);

// No handling fee on any payment method — customers only ever pay delivery.
export const COD_FEE = num(process.env.NEXT_PUBLIC_COD_FEE, 0);

// Upfront-payment incentive: a small % off subtotal for prepaid methods
// (InstaPay / wallet / card), on top of free shipping. Turns prepaying into a
// visible reward instead of COD feeling "free". 0.05 = 5% — override with
// NEXT_PUBLIC_PREPAID_DISCOUNT in the environment.
export const PREPAID_DISCOUNT = num(
  process.env.NEXT_PUBLIC_PREPAID_DISCOUNT,
  0.05,
);

// Pure: the prepaid incentive amount for a given subtotal.
export function prepaidDiscountAmount(subtotal: number, prepaid: boolean): number {
  return prepaid ? Math.round(subtotal * PREPAID_DISCOUNT) : 0;
}

export type ShippingQuote = {
  zone: ShippingZone;
  baseFee: number; // un-discounted courier fee for this zone
  fee: number; // what the customer actually pays for shipping
  freeShipping: boolean;
  reason: "threshold" | "prepaid" | null; // why shipping was waived
  minDays: number;
  maxDays: number;
};

// Free shipping kicks in past the subtotal threshold — same rule for every
// payment method (no online/COD surcharges). `prepaid` is kept in the
// signature for callers but no longer changes the delivery price.
export function quoteShipping(
  governorateEn: string,
  subtotal: number,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  prepaid: boolean,
): ShippingQuote {
  const zone = zoneForGovernorate(governorateEn);
  const z = ZONES[zone];
  const overThreshold = subtotal >= FREE_SHIP_THRESHOLD;
  const freeShipping = overThreshold;
  const reason = overThreshold ? "threshold" : null;
  return {
    zone,
    baseFee: z.fee,
    fee: freeShipping ? 0 : z.fee,
    freeShipping,
    reason,
    minDays: z.minDays,
    maxDays: z.maxDays,
  };
}

// How much more to spend to unlock free shipping (0 once unlocked).
export function amountToFreeShipping(subtotal: number): number {
  return Math.max(0, FREE_SHIP_THRESHOLD - subtotal);
}
