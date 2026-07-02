import { useTranslations, useLocale } from "next-intl";
import { formatPrice } from "@/lib/format";
import { FREE_SHIP_THRESHOLD } from "@/lib/shipping";

/**
 * Continuous, non-dismissible marquee — replaces the old single
 * dismissible bar. Three messages, duplicated once for a seamless
 * CSS-only loop (no JS interval).
 */
export function AnnouncementBar() {
  const t = useTranslations("announce");
  const locale = useLocale();

  const messages = [
    t("shipMsg", { amount: formatPrice(FREE_SHIP_THRESHOLD, locale) }),
    t("oneOfOneMsg"),
    t("codMsg"),
  ];
  const loop = [...messages, ...messages];

  return (
    <div className="overflow-hidden border-b border-champagne/14 bg-linear-to-r from-panel via-panel-raised to-panel">
      <div className="marquee-track flex w-max whitespace-nowrap will-change-transform" style={{ animation: "marquee-scroll 30s linear infinite" }}>
        {loop.map((msg, i) => (
          <span key={i} className="font-body px-[22px] py-[7px] text-[9.5px] tracking-[0.22em] text-champagne uppercase">
            ✦&nbsp;&nbsp;{msg}
          </span>
        ))}
      </div>
    </div>
  );
}
