"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";
import { ProductCard } from "./ProductCard";
import { categoryLabel } from "@/lib/categories";

export type ShopProduct = {
  slug: string;
  nameAr: string;
  nameEn: string;
  price: number;
  image: string;
  status: "AVAILABLE" | "RESERVED" | "SOLD";
  category: string;
};

export function ShopGrid({ products }: { products: ShopProduct[] }) {
  const t = useTranslations("shop");
  const locale = useLocale();
  const [active, setActive] = useState<string>("__all");

  const categories = useMemo(() => {
    const map = new Map<string, string>();
    for (const p of products) {
      map.set(p.category, categoryLabel(p.category, locale));
    }
    return Array.from(map, ([value, label]) => ({ value, label }));
  }, [products, locale]);

  const filtered =
    active === "__all"
      ? products
      : products.filter((p) => p.category === active);

  return (
    <div>
      <div className="mb-12 flex flex-wrap gap-3">
        <FilterChip
          label={t("filterAll")}
          active={active === "__all"}
          onClick={() => setActive("__all")}
        />
        {categories.map((c) => (
          <FilterChip
            key={c.value}
            label={c.label}
            active={active === c.value}
            onClick={() => setActive(c.value)}
          />
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="font-body py-24 text-center text-sm text-ivory/50">
          {t("empty")}
        </p>
      ) : (
        <motion.div
          layout
          className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3"
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((p, i) => (
              <motion.div
                key={p.slug}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              >
                <ProductCard
                  slug={p.slug}
                  nameAr={p.nameAr}
                  nameEn={p.nameEn}
                  price={p.price}
                  image={p.image}
                  status={p.status}
                  category={p.category}
                  index={i}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`font-body rounded-full border px-5 py-2 text-[11px] uppercase tracking-[0.2em] transition-all duration-300 ${
        active
          ? "border-champagne bg-champagne text-obsidian"
          : "border-ivory/20 text-ivory/60 hover:border-champagne/50 hover:text-ivory"
      }`}
    >
      {label}
    </button>
  );
}
