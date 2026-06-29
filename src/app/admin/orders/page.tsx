import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { advanceOrderStatus, approveProof, cancelOrder, isAdmin } from "@/lib/admin-actions";
import { formatPrice } from "@/lib/format";
import { AdminNav } from "@/components/admin/AdminNav";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

const STATUS_STYLE: Record<string, string> = {
  PENDING: "text-champagne",
  CONFIRMED: "text-aqua",
  SHIPPED: "text-aqua",
  DELIVERED: "text-ivory/40",
  CANCELLED: "text-red-300",
};
const NEXT_LABEL: Record<string, string> = {
  PENDING: "Confirm order",
  CONFIRMED: "Mark shipped",
  SHIPPED: "Mark delivered",
};
const METHOD_LABEL: Record<string, string> = {
  COD: "Cash on delivery",
  MANUAL_TRANSFER: "Bank transfer",
  PAYMOB: "Paymob",
};

// Normalise an Egyptian phone to wa.me international format (no "+").
function waPhone(raw: string): string {
  const d = raw.replace(/\D/g, "");
  if (d.startsWith("20")) return d;
  if (d.startsWith("0")) return "20" + d.slice(1);
  return d;
}

// Friendly Arabic confirmation the owner sends to the customer in one tap.
function customerWaHref(o: {
  id: string;
  phone: string;
  customerName: string;
  total: number;
}): string {
  const shortId = o.id.slice(-8).toUpperCase();
  const msg =
    `أهلاً ${o.customerName}\n` +
    `أكّدنا أوردرك رقم #${shortId} (${o.total} ج) والقطعة محجوزة باسمك.\n` +
    `هنرتّب التوصيل ونطمنك على المواعيد. شكراً إنك اخترتي Biolumin`;
  return `https://wa.me/${waPhone(o.phone)}?text=${encodeURIComponent(msg)}`;
}

type Props = { searchParams: Promise<{ status?: string; q?: string }> };

