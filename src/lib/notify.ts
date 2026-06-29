import "server-only";

// ── Owner order alerts ────────────────────────────────────────────────────────
// When an order is placed the owner wants to know instantly — they run the shop
// from their phone. True WhatsApp push needs the paid Business API, so this is
// pluggable: set WHATSAPP_NOTIFY_URL to any webhook that forwards a message
// (CallMeBot, Make/Zapier, n8n, a tiny WhatsApp-API relay…). Until it's set,
// notifications are a no-op — the owner still sees every order in /admin/orders.
//
// The call is fire-and-forget: a flaky notifier must never fail or slow a sale.

type OrderAlert = {
  id: string;
  customerName: string;
  phone: string;
  governorate: string;
  total: number;
  paymentMethod: string;
  itemCount: number;
};

const METHOD_LABEL: Record<string, string> = {
  COD: "Cash on delivery",
  MANUAL_TRANSFER: "InstaPay / Wallet",
  PAYMOB: "Card (Paymob)",
};

function buildMessage(o: OrderAlert): string {
  const ref = o.id.slice(-8).toUpperCase();
  const method = METHOD_LABEL[o.paymentMethod] ?? o.paymentMethod;
  return [
    `🟢 New Biolumin order #${ref}`,
    `${o.customerName} — ${o.phone}`,
    `${o.governorate} · ${o.itemCount} piece(s)`,
    `${method} · ${o.total} EGP`,
  ].join("\n");
}

export function notifyOwnerOfOrder(order: OrderAlert): void {
  const url = process.env.WHATSAPP_NOTIFY_URL;
  if (!url) return;

  const message = buildMessage(order);
  // The notify URL may use {message} as a placeholder (CallMeBot-style GET) or
  // accept a JSON body (Make/Zapier-style POST). We support both: if the URL
  // contains the token we substitute and GET, otherwise we POST JSON.
  const fire = url.includes("{message}")
    ? fetch(url.replace("{message}", encodeURIComponent(message)), {
        cache: "no-store",
      })
    : fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, order }),
        cache: "no-store",
      });

  // Never await; swallow failures so checkout is never affected.
  fire.catch((err) => console.error("owner notify failed", err));
}
