"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { BottomSheet } from "@/components/ui/BottomSheet";

// S/M/L size chart (cm), verified against the design handoff prototype.
const ROWS = [
  { size: "S", bust: "84–88", waist: "64–68", height: "155–163", weight: "48–56" },
  { size: "M", bust: "89–94", waist: "69–74", height: "162–170", weight: "57–66" },
  { size: "L", bust: "95–100", waist: "75–80", height: "168–176", weight: "67–78" },
];

export function SizeGuide({ currentSize }: { currentSize?: string }) {
  const t = useTranslations("product");
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="font-body inline-flex items-center gap-1.5 text-xs text-aqua-light underline-offset-4 hover:underline"
      >
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 7l4-4 14 14-4 4z" />
          <path d="M9 9l1 1M12 6l1 1M6 12l1 1" />
        </svg>
        {t("sizeGuide")}
      </button>

      <BottomSheet open={open} onClose={() => setOpen(false)} title={t("sizeGuide")}>
        <div className="px-[18px] pt-4">
          <p className="font-body mb-2 text-[13px] leading-[1.6] text-ivory/66">
            {t("sizeGuideIntro")}
          </p>
          {currentSize && (
            <div className="mb-4 inline-flex items-center gap-1.5 rounded-(--radius-input) border border-aqua/22 bg-aqua/8 px-3 py-2">
              <span className="h-1.5 w-1.5 rounded-full bg-aqua" />
              <span className="text-[11.5px] text-aqua-light">
                {t("sizeGuideYours", { size: currentSize })}
              </span>
            </div>
          )}
          <div className="overflow-hidden rounded-(--radius-input) border border-greige/18">
            <div className="grid grid-cols-5 bg-champagne/10 text-[10.5px] tracking-[0.04em] text-champagne-bright">
              <div className="px-1.5 py-2.5 text-center">{t("sizeCol")}</div>
              <div className="px-1.5 py-2.5 text-center">{t("bustCol")}</div>
              <div className="px-1.5 py-2.5 text-center">{t("waistCol")}</div>
              <div className="px-1.5 py-2.5 text-center">{t("heightCol")}</div>
              <div className="px-1.5 py-2.5 text-center">{t("weightCol")}</div>
            </div>
            {ROWS.map((r) => (
              <div
                key={r.size}
                className={`grid grid-cols-5 border-t border-greige/12 text-xs text-ivory/78 ${
                  r.size === currentSize ? "bg-aqua/7" : ""
                }`}
              >
                <div className="px-1.5 py-3.5 text-center font-semibold text-ivory">{r.size}</div>
                <div className="px-1.5 py-3.5 text-center">{r.bust}</div>
                <div className="px-1.5 py-3.5 text-center">{r.waist}</div>
                <div className="px-1.5 py-3.5 text-center">{r.height}</div>
                <div className="px-1.5 py-3.5 text-center">{r.weight}</div>
              </div>
            ))}
          </div>
          <p className="font-body mt-3 text-[11px] leading-[1.5] text-ivory/45">
            {t("sizeGuideNote")}
          </p>
        </div>
      </BottomSheet>
    </>
  );
}
