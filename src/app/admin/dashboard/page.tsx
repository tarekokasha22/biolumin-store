import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin-actions";
import { formatPrice } from "@/lib/format";
import {
  getOverviewStats,
  getDailyRevenue,
  getOrderStatusCounts,
  getGeographicBreakdown,
  getTopProducts,
  getRecentOrders,
  getPaymentMethodStats,
} from "@/lib/admin-analytics";
import { KpiCard } from "@/components/admin/KpiCard";
import { BarChart } from "@/components/admin/charts/BarChart";
import { DonutChart } from "@/components/admin/charts/DonutChart";

export const dynamic = "force-dynamic";

const STATUS_STYLE: Record<string, string> = {
  PENDING: "bg-champagne/20 text-champagne",
  CONFIRMED: "bg-aqua/20 text-aqua",
  SHIPPED: "bg-aqua/15 text-aqua",
  DELIVERED: "bg-ivory/10 text-ivory/60",
  CANCELLED: "bg-red-400/15 text-red-300",
};

const METHOD_LABEL: Record<string, string> = {
  COD: "Cash",
  MANUAL_TRANSFER: "Transfer",
  PAYMOB: "Card",
};

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default async function AdminDashboardPage() {
  if (!(await isAdmin())) redirect("/admin");

  const [stats, dailyRevenue, statusCounts, geo, topProducts, recentOrders, paymentStats] =
    await Promise.all([
      getOverviewStats(),
      getDailyRevenue(30),
      getOrderStatusCounts(),
      getGeographicBreakdown(),
      getTopProducts(5),
      getRecentOrders(8),
      getPaymentMethodStats(),
    ]);

  const revenueSpark = dailyRevenue.slice(-14).map((d) => d.revenue);
  const orderTotal =
    statusCounts.PENDING +
    statusCounts.CONFIRMED +
    statusCounts.SHIPPED +
    statusCounts.DELIVERED +
    statusCounts.CANCELLED;

  const donutSegments = [
    { label: "Pending", value: statusCounts.PENDING, color: "#c9a66b" },
    { label: "Confirmed", value: statusCounts.CONFIRMED, color: "#48d6c2" },
    { label: "Shipped", value: statusCounts.SHIPPED, color: "#6de8d8" },
    { label: "Delivered", value: statusCounts.DELIVERED, color: "rgba(244,240,233,0.35)" },
    { label: "Cancelled", value: statusCounts.CANCELLED, color: "rgba(252,165,165,0.6)" },
  ];

  const geoMax = geo[0]?.count ?? 1;

  const totalPaymentOrders =
    (paymentStats.COD?.count ?? 0) +
    (paymentStats.MANUAL_TRANSFER?.count ?? 0) +
    (paymentStats.PAYMOB?.count ?? 0);

  return (
    <div className="px-6 py-8 max-w-7xl mx-auto space-y-8">

      {/* ── Page Header ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-ivory">Dashboard</h1>
          <p className="font-body mt-1 text-[12px] text-ivory/35 tracking-wide">
            {new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        {stats.pendingOrders > 0 && (
          <a
            href="/admin/orders?status=PENDING"
            className="font-body flex items-center gap-2 rounded-full border border-champagne/30 bg-champagne/10 px-4 py-2 text-[11px] uppercase tracking-[0.15em] text-champagne hover:bg-champagne/20 transition-colors"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-champagne animate-pulse" />
            {stats.pendingOrders} pending order{stats.pendingOrders !== 1 ? "s" : ""}
          </a>
        )}
      </div>

      {/* ── KPI Cards ───────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard
          label="Total Revenue"
          value={formatPrice(stats.totalRevenue, "en")}
          sub={`This month: ${formatPrice(stats.thisMonthRevenue, "en")}`}
          change={stats.revenueChange}
          sparkData={revenueSpark}
          sparkColor="#c9a66b"
          accent="champagne"
        />
        <KpiCard
          label="Total Orders"
          value={String(stats.totalOrders)}
          sub={`This month: ${stats.thisMonthOrderCount}`}
          change={stats.ordersChange}
          sparkData={revenueSpark.map((v, i, a) => (i > 0 && a[i - 1] > 0 ? 1 : v > 0 ? 1 : 0))}
          sparkColor="#48d6c2"
          accent="aqua"
        />
        <KpiCard
          label="Active Products"
          value={String(stats.availableProducts)}
          sub={`${stats.soldProducts} sold · ${stats.totalProducts} total`}
          accent="ivory"
        />
        <KpiCard
          label="Avg. Order Value"
          value={formatPrice(stats.avgOrderValue, "en")}
          sub={`${stats.subscribers} subscribers`}
          accent="champagne"
        />
      </div>

      {/* ── Revenue Chart + Order Status ────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

        {/* Revenue Chart */}
        <div className="lg:col-span-2 rounded-xl border border-ivory/8 bg-obsidian-soft/60 backdrop-blur p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="font-body text-[11px] uppercase tracking-[0.25em] text-ivory/40">
                Revenue
              </h2>
              <p className="font-display mt-0.5 text-2xl text-champagne">
                {formatPrice(stats.totalRevenue, "en")}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <span className="font-body text-[10px] text-ivory/30">Last 30 days</span>
            </div>
          </div>
          <BarChart data={dailyRevenue} height={140} />
        </div>

        {/* Order Status Donut */}
        <div className="rounded-xl border border-ivory/8 bg-obsidian-soft/60 backdrop-blur p-6 flex flex-col">
          <h2 className="font-body text-[11px] uppercase tracking-[0.25em] text-ivory/40 mb-5">
            Order Status
          </h2>
          <div className="flex-1 flex items-center justify-center">
            <DonutChart segments={donutSegments} total={orderTotal} />
          </div>
        </div>
      </div>

      {/* ── Recent Orders + Top Products ────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

        {/* Recent Orders */}
        <div className="lg:col-span-2 rounded-xl border border-ivory/8 bg-obsidian-soft/60 backdrop-blur p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-body text-[11px] uppercase tracking-[0.25em] text-ivory/40">Recent Orders</h2>
            <a href="/admin/orders" className="font-body text-[10px] text-ivory/30 hover:text-champagne transition-colors">
              View all →
            </a>
          </div>
          <div className="space-y-2">
            {recentOrders.length === 0 ? (
              <p className="font-body text-sm text-ivory/30 py-4 text-center">No orders yet.</p>
            ) : (
              recentOrders.map((o) => (
                <div
                  key={o.id}
                  className="flex items-center justify-between gap-3 rounded-lg px-4 py-3 hover:bg-ivory/4 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] text-champagne/80">
                        #{o.id.slice(-6).toUpperCase()}
                      </span>
                      <span
                        className={`font-body text-[9px] uppercase tracking-[0.1em] rounded-full px-2 py-0.5 ${STATUS_STYLE[o.status]}`}
                      >
                        {o.status}
                      </span>
                    </div>
                    <p className="font-body text-xs text-ivory/60 mt-0.5 truncate">
                      {o.customerName} · {o.governorate} · {METHOD_LABEL[o.paymentMethod]}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-body text-sm text-ivory">{formatPrice(o.total, "en")}</p>
                    <p className="font-body text-[10px] text-ivory/30">{timeAgo(new Date(o.createdAt))}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top Products */}
        <div className="rounded-xl border border-ivory/8 bg-obsidian-soft/60 backdrop-blur p-6">
          <h2 className="font-body text-[11px] uppercase tracking-[0.25em] text-ivory/40 mb-4">
            Top Products
          </h2>
          <div className="space-y-3">
            {topProducts.length === 0 ? (
              <p className="font-body text-sm text-ivory/30 py-4 text-center">No sales yet.</p>
            ) : (
              topProducts.map((p, i) => (
                <div key={p.id} className="flex items-center gap-3">
                  {p.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.image}
                      alt=""
                      className="h-10 w-8 rounded object-cover shrink-0"
                    />
                  ) : (
                    <div className="h-10 w-8 rounded bg-obsidian-raised shrink-0 flex items-center justify-center">
                      <span className="font-body text-[9px] text-ivory/20">{i + 1}</span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-body text-xs text-ivory truncate">{p.nameEn}</p>
                    <p className="font-body text-[10px] text-ivory/35">
                      {p.unitsSold} sold
                    </p>
                  </div>
                  <p className="font-body text-xs text-champagne shrink-0">
                    {formatPrice(p.revenue, "en")}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ── Geography + Payment Methods ─────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

        {/* Geographic Breakdown */}
        <div className="rounded-xl border border-ivory/8 bg-obsidian-soft/60 backdrop-blur p-6">
          <h2 className="font-body text-[11px] uppercase tracking-[0.25em] text-ivory/40 mb-5">
            Orders by Region
          </h2>
          {geo.length === 0 ? (
            <p className="font-body text-sm text-ivory/30 py-4 text-center">No data yet.</p>
          ) : (
            <div className="space-y-3">
              {geo.map((g) => {
                const pct = Math.round((g.count / geoMax) * 100);
                return (
                  <div key={g.governorate}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-body text-xs text-ivory/70">{g.governorate}</span>
                      <div className="flex items-center gap-3">
                        <span className="font-body text-[10px] text-ivory/35">{g.count} orders</span>
                        <span className="font-body text-[10px] text-champagne">
                          {formatPrice(g.revenue, "en")}
                        </span>
                      </div>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-ivory/6 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-champagne to-champagne-bright transition-all duration-700"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Payment Methods */}
        <div className="rounded-xl border border-ivory/8 bg-obsidian-soft/60 backdrop-blur p-6">
          <h2 className="font-body text-[11px] uppercase tracking-[0.25em] text-ivory/40 mb-5">
            Payment Methods
          </h2>
          <div className="space-y-4">
            {[
              { key: "COD", label: "Cash on Delivery", color: "#c9a66b" },
              { key: "MANUAL_TRANSFER", label: "Bank / Wallet Transfer", color: "#48d6c2" },
              { key: "PAYMOB", label: "Paymob Card", color: "#8a8175" },
            ].map(({ key, label, color }) => {
              const data = paymentStats[key] ?? { count: 0, revenue: 0 };
              const pct =
                totalPaymentOrders > 0 ? Math.round((data.count / totalPaymentOrders) * 100) : 0;
              return (
                <div key={key}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full shrink-0" style={{ background: color }} />
                      <span className="font-body text-xs text-ivory/70">{label}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-body text-[10px] text-ivory/35">
                        {data.count} order{data.count !== 1 ? "s" : ""}
                      </span>
                      <span className="font-body text-[10px] font-semibold" style={{ color }}>
                        {pct}%
                      </span>
                    </div>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-ivory/6 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, background: color }}
                    />
                  </div>
                  <p className="font-body mt-1 text-[10px] text-ivory/25">
                    {formatPrice(data.revenue, "en")} revenue
                  </p>
                </div>
              );
            })}
          </div>

          {/* Quick links */}
          <div className="mt-6 pt-4 border-t border-ivory/8 grid grid-cols-3 gap-2">
            {[
              { href: "/admin/orders", label: "All Orders" },
              { href: "/admin/products", label: "Products" },
              { href: "/admin/discounts", label: "Discounts" },
            ].map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="font-body text-center rounded-lg border border-ivory/10 px-2 py-2 text-[10px] uppercase tracking-[0.12em] text-ivory/40 hover:border-champagne/30 hover:text-champagne transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
