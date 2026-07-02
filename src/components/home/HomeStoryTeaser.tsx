"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

/**
 * Short glow-breathing teaser linking to /story — distinct from the
 * full /story page's GSAP scroll chapters (StoryScroll.tsx), which
 * stay untouched. Reuses "home.manifestoKicker"/"manifestoLine",
 * copy that already existed in messages but was never rendered.
 */
export function HomeStoryTeaser() {
  const t = useTranslations("home");

  return (
    <Link href="/story" className="relative block overflow-hidden px-[22px] py-[54px] text-center">
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 h-[280px] w-[280px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[8px]"
        style={{
          background: "radial-gradient(circle, rgba(72,214,194,.12), transparent 66%)",
          animation: "biopulse 7s ease-in-out infinite",
        }}
      />
      <div className="relative">
        <div className="font-body mb-4.5 text-[10.5px] tracking-[0.3em] text-aqua-light uppercase">
          {t("manifestoKicker")}
        </div>
        <p className="font-display text-[25px] leading-[1.5] text-ivory">{t("manifestoLine")}</p>
      </div>
    </Link>
  );
}
