import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { advanceOrderStatus, approveProof, cancelOrder, isAdmin } from "@/lib/admin-actions";
import { formatPrice } from "@/lib/format";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

const STATUS_STYLE: Record<string, string> = {
  PENDING: "bg-champagne/20 text-champagne",
  CONFIRMED: "bg-aqua/20 text-aqua",
  SHIPPED: "bg-aqua/15 text-aqua",
  DELIVERED: "bg-ivory/8 text-ivory/50",
  CANCELLED: "bg-red-400/15 text-red-300",
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

function waPhone(raw: string): string {
  const d = raw.replace(/\D/g, "");
  if (d.startsWith("20")) return d;
  if (d.startsWith("0")) return "20" + d.slice(1);
  return d;
}

function customerWaHref(o: { id: string; phone: string; customerName: string; total: number }): string {
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

  const revenue = all.filter((o) => o.status !== "CANCELLED").reduce((s, o) => s + o.total, 0);
  const todayOrders = all.filter((o) => {
    const d = new Date(o.createdAt);
    const t = new Date();
    return d.toDateString() === t.toDateString();
  }).length;
  const avgValue = all.length > 0 ? Math.round(revenue / Math.max(all.filter((o) => o.status !== "CANCELLED").length, 1)) : 0;

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

  // CSV export string
  const csvRows = [
    "ID,Customer,Phone,Governorate,Status,Payment,Total,Date",
    ...all.map((o) =>
      [
        o.id.slice(-8).toUpperCase(),
        `"${o.customerName}"`,
        o.phone,
        o.governorate,
        o.status,
        o.paymentMethod,
        o.total,
        new Date(o.createdAt).toISOString().slice(0, 10),
      ].join(","),
    ),
  ].join("\n");

  return (
    <div className="px-6 py-8 max-w-6xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-display text-3xl text-ivory">Orders</h1>
        <a
          href={`data:text/csv;charset=utf-8,${encodeURIComponent(csvRows)}`}
          download="biolumin-orders.csv"
          className="font-body rounded-full border border-ivory/15 px-4 py-2 text-[11px] uppercase tracking-[0.12em] text-ivory/50 hover:border-champagne/40 hover:text-champagne transition-colors"
        >
          Export CSV
        </a>
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Revenue", value: formatPrice(revenue, "en") },
          { label: "Avg. Value", value: formatPrice(avgValue, "en") },
          { label: "Pending", value: String(counts.PENDING) },
          { label: "Today", value: String(todayOrders) },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-xl border border-ivory/8 bg-obsidian-soft/40 p-4 text-center">
            <p className="font-body text-[10px] uppercase tracking-[0.2em] text-ivory/35">{label}</p>
            <p className="font-display mt-1 text-2xl text-champagne">{value}</p>
          </div>
        ))}
      </div>

      {/* Status tabs */}
      <div className="mb-4 flex flex-wrap gap-1 border-b border-ivory/8">
        {TABS.map((t) => {
          const count = counts[t.key as keyof typeof counts];
          return (
            <Link
              key={t.key}
              href={tabHref(t.key)}
              className={`font-body flex items-center gap-1.5 px-3 py-2.5 text-[11px] uppercase tracking-[0.12em] transition-colors border-b-2 -mb-px ${
                activeStatus === t.key
                  ? "border-champagne text-champagne"
                  : "border-transparent text-ivory/35 hover:text-ivory"
              }`}
            >
              {t.label}
              {count > 0 && (
                <span className={`rounded-full px-1.5 py-0.5 text-[9px] ${activeStatus === t.key ? "bg-champagne/20 text-champagne" : "bg-ivory/8 text-ivory/35"}`}>
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
          className="font-body w-full max-w-sm rounded-xl border border-ivory/12 bg-obsidian-soft/40 px-4 py-2.5 text-sm text-ivory placeholder:text-ivory/25 focus:border-champagne/50 focus:outline-none"
        />
        <button type="submit" className="font-body rounded-full border border-ivory/15 px-4 py-2 text-[11px] uppercase tracking-[0.1em] text-ivory/50 hover:border-champagne hover:text-champagne transition-colors">
          Search
        </button>
        {q && (
          <Link href={tabHref(activeStatus)} className="font-body text-[11px] text-ivory/35 hover:text-ivory transition-colors">
            Clear
          </Link>
        )}
        <span className="font-body ml-auto text-[11px] text-ivory/25">
          {orders.length} order{orders.length !== 1 ? "s" : ""}
        </span>
      </form>

      {orders.length === 0 ? (
        <div className="py-16 text-center">
          <p className="font-body text-ivory/40">No orders found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <article key={o.id} className="rounded-xl border border-ivory/8 bg-obsidian-soft/40 p-5 hover:border-ivory/15 transition-colors">
              {/* Header */}
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-body text-sm">
                    <span className="font-mono text-champagne">#{o.id.slice(-8).toUpperCase()}</span>
                    <span className="mx-2 text-ivory/15">·</span>
                    <span className={`text-[11px] rounded-full px-2.5 py-0.5 ${STATUS_STYLE[o.status]}`}>{o.status}</span>
                    <span className="mx-2 text-ivory/15">·</span>
                    <span className="text-ivory/35 text-xs">{METHOD_LABEL[o.paymentMethod] ?? o.paymentMethod}</span>
                  </p>
                  <p className="font-body mt-1.5 text-xs text-ivory/60">
                    {o.customerName} · {o.phone}{o.altPhone ? ` / ${o.altPhone}` : ""}
                  </p>
                  <p className="font-body mt-0.5 text-xs text-ivory/35">
                    {o.address}, {o.governorate}
                  </p>
                  {o.notes && (
                    <p className="font-body mt-0.5 text-xs italic text-ivory/25">&ldquo;{o.notes}&rdquo;</p>
                  )}
                  <p className="font-body mt-1 text-[10px] text-ivory/20">
                    {new Date(o.createdAt).toLocaleString("en-GB")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-display text-2xl text-champagne">{formatPrice(o.total, "en")}</p>
                  <p className="font-body text-[11px] text-ivory/35">Subtotal {formatPrice(o.subtotal, "en")}</p>
                  {o.discount > 0 && (
                    <p className="font-body text-[11px] text-aqua">
                      {o.discountCode ? `${o.discountCode} · ` : ""}−{formatPrice(o.discount, "en")}
                    </p>
                  )}
                  {o.shipping > 0 ? (
                    <p className="font-body text-[11px] text-ivory/35">+{formatPrice(o.shipping, "en")} shipping</p>
                  ) : (
                    <p className="font-body text-[11px] text-aqua">Free shipping</p>
                  )}
                </div>
              </div>

              {/* Items */}
              <ul className="font-body mt-4 space-y-1 border-t border-ivory/6 pt-3 text-sm text-ivory/60">
                {o.items.map((it) => (
                  <li key={it.id} className="flex justify-between">
                    <span>{it.nameEn}</span>
                    <span>{formatPrice(it.priceAtPurchase, "en")}</span>
                  </li>
                ))}
              </ul>

              {/* Proof */}
              {o.proof && (
                <div className="mt-4 flex items-center gap-4 border-t border-ivory/6 pt-3">
                  <a href={o.proof.url} target="_blank" rel="noreferrer" className="font-body text-xs uppercase tracking-[0.15em] text-aqua underline-offset-4 hover:underline">
                    View receipt
                  </a>
                  {o.proof.approved ? (
                    <span className="font-body text-xs text-aqua">Approved ✓</span>
                  ) : (
                    <form action={approveProof}>
                      <input type="hidden" name="orderId" value={o.id} />
                      <button className="font-body rounded-full border border-ivory/15 px-4 py-1.5 text-[11px] uppercase tracking-[0.12em] text-ivory/50 hover:border-aqua hover:text-aqua transition-colors">
                        Approve transfer
                      </button>
                    </form>
                  )}
                </div>
              )}

              {/* Actions */}
              {o.status !== "CANCELLED" && (
                <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-ivory/6 pt-3">
                  {o.status !== "DELIVERED" && (
                    <form action={advanceOrderStatus}>
                      <input type="hidden" name="id" value={o.id} />
                      <button className="font-body rounded-full bg-champagne px-5 py-2 text-[11px] uppercase tracking-[0.15em] text-obsidian transition-opacity hover:opacity-90">
                        {NEXT_LABEL[o.status]}
                      </button>
                    </form>
                  )}
                  <a
                    href={customerWaHref(o)}
                    target="_blank"
                    rel="noreferrer"
                    className="font-body inline-flex items-center gap-1.5 rounded-full border border-[#1f8a5b]/50 px-4 py-2 text-[11px] uppercase tracking-[0.1em] text-[#5fd6a0] hover:bg-[#1f8a5b] hover:text-white transition-colors"
                  >
                    <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor">
                      <path d="M12 2a10 10 0 00-8.6 15l-1.3 4.7 4.8-1.3A10 10 0 1012 2zm0 18a8 8 0 01-4.1-1.1l-.3-.2-2.8.7.7-2.8-.2-.3A8 8 0 1112 20zm4.4-6c-.2-.1-1.4-.7-1.6-.8s-.4-.1-.5.1-.6.8-.8 1-.3.2-.5.1a6.5 6.5 0 01-1.9-1.2 7.2 7.2 0 01-1.3-1.7c-.1-.2 0-.4.1-.5l.4-.4.2-.4v-.4l-.8-1.8c-.2-.5-.4-.4-.5-.4h-.5a.9.9 0 00-.7.3 2.8 2.8 0 00-.9 2.1 4.9 4.9 0 001 2.6 11.2 11.2 0 004.3 3.8c.6.3 1.1.4 1.5.5a3.6 3.6 0 001.6.1c.5-.1 1.4-.6 1.6-1.1s.2-1 .1-1.1z" />
                    </svg>
                    Message customer
                  </a>
                  {o.status !== "DELIVERED" && (
                    <form action={cancelOrder}>
                      <input type="hidden" name="id" value={o.id} />
                      <button className="font-body rounded-full border border-ivory/12 px-4 py-2 text-[11px] uppercase tracking-[0.12em] text-ivory/35 hover:border-red-300 hover:text-red-300 transition-colors">
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
    </div>
  );
}
