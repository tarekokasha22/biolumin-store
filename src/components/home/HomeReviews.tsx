"use client";

import { useLocale, useTranslations } from "next-intl";

type Review = {
  id: string;
  authorNameAr: string;
  authorNameEn: string;
  authorCityAr: string;
  authorCityEn: string;
  rating: number;
  bodyAr: string;
  bodyEn: string;
};

export function HomeReviews({ reviews }: { reviews: Review[] }) {
  const t = useTranslations("home");
  const tp = useTranslations("product");
  const isAr = useLocale() === "ar";

  if (reviews.length === 0) return null;

  return (
    <section className="pt-5 pb-9">
      <div className="mb-4.5 px-4 text-center">
        <div className="font-body mb-2 text-[10.5px] tracking-[0.3em] text-champagne uppercase">
          {t("reviewsKicker")}
        </div>
        <h2 className="font-display text-[30px] text-white">{t("reviewsTitle")}</h2>
      </div>
      <div className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pt-1 pb-2">
        {reviews.map((rv) => (
          <div
            key={rv.id}
            className="flex-none basis-[82%] snap-center rounded-[16px] border border-champagne/16 bg-linear-to-b from-panel/85 to-panel/60 p-5"
          >
            <div className="mb-2.5 text-[13px] tracking-[0.06em] text-champagne-bright">
              {"★".repeat(rv.rating)}
            </div>
            <p className="font-display mb-4 text-[18px] leading-[1.55] text-ivory">
              &ldquo;{isAr ? rv.bodyAr : rv.bodyEn}&rdquo;
            </p>
            <div className="flex items-center gap-2.5">
              <span className="font-display flex h-9 w-9 flex-none items-center justify-center rounded-full bg-linear-to-br from-[#d8b87a] to-[#a9854a] text-sm font-bold text-[#1a160d]">
                {(isAr ? rv.authorNameAr : rv.authorNameEn).charAt(0)}
              </span>
              <div className="leading-[1.3]">
                <div className="font-body text-[13px] font-medium text-ivory">
                  {isAr ? rv.authorNameAr : rv.authorNameEn}
                </div>
                <div className="text-[11px] text-ivory/50">{isAr ? rv.authorCityAr : rv.authorCityEn}</div>
              </div>
              <span className="font-body ms-auto inline-flex items-center gap-1 text-[9.5px] tracking-[0.06em] text-aqua">
                ✓ {tp("verified")}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
