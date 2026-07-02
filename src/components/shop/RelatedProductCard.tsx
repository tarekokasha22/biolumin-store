"use client";

import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { formatPrice } from "@/lib/format";

type Props = {
  slug: string;
  nameAr: string;
  nameEn: string;
  price: number;
  image: string;
};

/** Simpler than ProductCard — used only in horizontal-scroll related rows. */
export function RelatedProductCard({ slug, nameAr, nameEn, price, image }: Props) {
  const locale = useLocale();
  const name = locale === "ar" ? nameAr : nameEn;
  return (
    <Link
      href={`/shop/${slug}`}
      className="block flex-none basis-[47%] overflow-hidden rounded-(--radius-card-sm) border border-champagne/14 bg-[#141417]"
    >
      <div className="aspect-3/4 overflow-hidden bg-[#0c0c0e]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image} alt={name} className="h-full w-full object-cover" />
      </div>
      <div className="px-[11px] pt-2.5 pb-3">
        <div className="font-display mb-1 text-[15px] leading-[1.2] text-ivory">{name}</div>
        <div className="font-body text-[13px] font-semibold text-white">{formatPrice(price, locale)}</div>
      </div>
    </Link>
  );
}
