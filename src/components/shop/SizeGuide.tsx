"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";

// Standard EG women's apparel size chart (approximate, cm + a rough weight guide
// in kg, which is how many Egyptian shoppers think about fit).
const ROWS = [
  { size: "S", bust: "84–88", waist: "64–68", hip: "90–94", weight: "48–55" },
  { size: "M", bust: "88–92", waist: "68–72", hip: "94–98", weight: "55–63" },
  { size: "L", bust: "92–98", waist: "72–78", hip: "98–104", weight: "63–72" },
  { size: "XL", bust: "98–104", waist: "78–84", hip: "104–110", weight: "72–82" },
];

export function SizeGuide() {
  const t = useTranslations("product");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="font-body text-xs uppercase tracking-[0.2em] text-ivory/55 underline-offset-4 transition-colors hover:text-champagne hover:underline"
      >
        {t("sizeGuide")}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[70] flex items-center justify-center p-6"
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            <motion.button
              aria-label={t("sizeGuide")}
              onClick={() => setOpen(false)}
              className="absolute inset-0 bg-obsidian/80 backdrop-blur-sm"
              variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
            />
            <motion.div
              className="relative w-full max-w-lg rounded-sm border border-greige/25 bg-obsidian-soft p-8"
              variants={{
                hidden: { opacity: 0, y: 20, scale: 0.98 },
                visible: { opacity: 1, y: 0, scale: 1 },
              }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <h3 className="font-display text-2xl text-ivory">
                {t("sizeGuide")}
              </h3>
              <p className="font-body mt-2 text-sm text-ivory/55">
                {t("sizeGuideIntro")}
              </p>
              <table className="mt-6 w-full border-collapse text-start">
                <thead>
                  <tr className="font-body text-[11px] uppercase tracking-[0.15em] text-champagne">
                    <th className="border-b border-ivory/15 py-3 text-start">
                      {t("sizeCol")}
                    </th>
                    <th className="border-b border-ivory/15 py-3 text-start">
                      {t("bustCol")}
                    </th>
                    <th className="border-b border-ivory/15 py-3 text-start">
                      {t("waistCol")}
                    </th>
                    <th className="border-b border-ivory/15 py-3 text-start">
                      {t("hipCol")}
                    </th>
                    <th className="border-b border-ivory/15 py-3 text-start">
                      {t("weightCol")}
                    </th>
                  </tr>
                </thead>
                <tbody className="font-body text-sm text-ivory/75">
                  {ROWS.map((r) => (
                    <tr key={r.size}>
                      <td className="border-b border-ivory/10 py-3 text-champagne/90">
                        {r.size}
                      </td>
                      <td className="border-b border-ivory/10 py-3">{r.bust}</td>
                      <td className="border-b border-ivory/10 py-3">
                        {r.waist}
                      </td>
                      <td className="border-b border-ivory/10 py-3">{r.hip}</td>
                      <td className="border-b border-ivory/10 py-3 text-ivory/60">
                        {r.weight}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <p className="font-body mt-5 text-xs leading-relaxed text-ivory/45">
                {t("sizeGuideFit")}
              </p>
              <button
                onClick={() => setOpen(false)}
                className="font-body mt-8 w-full rounded-full border border-ivory/20 py-3 text-xs uppercase tracking-[0.25em] text-ivory/70 transition-colors hover:border-champagne hover:text-champagne"
              >
                ✕
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
