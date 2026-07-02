"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

type Props = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxHeight?: string;
  ariaLabel?: string;
};

/**
 * Shared bottom-sheet chrome for every overlay in the shell (Cart, Sort,
 * Size Guide): backdrop + slide-up panel with a drag-handle, scroll-lock,
 * and Escape-to-close. Consumers own their own content only.
 */
export function BottomSheet({
  open,
  onClose,
  title,
  children,
  maxHeight = "90svh",
  ariaLabel,
}: Props) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-80">
          <motion.button
            aria-label={ariaLabel ?? "Close"}
            onClick={onClose}
            className="absolute inset-0 bg-[rgba(4,4,6,.6)] backdrop-blur-[3px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          />
          <motion.div
            className="absolute inset-x-0 bottom-0 mx-auto flex w-full max-w-(--shell-width) flex-col overflow-hidden rounded-t-(--radius-sheet) border-t border-champagne/20 bg-[#121214]"
            style={{ maxHeight }}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex justify-center pt-3 pb-1">
              <span className="h-1 w-[42px] rounded-full bg-greige/40" />
            </div>
            {title && (
              <div className="flex items-center justify-between border-b border-greige/14 px-[18px] pt-1.5 pb-3.5">
                <h3 className="font-display text-[22px] text-ivory">{title}</h3>
                <button
                  onClick={onClose}
                  aria-label="Close"
                  className="flex h-[34px] w-[34px] items-center justify-center rounded-full border border-greige/20 bg-white/5 text-ivory"
                >
                  <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                    <path d="M6 6l12 12M18 6L6 18" />
                  </svg>
                </button>
              </div>
            )}
            <div
              className="flex-1 overflow-y-auto"
              style={{ paddingBottom: "calc(16px + env(safe-area-inset-bottom))" }}
            >
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
