"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { motion } from "framer-motion";
import { formatPrice } from "@/lib/format";
import { categoryLabel } from "@/lib/categories";
import { useCart } from "@/lib/cart-store";
import { useUI } from "@/lib/ui-store";
import { WishlistButton } from "@/components/shop/WishlistButton";
import type { RatingSummary } from "@/lib/reviews";

type Status = "AVAILABLE" | "RESERVED" | "SOLD";

type Props = {
  id: string;
  slug: string;
  nameAr: string;
  nameEn: string;
  price: number;
  compareAtPrice?: number | null;
  image: string;
  status: Status;
  category: string;
  size?: string;
  index?: number;
  ratingSummary?: RatingSummary;
  hideStatusPill?: boolean;
};

const STATUS_STYLE: Record<
  Status,
  { dot: string; text: string; border: string }
> = {
  AVAILABLE: { dot: "bg-aqua", text: "text-aqua-light", border: "border-aqua/40" },
  RESERVED: {
    dot: "bg-champagne",
    text: "text-champagne-bright",
    border: "border-champagne/40",
  },
  SOLD: {
    dot: "bg-[#c87]",
    text: "text-[#d99]",
    border: "border-[rgba(200,120,120,.4)]",
  },
};

export function ProductCard({
  id,
  slug,
  nameAr,
  nameEn,
  price,
  compareAtPrice,
  image,
  status,
  category,
  index = 0,
  ratingSummary,
  hideStatusPill = false,
}: Props) {
  const locale = useLocale();
  const t = useTranslations("shop");
  const add = useCart((s) => s.add);
  const openCart = useUI((s) => s.openCart);
  const buyable = status === "AVAILABLE";
  const onSale = buyable && !!compareAtPrice && compareAtPrice > price;
  const savePct = onSale
    ? Math.round(((compareAtPrice! - price) / compareAtPrice!) * 100)
    : 0;
  const name = locale === "ar" ? nameAr : nameEn;
  const statusStyle = STATUS_STYLE[status];
  const statusLabel =
    status === "SOLD" ? t("sold") : status === "RESERVED" ? t("reserved") : t("filterAvailable");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-8% 0px" }}
      transition={{ duration: 0.6, delay: (index % 6) * 0.05, ease: [0.22, 1, 0.36, 1] }}
      className="flex h-full flex-col overflow-hidden rounded-(--radius-card) border border-champagne/14 bg-[#141417]"
    >
      <Link href={`/shop/${slug}`} className="group relative block aspect-3/4 overflow-hidden bg-[#0c0c0e]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image}
          alt={name}
          className={`h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-active:scale-105 ${
            status === "SOLD" ? "opacity-45 grayscale-[.3]" : status === "RESERVED" ? "opacity-75" : ""
          }`}
        />

        {!hideStatusPill && status !== "AVAILABLE" && (
          <div
            className={`absolute top-3 start-3 inline-flex items-center gap-1.5 rounded-(--radius-pill) border bg-[rgba(10,10,12,.62)] px-2.5 py-1 backdrop-blur-sm ${statusStyle.border}`}
          >
            <span className={`h-[5px] w-[5px] rounded-full ${statusStyle.dot}`} />
            <span className={`font-body text-[9px] uppercase tracking-[0.1em] ${statusStyle.text}`}>
              {statusLabel}
            </span>
          </div>
        )}

        <div className="absolute top-3 end-3">
          <WishlistButton
            item={{ productId: id, slug, nameAr, nameEn, price, compareAtPrice, image, category }}
            floating
          />
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-1 px-[11px] pt-[11px] pb-3">
        <div className="font-body min-h-3 text-[9.5px] uppercase tracking-[0.12em] text-champagne/70">
          {categoryLabel(category, locale)}
        </div>
        <div className="font-display min-h-[39px] text-[17px] leading-[1.15] text-ivory">
          {name}
        </div>
        {ratingSummary && ratingSummary.count > 0 && (
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-champagne-bright">★</span>
            <span className="text-[10.5px] text-ivory/55">
              {ratingSummary.average.toFixed(1)} ({ratingSummary.count})
            </span>
          </div>
        )}
        <div className="mt-auto flex flex-wrap items-baseline gap-x-2 gap-y-0.5 pt-[9px]">
          <span className="font-body text-[15px] font-semibold text-white">
            {formatPrice(price, locale)}
          </span>
          {onSale && (
            <>
              <span className="font-body text-xs text-ivory/35 line-through">
                {formatPrice(compareAtPrice!, locale)}
              </span>
              <span className="font-body rounded-(--radius-pill) bg-aqua px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.1em] text-obsidian">
                {t("save", { percent: savePct })}
              </span>
            </>
          )}
        </div>
        <button
          type="button"
          disabled={!buyable}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!buyable) return;
            add({ productId: id, slug, nameAr, nameEn, price, compareAtPrice, image, size: "" });
            openCart();
          }}
          className={`font-body mt-2 flex h-10 w-full items-center justify-center rounded-(--radius-button) border text-xs font-semibold tracking-[0.04em] ${
            buyable
              ? "border-champagne/45 bg-champagne/10 text-champagne-bright"
              : "cursor-default border-greige/25 bg-[rgba(30,30,33,.5)] text-ivory/40"
          }`}
        >
          {buyable ? t("add") : statusLabel}
        </button>
      </div>
    </motion.div>
  );
}
