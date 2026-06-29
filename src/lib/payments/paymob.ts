import "server-only";
import { createHmac } from "crypto";

// ── Paymob (Accept) card-payment integration ─────────────────────────────────
// Flow: auth token → register order → request payment key → redirect the buyer
// to the hosted iFrame. Payment is confirmed server-side by the HMAC-verified
// "Transaction processed" webhook, never by the browser redirect.

const BASE = "https://accept.paymob.com/api";

export function paymobConfigured(): boolean {
  return Boolean(
    process.env.PAYMOB_API_KEY &&
      process.env.PAYMOB_HMAC &&
      process.env.PAYMOB_INTEGRATION_ID &&
      process.env.PAYMOB_IFRAME_ID,
  );
}

type BillingData = {
  customerName: string;
  phone: string;
  governorate: string;
  address: string;
};

function splitName(full: string): { first: string; last: string } {
  const parts = full.trim().split(/\s+/);
  if (parts.length === 1) return { first: parts[0] || "NA", last: "NA" };
  return { first: parts[0], last: parts.slice(1).join(" ") };
}

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Paymob ${url} ${res.status}: ${text.slice(0, 300)}`);
  }
  return res.json() as Promise<T>;
}

/**
 * Builds a Paymob payment and returns the hosted iFrame URL to redirect to.
 * `merchantOrderId` is our own order id — it comes back on the webhook so we
 * can correlate the payment to the order.
 */
export async function createPaymobPayment(args: {
  merchantOrderId: string;
  amountCents: number;
  billing: BillingData;
}): Promise<string> {
  const apiKey = process.env.PAYMOB_API_KEY!;
  const integrationId = Number(process.env.PAYMOB_INTEGRATION_ID);
  const iframeId = process.env.PAYMOB_IFRAME_ID!;

  // 1. Auth token
  const auth = await postJson<{ token: string }>(`${BASE}/auth/tokens`, {
    api_key: apiKey,
  });

  // 2. Register the order with Paymob (idempotent via merchant_order_id)
  const order = await postJson<{ id: number }>(`${BASE}/ecommerce/orders`, {
    auth_token: auth.token,
    delivery_needed: false,
    amount_cents: args.amountCents,
    currency: "EGP",
    merchant_order_id: args.merchantOrderId,
    items: [],
  });

  // 3. Payment key (binds amount + order + integration + billing)
  const { first, last } = splitName(args.billing.customerName);
  const key = await postJson<{ token: string }>(
    `${BASE}/acceptance/payment_keys`,
    {
      auth_token: auth.token,
      amount_cents: args.amountCents,
      expiration: 3600,
      order_id: order.id,
      currency: "EGP",
      integration_id: integrationId,
      billing_data: {
        first_name: first,
        last_name: last,
        email: "customer@biolumin.store",
        phone_number: args.billing.phone,
        apartment: "NA",
        floor: "NA",
        street: args.billing.address || "NA",
        building: "NA",
        shipping_method: "NA",
        postal_code: "NA",
        city: args.billing.governorate || "NA",
        country: "EG",
        state: args.billing.governorate || "NA",
      },
    },
  );

  return `${BASE}/acceptance/iframes/${iframeId}?payment_token=${key.token}`;
}

// ── Webhook HMAC verification ────────────────────────────────────────────────
// Paymob signs each callback by concatenating these 20 fields (in this exact
// lexicographic order) and hashing with HMAC-SHA512. We recompute and compare.
type PaymobTxnObj = {
  amount_cents: number | string;
  created_at: string;
  currency: string;
  error_occured: boolean;
  has_parent_transaction: boolean;
  id: number | string;
  integration_id: number | string;
  is_3d_secure: boolean;
  is_auth: boolean;
  is_capture: boolean;
  is_refunded: boolean;
  is_standalone_payment: boolean;
  is_voided: boolean;
  order: { id: number | string; merchant_order_id?: string | null };
  owner: number | string;
  pending: boolean;
  source_data: { pan: string; sub_type: string; type: string };
  success: boolean;
};

export function verifyPaymobHmac(obj: PaymobTxnObj, received: string): boolean {
  const secret = process.env.PAYMOB_HMAC;
  if (!secret || !received) return false;

  const concatenated = [
    obj.amount_cents,
    obj.created_at,
    obj.currency,
    obj.error_occured,
    obj.has_parent_transaction,
    obj.id,
    obj.integration_id,
    obj.is_3d_secure,
    obj.is_auth,
    obj.is_capture,
    obj.is_refunded,
    obj.is_standalone_payment,
    obj.is_voided,
    obj.order?.id,
    obj.owner,
    obj.pending,
    obj.source_data?.pan,
    obj.source_data?.sub_type,
    obj.source_data?.type,
    obj.success,
  ]
    .map((v) => String(v))
    .join("");

  const expected = createHmac("sha512", secret)
    .update(concatenated)
    .digest("hex");

  return expected === received.toLowerCase();
}

export type { PaymobTxnObj };
