"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Reveal } from "@/components/motion/Reveal";
import { BrandEmblem } from "@/components/brand/BrandEmblem";

/**
 * The brand-identity finale. The animated emblem that used to greet shoppers at
 * the top now closes the page — a calm sign-off after they've browsed the drop,
 * never a barrier in front of it. The gentle float (.bl-finale-emblem) is the
 * only place the emblem moves; it stills under prefers-reduced-motion.
 */
export default function HomeBrandFinale() {
  const t = useTranslations();
  const locale = useLocale();
  const isAr = locale === "ar";

  return (
    <section className="relative overflow-hidden px-6 py-24 sm:py-32">
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse at 50% 50%, rgba(23,21,15,.9), #100f0d 70%)",
        }}
      />

      <div className="mx-auto flex max-w-xl flex-col items-center text-center">
        <Reveal y={20}>
          <div className="bl-finale-emblem">
            <BrandEmblem
              locale={locale}
              className="h-auto w-[min(72vw,20rem)]"
            />
          </div>
        </Reveal>

        <Reveal delay={0.12} y={16}>
          <Link
            href="/#drop"
            className="font-body mt-10 inline-flex items-center gap-2.5 border-b border-champagne/40 pb-1.5 text-[11px] uppercase tracking-[0.24em] text-champagne transition-colors hover:border-champagne"
          >
            {t("drop.viewAll")}
            <span aria-hidden>{isAr ? "←" : "→"}</span>
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