export default async function AdminOrdersPage({ searchParams }: Props) {
  if (!(await isAdmin())) redirect("/admin");
  const { status, q } = await searchParams;

  const all = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { items: true, proof: true },
  });

  const counts = {
    all: all.length,
    PENDING: all.filter((o) => o.status === "PENDING").length,
    CONFIRMED: all.filter((o) => o.status === "CONFIRMED").length,
    SHIPPED: all.filter((o) => o.status === "SHIPPED").length,
    DELIVERED: all.filter((o) => o.status === "DELIVERED").length,
    CANCELLED: all.filter((o) => o.status === "CANCELLED").length,
  };

  let orders = all;
  if (status && status !== "all") orders = orders.filter((o) => o.status === status);
  if (q) {
    const lq = q.toLowerCase();
    orders = orders.filter(
      (o) =>
        o.customerName.toLowerCase().includes(lq) ||
        o.phone.includes(lq) ||
        o.id.toLowerCase().includes(lq) ||
        o.governorate.toLowerCase().includes(lq),
    );
  }

  const revenue = all
    .filter((o) => o.status !== "CANCELLED")
    .reduce((s, o) => s + o.total, 0);

  const TABS = [
    { key: "all", label: "All" },
    { key: "PENDING", label: "Pending" },
    { key: "CONFIRMED", label: "Confirmed" },
    { key: "SHIPPED", label: "Shipped" },
    { key: "DELIVERED", label: "Delivered" },
    { key: "CANCELLED", label: "Cancelled" },
  ];
  const activeStatus = status ?? "all";

  function tabHref(key: string) {
    const p = new URLSearchParams();
    if (key !== "all") p.set("status", key);
    if (q) p.set("q", q);
    const s = p.toString();
    return `/admin/orders${s ? `?${s}` : ""}`;
  }

  return (
    <>
      <AdminNav active="orders" />
      <main className="mx-auto max-w-5xl px-6 py-10">
        <h1 className="font-display mb-6 text-3xl">Orders</h1>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-3 gap-3 sm:grid-cols-5">
          {[
            { label: "Revenue", value: formatPrice(revenue, "en") },
            { label: "Pending", value: counts.PENDING },
            { label: "Confirmed", value: counts.CONFIRMED },
            { label: "Shipped", value: counts.SHIPPED },
            { label: "Delivered", value: counts.DELIVERED },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-sm border border-ivory/10 bg-obsidian-soft/20 p-3 text-center">
              <p className="font-body text-[10px] uppercase tracking-[0.12em] text-ivory/40">{label}</p>
              <p className="font-display mt-0.5 text-xl text-champagne">{value}</p>
            </div>
          ))}
        </div>

        {/* Status tabs */}
        <div className="mb-4 flex flex-wrap gap-1 border-b border-ivory/10">
          {TABS.map((t) => {
            const count = counts[t.key as keyof typeof counts];
            return (
              <Link
                key={t.key}
                href={tabHref(t.key)}
                className={`font-body flex items-center gap-1.5 px-3 py-2 text-[11px] uppercase tracking-[0.12em] transition-colors border-b-2 -mb-px ${
                  activeStatus === t.key
                    ? "border-champagne text-champagne"
                    : "border-transparent text-ivory/40 hover:text-ivory"
                }`}
              >
                {t.label}
                {count > 0 && (
                  <span className={`rounded-full px-1.5 py-0.5 text-[9px] ${activeStatus === t.key ? "bg-champagne/20 text-champagne" : "bg-ivory/10 text-ivory/40"}`}>
                    {count}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Search */}
        <form method="GET" action="/admin/orders" className="mb-6 flex items-center gap-3">
          {status && <input type="hidden" name="status" value={status} />}
          <input
            name="q"
            type="search"
            defaultValue={q ?? ""}
            placeholder="Search by name, phone, or order ID…"
            className="font-body w-full max-w-sm rounded-sm border border-ivory/15 bg-obsidian-soft/40 px-3 py-2 text-sm text-ivory placeholder:text-ivory/30 focus:border-champagne/60 focus:outline-none"
          />
          <button
            type="submit"
            className="font-body rounded-full border border-ivory/20 px-4 py-2 text-[11px] uppercase tracking-[0.1em] text-ivory/60 hover:border-champagne hover:text-champagne"
          >
            Search
          </button>
          {q && (
            <Link href={tabHref(activeStatus)} className="font-body text-[11px] text-ivory/40 hover:text-ivory">
              Clear
            </Link>
          )}
          <span className="font-body ml-auto text-[11px] text-ivory/30">
            {orders.length} order{orders.length !== 1 ? "s" : ""}
          </span>
        </form>

        {orders.length === 0 ? (
          <p className="font-body text-ivory/50">No orders found.</p>
        ) : (
          <div className="space-y-4">
            {orders.map((o) => (
              <article key={o.id} className="rounded-sm border border-ivory/10 bg-obsidian-soft/40 p-5">
                {/* Header */}
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-body text-sm">
                      <span className="font-mono text-champagne">#{o.id.slice(-8).toUpperCase()}</span>
                      <span className="mx-2 text-ivory/20">·</span>
                      <span className={STATUS_STYLE[o.status]}>{o.status}</span>
                      <span className="mx-2 text-ivory/20">·</span>
                      <span className="text-ivory/40">{METHOD_LABEL[o.paymentMethod] ?? o.paymentMethod}</span>
                    </p>
                    <p className="font-body mt-1 text-xs text-ivory/70">
                      {o.customerName} · {o.phone}
                      {o.altPhone ? ` / ${o.altPhone}` : ""}
                    </p>
                    <p className="font-body mt-0.5 text-xs text-ivory/40">
                      {o.address}, {o.governorate}
                    </p>
                    {o.notes && (
                      <p className="font-body mt-0.5 text-xs italic text-ivory/30">&ldquo;{o.notes}&rdquo;</p>
                    )}
                    <p className="font-body mt-1 text-[11px] text-ivory/25">
                      {new Date(o.createdAt).toLocaleString("en-GB")}
                    </p>
                  </div>

                  {/* Price breakdown */}
                  <div className="text-right">
                    <p className="font-display text-2xl text-champagne">{formatPrice(o.total, "en")}</p>
                    <p className="font-body text-[11px] text-ivory/40">
                      Subtotal {formatPrice(o.subtotal, "en")}
                    </p>
                    {o.discount > 0 && (
                      <p className="font-body text-[11px] text-aqua">
                        {o.discountCode ? `${o.discountCode} · ` : ""}−{formatPrice(o.discount, "en")}
                      </p>
                    )}
                    {o.shipping > 0 ? (
                      <p className="font-body text-[11px] text-ivory/40">+{formatPrice(o.shipping, "en")} shipping</p>
                    ) : (
                      <p className="font-body text-[11px] text-aqua">Free shipping</p>
                    )}
                    {o.codFee > 0 && (
                      <p className="font-body text-[11px] text-ivory/40">+{formatPrice(o.codFee, "en")} COD fee</p>
                    )}
                  </div>
                </div>

                {/* Items */}
                <ul className="font-body mt-4 space-y-1 border-t border-ivory/10 pt-3 text-sm text-ivory/70">
                  {o.items.map((it) => (
                    <li key={it.id} className="flex justify-between">
                      <span>{it.nameEn}</span>
                      <span>{formatPrice(it.priceAtPurchase, "en")}</span>
                    </li>
                  ))}
                </ul>

                {/* Proof */}
                {o.proof && (
                  <div className="mt-4 flex items-center gap-4 border-t border-ivory/10 pt-3">
                    <a
                      href={o.proof.url}
                      target="_blank"
                      rel="noreferrer"
                      className="font-body text-xs uppercase tracking-[0.15em] text-aqua underline-offset-4 hover:underline"
                    >
                      View receipt
                    </a>
                    {o.proof.approved ? (
                      <span className="font-body text-xs text-aqua">Approved ✓</span>
                    ) : (
                      <form action={approveProof}>
                        <input type="hidden" name="orderId" value={o.id} />
                        <button className="font-body rounded-full border border-ivory/20 px-4 py-1.5 text-[11px] uppercase tracking-[0.15em] text-ivory/60 transition-colors hover:border-aqua hover:text-aqua">
                          Approve transfer
                        </button>
                      </form>
                    )}
                  </div>
                )}

                {/* Actions */}
                {o.status !== "CANCELLED" && (
                  <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-ivory/10 pt-3">
                    {o.status !== "DELIVERED" && (
                      <form action={advanceOrderStatus}>
                        <input type="hidden" name="id" value={o.id} />
                        <button className="font-body rounded-full bg-champagne px-5 py-2 text-[11px] uppercase tracking-[0.15em] text-obsidian transition-opacity hover:opacity-90">
                          {NEXT_LABEL[o.status]}
                        </button>
                      </form>
                    )}
                    {/* One-tap: open WhatsApp to the customer with a ready confirmation */}
                    <a
                      href={customerWaHref(o)}
                      target="_blank"
                      rel="noreferrer"
                      className="font-body inline-flex items-center gap-1.5 rounded-full border border-[#1f8a5b]/60 px-4 py-2 text-[11px] uppercase tracking-[0.12em] text-[#5fd6a0] transition-colors hover:bg-[#1f8a5b] hover:text-white"
                    >
                      <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor">
                        <path d="M12 2a10 10 0 00-8.6 15l-1.3 4.7 4.8-1.3A10 10 0 1012 2zm0 18a8 8 0 01-4.1-1.1l-.3-.2-2.8.7.7-2.8-.2-.3A8 8 0 1112 20zm4.4-6c-.2-.1-1.4-.7-1.6-.8s-.4-.1-.5.1-.6.8-.8 1-.3.2-.5.1a6.5 6.5 0 01-1.9-1.2 7.2 7.2 0 01-1.3-1.7c-.1-.2 0-.4.1-.5l.4-.4.2-.4v-.4l-.8-1.8c-.2-.5-.4-.4-.5-.4h-.5a.9.9 0 00-.7.3 2.8 2.8 0 00-.9 2.1 4.9 4.9 0 001 2.6 11.2 11.2 0 004.3 3.8c.6.3 1.1.4 1.5.5a3.6 3.6 0 001.6.1c.5-.1 1.4-.6 1.6-1.1s.2-1 .1-1.1z" />
                      </svg>
                      Message customer
                    </a>
                    {o.status !== "DELIVERED" && (
                      <form action={cancelOrder}>
                        <input type="hidden" name="id" value={o.id} />
                        <button className="font-body rounded-full border border-ivory/15 px-5 py-2 text-[11px] uppercase tracking-[0.15em] text-ivory/40 transition-colors hover:border-red-300 hover:text-red-300">
                          Cancel
                        </button>
                      </form>
                    )}
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
