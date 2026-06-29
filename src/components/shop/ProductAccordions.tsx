"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

type Section = { title: string; body: string };

export function ProductAccordions({ sections }: { sections: Section[] }) {
  // First section open by default.
  const [open, setOpen] = useState(0);

  return (
    <div className="mt-10 border-t border-ivory/10">
      {sections.map((s, i) => {
        const isOpen = open === i;
        return (
          <div key={s.title} className="border-b border-ivory/10">
            <button
              type="button"
              onClick={() => setOpen(isOpen ? -1 : i)}
              className="flex w-full items-center justify-between py-5 text-start"
              aria-expanded={isOpen}
            >
              <span className="font-body text-xs uppercase tracking-[0.22em] text-ivory/80">
                {s.title}
              </span>
              <span
                className={`font-body text-lg text-champagne transition-transform duration-300 ${
                  isOpen ? "rotate-45" : ""
                }`}
              >
                +
              </span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <p className="font-body pb-6 text-sm leading-relaxed text-ivory/60">
                    {s.body}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
