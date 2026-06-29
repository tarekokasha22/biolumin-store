import "server-only";
import { quoteShipping, COD_FEE, prepaidDiscountAmount } from "@/lib/shipping";
import { paymobConfigured } from "@/lib/payments/paymob";

export type PaymentMethodId = "cod" | "manual_transfer" | "paymob";

export type PaymentMethodInfo = {
  id: PaymentMethodId;
  requiresProof: boolean;
  prepaid: boolean;
};

// Paymob is only offered when its credentials exist — the factory omits it
// otherwise, so the rest of the app needs no rebuild when keys are added.
export function paymobEnabled(): boolean {
  return paymobConfigured();
}

export function availablePaymentMethods(): PaymentMethodInfo[] {
  const methods: PaymentMethodInfo[] = [
    { id: "cod", requiresProof: false, prepaid: false },
    { id: "manual_transfer", requiresProof: true, prepaid: true },
  ];
  if (paymobEnabled()) {
    methods.push({ id: "paymob", requiresProof: false, prepaid: true });
  }
  return methods;
}

// Maps the wire id to the Prisma PaymentMethod enum.
export function toPrismaMethod(
  id: PaymentMethodId,
): "COD" | "MANUAL_TRANSFER" | "PAYMOB" {
  if (id === "cod") return "COD";
  if (id === "manual_transfer") return "MANUAL_TRANSFER";
  return "PAYMOB";
}

export type PriceBreakdown = {
  subtotal: number;
  shipping: number;
  shippingFree: boolean;
  discount: number; // code discount + prepaid incentive combined
  codeDiscount: number;
  prepaidDiscount: number;
  codFee: number;
  total: number;
  etaMinDays: number;
  etaMaxDays: number;
};

// Server is the source of truth for money. Shipping is per-governorate (free
// when prepaid or over the threshold); COD adds a handling fee; prepaid earns
// a small incentive; a validated discount code reduces the subtotal further.
export function priceOrder(args: {
  subtotal: number;
  method: PaymentMethodId;
  governorate: string;
  discountValue?: number;
}): PriceBreakdown {
  const { subtotal, method, governorate, discountValue = 0 } = args;
  const prepaid = method === "manual_transfer" || method === "paymob";
  const prepaidDiscount = prepaidDiscountAmount(subtotal, prepaid);
  const codeDiscount = Math.min(Math.max(0, discountValue), subtotal);
  const discount = Math.min(codeDiscount + prepaidDiscount, subtotal);
  const ship = quoteShipping(governorate, subtotal, prepaid);
  const codFee = method === "cod" ? COD_FEE : 0;
  const total = subtotal - discount + ship.fee + codFee;
  return {
    subtotal,
    shipping: ship.fee,
    shippingFree: ship.freeShipping,
    discount,
    codeDiscount,
    prepaidDiscount,
    codFee,
    total,
    etaMinDays: ship.minDays,
    etaMaxDays: ship.maxDays,
  };
}
