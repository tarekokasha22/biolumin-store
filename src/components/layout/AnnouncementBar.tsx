"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { formatPrice } from "@/lib/format";
import { FREE_SHIP_THRESHOLD } from "@/lib/shipping";
import { useHydrated } from "@/lib/use-hydrated";

const KEY = "biolumin-announce-dismissed";

// Thin dismissible bar shown at the very top of the header stack. Rendered
// inside <Header> so it shares the fixed positioning over the hero.
export function AnnouncementBar() {
  const t = useTranslations("announce");
  const locale = useLocale();
  const mounted = useHydrated();
  const [dismissed, setDismissed] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(KEY) === "1";
  });

  if (mounted && dismissed) return null;

  return (
    <div className="relative flex items-center justify-center gap-3 border-b border-champagne/15 bg-obsidian/80 px-10 py-2 text-center backdrop-blur-md">
      <p className="font-body text-[10px] uppercase tracking-[0.22em] text-champagne/90 sm:text-[11px]">
        {t("freeShip", { amount: formatPrice(FREE_SHIP_THRESHOLD, locale) })}
      </p>
      <button
        onClick={() => {
          setDismissed(true);
          try {
            window.localStorage.setItem(KEY, "1");
          } catch {}
        }}
        aria-label={t("dismiss")}
        className="absolute end-3 top-1/2 -translate-y-1/2 font-body text-xs text-ivory/40 transition-colors hover:text-ivory"
      >
        ✕
      </button>
    </div>
  );
}
