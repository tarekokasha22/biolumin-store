"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { motion } from "framer-motion";
import { formatPrice } from "@/lib/format";

type Props = {
  slug: string;
  nameAr: string;
  nameEn: string;
  price: number;
  compareAtPrice?: number | null;
  image: string;
  status: "AVAILABLE" | "RESERVED" | "SOLD";
  category: string;
  index?: number;
};

export function ProductCard({
  slug,
  nameAr,
  nameEn,
  price,
  compareAtPrice,
  image,
  status,
  index = 0,
}: Props) {
  const locale = useLocale();
  const t = useTranslations("shop");
  const sold = status === "SOLD";
  const reserved = status === "RESERVED";
  const onSale = !sold && !!compareAtPrice && compareAtPrice > price;
  const savePct = onSale
    ? Math.round(((compareAtPrice! - price) / compareAtPrice!) * 100)
    : 0;
  const name = locale === "ar" ? nameAr : nameEn;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-8% 0px" }}
      transition={{ duration: 0.7, delay: (index % 3) * 0.08, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link href={`/shop/${slug}`} className="group block">
        <div className="sweep relative aspect-[4/5] overflow-hidden rounded-sm bg-obsidian-soft ring-1 ring-ivory/5 transition-all duration-700 group-hover:ring-aqua/25 group-hover:shadow-[0_0_50px_-12px_rgba(72,214,194,0.35)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image}
            alt={name}
            className={`h-full w-full object-cover transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105 ${
              sold ? "opacity-40 grayscale" : ""
            }`}
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-obsidian/70 via-transparent to-transparent" />

          {(sold || reserved) && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span
                className={`font-display text-2xl tracking-[0.2em] ${
                  sold ? "text-ivory/80" : "text-champagne"
                }`}
              >
                {sold ? t("sold") : t("reserved")}
              </span>
            </div>
          )}

          {!sold && !reserved && !onSale && (
            <span className="absolute end-3 top-3 rounded-full border border-champagne/40 bg-obsidian/50 px-3 py-1 font-body text-[10px] uppercase tracking-[0.18em] text-champagne backdrop-blur-sm">
              {t("filterAvailable")}
            </span>
          )}

          {onSale && (
            <span className="absolute start-3 top-3 rounded-full bg-aqua px-3 py-1 font-body text-[10px] font-semibold uppercase tracking-[0.18em] text-obsidian">
              {t("save", { percent: savePct })}
            </span>
          )}
        </div>

        <div className="mt-4 flex items-baseline justify-between gap-3">
          <h3 className="font-display text-lg text-ivory transition-colors group-hover:text-champagne">
            {name}
          </h3>
          <span className="font-body flex items-baseline gap-2 text-sm">
            {onSale && (
              <span className="text-xs text-ivory/35 line-through">
                {formatPrice(compareAtPrice!, locale)}
              </span>
            )}
            <span className={onSale ? "text-aqua" : "text-ivory/70"}>
              {formatPrice(price, locale)}
            </span>
          </span>
        </div>
      </Link>
    </motion.div>
  );
}
