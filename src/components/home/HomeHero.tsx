"use client";

import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";

type Props = {
  heroImage: string;
  availableCount: number;
};

/**
 * Cinematic hero — bottom-aligned text over an 84svh image. Unlike the
 * old desktop hero, this has no scroll-driven GSAP animation at all
 * (the prototype's hero is static aside from a slow background drift
 * and the CTA's sheen sweep); GSAP stays in the tree only for /story.
 */
export function HomeHero({ heroImage, availableCount }: Props) {
  const t = useTranslations("home");
  const locale = useLocale();
  const arrow = locale === "ar" ? "←" : "→";

  return (
    <section className="relative flex h-[84svh] min-h-[540px] items-end overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={heroImage}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        style={{ objectPosition: "50% 22%", animation: "hero-drift 12s ease-in-out infinite" }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(8,8,10,.34) 0%, rgba(8,8,10,.06) 32%, rgba(8,8,10,.5) 72%, rgba(14,14,16,.96) 100%)",
        }}
      />

      <div className="relative z-[2] w-full px-[22px] pb-[30px]">
        <div className="font-body mb-3.5 text-[10.5px] tracking-[0.34em] text-champagne-bright uppercase">
          {t("heroKicker")}
        </div>
        <h1 className="font-display text-[46px] leading-[1.05] font-medium text-white [text-shadow:0_2px_30px_rgba(0,0,0,.5)]">
          {t("heroLine1")}
          <br />
          <span
            style={{
              background: "linear-gradient(110deg, #f9f0d8, #e3c895 40%, #dcbd80)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {t("heroLine2")}
          </span>
        </h1>
        <p className="font-body mt-4 max-w-[330px] text-sm leading-[1.7] text-ivory/78">{t("heroSub")}</p>

        <div className="mt-5.5 flex flex-col gap-2.5">
          <Link
            href="/shop"
            className="relative flex items-center justify-center gap-2 overflow-hidden rounded-(--radius-button) bg-linear-to-r from-[#d8b87a] to-champagne px-4 py-4 font-body text-sm font-semibold text-[#1a160d] shadow-[0_10px_30px_-8px_rgba(201,166,107,.5)]"
          >
            <span
              className="absolute inset-0 w-2/5"
              style={{
                background: "linear-gradient(100deg, transparent, rgba(255,255,255,.45), transparent)",
                animation: "cta-sheen 4.5s ease-in-out infinite",
              }}
            />
            <span className="relative">{t("heroCta")}</span>
            <span className="relative">{arrow}</span>
          </Link>
          <div className="flex items-center justify-center gap-1.5 pt-1">
            <span className="text-[13px] tracking-[0.05em] text-champagne-bright">★★★★★</span>
            <span className="font-body text-xs text-ivory/82">{t("heroRating")}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
