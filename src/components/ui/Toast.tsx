"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useUI } from "@/lib/ui-store";

export function Toast() {
  const toast = useUI((s) => s.toast);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[84px] z-90 flex justify-center">
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="rounded-(--radius-pill) border border-champagne/30 bg-[rgba(18,18,21,.97)] px-[22px] py-[13px] font-body text-[13px] whitespace-nowrap text-ivory shadow-[0_10px_30px_-8px_rgba(0,0,0,.6)]"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
