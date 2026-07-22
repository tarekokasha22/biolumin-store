import Link from "next/link";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { ProductSearch } from "@/components/admin/ProductSearch";
import { CategoryFilter } from "@/components/admin/CategoryFilter";
import { formatPrice } from "@/lib/format";
import { isAdmin, setProductStatus } from "@/lib/admin-actions";
import { redirect } from "next/navigation";
import { CATEGORY_LABELS } from "@/lib/categories";

export const dynamic = "force-dynamic";

const STATUS_DOT: Record<string, string> = {
  AVAILABLE: "bg-aqua",
  RESERVED: "bg-champagne",
  SOLD: "bg-ivory/20",
};
const STATUS_LABEL: Record<string, string> = {
  AVAILABLE: "Available",
  RESERVED: "Reserved",
  SOLD: "Sold",
};
const STATUS_TEXT: Record<string, string> = {
  AVAILABLE: "text-aqua",
  RESERVED: "text-champagne",
  SOLD: "text-ivory/30",
};

type Props = { searchParams: Promise<{ status?: string; category?: string; q?: string }> };

export default async function AdminProductsPage({ searchParams }: Props) {
  if (!(await isAdmin())) redirect("/admin");
  const { status, category, q } = await searchParams;

  const all = await prisma.product.findMany({
    orderBy: [{ status: "asc" }, { sortOrder: "desc" }, { createdAt: "desc" }],
    include: { images: { orderBy: { order: "asc" }, take: 1 }, drop: true },
  });

  const counts = {
    all: all.length,
    AVAILABLE: all.filter((p) => p.status === "AVAILABLE").length,
    RESERVED: all.filter((p) => p.status === "RESERVED").length,
    SOLD: all.filter((p) => p.status === "SOLD").length,
  };

  let products = all;
  if (status && status !== "all") products = products.filter((p) => p.status === status);
  if (category && category !== "all") products = products.filter((p) => p.category === category);
  if (q) {
    const lq = q.toLowerCase();
    products = products.filter(
      (p) =>
        p.nameEn.toLowerCase().includes(lq) ||
        p.nameAr.includes(lq) ||
        p.size.toLowerCase().includes(lq),
    );
  }

  const TABS = [
    { key: "all", label: "All", count: counts.all },
    { key: "AVAILABLE", label: "Available", count: counts.AVAILABLE },
    { key: "RESERVED", label: "Reserved", count: counts.RESERVED },
    { key: "SOLD", label: "Sold", count: counts.SOLD },
  ];

  const categories = Object.entries(CATEGORY_LABELS);
  const activeStatus = status ?? "all";
  const activeCategory = category ?? "all";

  function tabHref(key: string) {
    const p = new URLSearchParams();
    if (key !== "all") p.set("status", key);
    if (category && category !== "all") p.set("category", category);
    if (q) p.set("q", q);
    const s = p.toString();
    return `/admin/products${s ? `?${s}` : ""}`;
  }

  return (
    <div className="px-6 py-8 max-w-7xl mx-auto">
      {/* Top bar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-3xl text-ivory">Products</h1>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/products/sorting"
            className="font-body rounded-full border border-ivory/15 px-4 py-2 text-[11px] uppercase tracking-[0.15em] text-ivory/50 hover:border-champagne/40 hover:text-champagne transition-colors flex items-center gap-1.5"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
              <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
            </svg>
            Manage Order
          </Link>
          <Link
            href="/admin/products/new"
            className="font-body rounded-full bg-champagne px-5 py-2 text-[11px] uppercase tracking-[0.18em] text-obsidian transition-opacity hover:opacity-90"
          >
            + Add Product
          </Link>
        </div>
      </div>

      {/* Status tabs */}
      <div className="mb-4 flex gap-1 border-b border-ivory/8">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={tabHref(t.key)}
            className={`font-body flex items-center gap-1.5 px-4 py-2.5 text-[11px] uppercase tracking-[0.13em] transition-colors border-b-2 -mb-px ${
              activeStatus === t.key
                ? "border-champagne text-champagne"
                : "border-transparent text-ivory/35 hover:text-ivory"
            }`}
          >
            {t.label}
            <span className={`rounded-full px-1.5 py-0.5 text-[9px] ${activeStatus === t.key ? "bg-champagne/20 text-champagne" : "bg-ivory/8 text-ivory/35"}`}>
              {t.count}
            </span>
          </Link>
        ))}
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Suspense fallback={null}><ProductSearch /></Suspense>
        <Suspense fallback={null}>
          <CategoryFilter activeCategory={activeCategory} categories={categories} />
        </Suspense>
        {(activeStatus !== "all" || activeCategory !== "all" || q) && (
          <Link href="/admin/products" className="font-body text-[11px] text-ivory/35 hover:text-ivory underline-offset-2 hover:underline">
            Clear filters
          </Link>
        )}
        <span className="font-body ml-auto text-[11px] text-ivory/25">
          {products.length} result{products.length !== 1 ? "s" : ""}
        </span>
      </div>

      {products.length === 0 ? (
        <div className="py-16 text-center">
          <p className="font-body text-ivory/40">No products found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-ivory/8">
          <table className="w-full min-w-[680px] text-left">
            <thead className="font-body bg-obsidian-soft/60 text-[10px] uppercase tracking-[0.13em] text-ivory/35">
              <tr>
                <th className="px-5 py-3.5">Product</th>
                <th className="px-5 py-3.5">Category</th>
                <th className="px-5 py-3.5">Price</th>
                <th className="px-5 py-3.5">Drop</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="font-body divide-y divide-ivory/6 text-sm">
              {products.map((p) => (
                <tr key={p.id} className="group hover:bg-ivory/3 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      {p.images[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.images[0].url} alt="" className="h-14 w-11 rounded-lg object-cover shrink-0" />
                      ) : (
                        <div className="h-14 w-11 rounded-lg bg-obsidian-raised shrink-0 flex items-center justify-center">
                          <span className="text-[9px] text-ivory/20">No img</span>
                        </div>
                      )}
                      <div>
                        <p className="text-ivory">{p.nameEn}</p>
                        <p className="text-[11px] text-ivory/35">{p.nameAr}</p>
                        <p className="text-[11px] text-ivory/25">{p.size}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-ivory/55 capitalize">{p.category}</td>
                  <td className="px-5 py-3.5">
                    <p className="text-ivory/80">{formatPrice(p.price, "en")}</p>
                    {p.compareAtPrice && (
                      <p className="text-[11px] text-ivory/25 line-through">{formatPrice(p.compareAtPrice, "en")}</p>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-ivory/35 text-xs">
                    {p.drop ? `#${p.drop.number}` : "—"}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="flex items-center gap-1.5">
                      <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[p.status]}`} />
                      <span className={STATUS_TEXT[p.status]}>{STATUS_LABEL[p.status]}</span>
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-2">
                      <form action={setProductStatus}>
                        <input type="hidden" name="id" value={p.id} />
                        <input type="hidden" name="status"
                          value={p.status === "AVAILABLE" ? "RESERVED" : p.status === "RESERVED" ? "SOLD" : "AVAILABLE"}
                        />
                        <button className="font-body rounded-full border border-ivory/12 px-3 py-1 text-[10px] uppercase tracking-[0.1em] text-ivory/35 opacity-0 transition-all group-hover:opacity-100 hover:border-ivory/35 hover:text-ivory">
                          {p.status === "AVAILABLE" ? "→ Reserve" : p.status === "RESERVED" ? "→ Sold" : "→ Available"}
                        </button>
                      </form>
                      <Link
                        href={`/admin/products/${p.id}/edit`}
                        className="font-body rounded-full border border-ivory/15 px-4 py-1.5 text-[11px] uppercase tracking-[0.12em] text-ivory/60 transition-colors hover:border-champagne hover:text-champagne"
                      >
                        Edit
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
