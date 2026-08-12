"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ProductCard } from "./ProductCard";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { categoryLabel } from "@/lib/categories";
import type { RatingSummary } from "@/lib/reviews";

export type ShopProduct = {
  id: string;
  slug: string;
  nameAr: string;
  nameEn: string;
  price: number;
  compareAtPrice?: number | null;
  image: string;
  status: "AVAILABLE" | "RESERVED" | "SOLD";
  category: string;
  size: string;
  ratingSummary?: RatingSummary;
};

type SortKey = "featured" | "price-asc" | "price-desc";

export function ShopGrid({ products }: { products: ShopProduct[] }) {
  const t = useTranslations("shop");
  const locale = useLocale();
  const [category, setCategory] = useState<string>("__all");
  const [size, setSize] = useState<string>("__all");
  const [sortBy, setSortBy] = useState<SortKey>("featured");
  const [sortOpen, setSortOpen] = useState(false);

  // Category chips in DB display-order, deduped — mirrors the shop taxonomy
  // (dresses, blouses, shoes…) rather than a flat available/all toggle.
  const categories = useMemo(() => {
    const map = new Map<string, string>();
    for (const p of products) map.set(p.category, categoryLabel(p.category, locale));
    return Array.from(map, ([value, label]) => ({ value, label }));
  }, [products, locale]);

  // Sizes are free text on each one-of-one piece (S/M/L, shoe sizes, "OS")
  // so the chip set is derived from what's actually in stock, not a fixed list.
  const sizes = useMemo(() => {
    const set = new Set<string>();
    for (const p of products) if (p.size) set.add(p.size);
    return Array.from(set);
  }, [products]);

  const list = useMemo(() => {
    let out = products;
    if (category !== "__all") out = out.filter((p) => p.category === category);
    if (size !== "__all") out = out.filter((p) => p.size === size);
    if (sortBy === "price-asc") out = [...out].sort((a, b) => a.price - b.price);
    if (sortBy === "price-desc") out = [...out].sort((a, b) => b.price - a.price);
    return out;
  }, [products, category, size, sortBy]);

  return (
    <div>
      <div className="mb-1 flex items-center gap-2">
        <div className="no-scrollbar flex flex-1 gap-1.5 overflow-x-auto">
          <FilterChip label={t("filterAll")} active={category === "__all"} onClick={() => setCategory("__all")} />
          {categories.map((c) => (
            <FilterChip
              key={c.value}
              label={c.label}
              active={category === c.value}
              onClick={() => setCategory(c.value)}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={() => setSortOpen(true)}
          aria-label={t("sort")}
          className="flex flex-none items-center justify-center rounded-(--radius-pill) border border-greige/34 p-2 text-ivory/82"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6h18M6 12h12M10 18h4" />
          </svg>
        </button>
      </div>

      {sizes.length > 1 && (
        <div className="no-scrollbar mt-1.5 flex gap-1.5 overflow-x-auto">
          <FilterChip
            label={t("filterAll")}
            active={size === "__all"}
            onClick={() => setSize("__all")}
            accent="aqua"
          />
          {sizes.map((s) => (
            <FilterChip key={s} label={s} active={size === s} onClick={() => setSize(s)} accent="aqua" />
          ))}
        </div>
      )}

      <div className="font-body px-0.5 py-2.5 text-[11.5px] tracking-[0.04em] text-ivory/50">
        {t("resultsCount", { count: list.length })}
      </div>

      {list.length === 0 ? (
        <p className="font-body py-24 text-center text-sm text-ivory/50">{t("empty")}</p>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {list.map((p, i) => (
            <ProductCard
              key={p.slug}
              id={p.id}
              slug={p.slug}
              nameAr={p.nameAr}
              nameEn={p.nameEn}
              price={p.price}
              compareAtPrice={p.compareAtPrice}
              image={p.image}
              status={p.status}
              category={p.category}
              ratingSummary={p.ratingSummary}
              index={i}
            />
          ))}
        </div>
      )}

      <BottomSheet open={sortOpen} onClose={() => setSortOpen(false)} title={t("sort")}>
        {(["featured", "price-asc", "price-desc"] as SortKey[]).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => {
              setSortBy(key);
              setSortOpen(false);
            }}
            className="font-body flex w-full items-center justify-between border-t border-greige/10 px-[18px] py-[15px] text-start text-sm text-ivory"
          >
            <span className={sortBy === key ? "text-aqua-light" : ""}>
              {{ featured: t("sortFeatured"), "price-asc": t("sortPriceAsc"), "price-desc": t("sortPriceDesc") }[key]}
            </span>
            {sortBy === key && (
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#48d6c2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 13l4 4L19 7" />
              </svg>
            )}
          </button>
        ))}
      </BottomSheet>
    </div>
  );
}

function FilterChip({
  label,
  active,
  onClick,
  accent = "champagne",
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  accent?: "champagne" | "aqua";
}) {
  const activeClass =
    accent === "aqua" ? "border-aqua bg-aqua/10 text-aqua-light" : "border-champagne bg-champagne/14 text-champagne-bright";
  return (
    <button
      type="button"
      onClick={onClick}
      className={`font-body flex-none rounded-(--radius-pill) border px-[15px] py-2 text-xs whitespace-nowrap ${
        active ? activeClass : "border-greige/34 text-ivory/70"
      }`}
    >
      {label}
    </button>
  );
}
