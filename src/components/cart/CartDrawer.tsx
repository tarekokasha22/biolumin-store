"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useCart } from "@/lib/cart-store";
import { useUI } from "@/lib/ui-store";
import { formatPrice } from "@/lib/format";
import {
  FREE_SHIP_THRESHOLD,
  amountToFreeShipping,
} from "@/lib/shipping";
import { useHydrated } from "@/lib/use-hydrated";

export function CartDrawer() {
  const t = useTranslations("cart");
  const tnav = useTranslations("nav");
  const locale = useLocale();
  const isRTL = locale === "ar";
  const pathname = usePathname();
  const items = useCart((s) => s.items);
  const remove = useCart((s) => s.remove);
  const open = useUI((s) => s.cartOpen);
  const closeCart = useUI((s) => s.closeCart);
  const mounted = useHydrated();

  // Close on route change (compare-during-render pattern, no effect setState).
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    if (open) closeCart();
  }

  // Lock body scroll while open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Escape closes.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCart();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, closeCart]);

  const subtotal = mounted ? items.reduce((s, i) => s + i.price, 0) : 0;
  const savings = mounted
    ? items.reduce(
        (s, i) => s + (i.compareAtPrice ? i.compareAtPrice - i.price : 0),
        0,
      )
    : 0;
  const toFree = amountToFreeShipping(subtotal);
  const freeShip = subtotal >= FREE_SHIP_THRESHOLD;
  const pct = Math.min(100, Math.round((subtotal / FREE_SHIP_THRESHOLD) * 100));

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60]"
          initial="hidden"
          animate="visible"
          exit="hidden"
        >
          {/* Scrim */}
          <motion.button
            aria-label={t("drawerTitle")}
            onClick={closeCart}
            className="absolute inset-0 bg-obsidian/70 backdrop-blur-sm"
            variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
            transition={{ duration: 0.3 }}
          />

          {/* Panel */}
          <motion.aside
            className="absolute inset-y-0 end-0 flex w-full max-w-md flex-col border-s border-greige/20 bg-obsidian-soft shadow-2xl"
            variants={{
              hidden: { x: isRTL ? "-100%" : "100%" },
              visible: { x: 0 },
            }}
            transition={{ type: "tween", duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <header className="flex items-center justify-between border-b border-ivory/10 px-6 py-5">
              <h2 className="font-display text-xl text-ivory">
                {t("drawerTitle")}
                {mounted && items.length > 0 && (
                  <span className="font-body ms-2 text-sm text-ivory/40">
                    {t("count", { count: items.length })}
                  </span>
                )}
              </h2>
              <button
                onClick={closeCart}
                className="font-body text-xs uppercase tracking-[0.2em] text-ivory/60 transition-colors hover:text-champagne"
              >
                {tnav("close")}
              </button>
            </header>

            {!mounted || items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
                <p className="font-body text-ivory/55">{t("empty")}</p>
                <Link
                  href="/shop"
                  onClick={closeCart}
                  className="font-body mt-7 inline-block rounded-full border border-champagne/50 px-8 py-3.5 text-xs uppercase tracking-[0.25em] text-ivory transition-all hover:bg-champagne hover:text-obsidian"
                >
                  {t("emptyCta")}
                </Link>
              </div>
            ) : (
              <>
                {/* Free-ship progress */}
                <div className="border-b border-ivory/10 px-6 py-4">
                  {freeShip ? (
                    <p className="font-body text-xs text-aqua">
                      {t("freeShipUnlocked")}
                    </p>
                  ) : (
                    <p className="font-body mb-2 text-xs text-ivory/60">
                      {t("freeShipProgress", {
                        amount: formatPrice(toFree, locale),
                      })}
                    </p>
                  )}
                  <div className="h-1 w-full overflow-hidden rounded-full bg-ivory/10">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-champagne to-aqua"
                      initial={false}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>

                {/* Items */}
                <ul className="flex-1 divide-y divide-ivory/10 overflow-y-auto px-6">
                  <AnimatePresence initial={false}>
                    {items.map((item) => {
                      const name = isRTL ? item.nameAr : item.nameEn;
                      return (
                        <motion.li
                          key={item.productId}
                          layout
                          exit={{ opacity: 0, height: 0 }}
                          className="flex gap-4 py-5"
                        >
                          <Link
                            href={`/shop/${item.slug}`}
                            onClick={closeCart}
                            className="relative aspect-[4/5] w-20 shrink-0 overflow-hidden rounded-sm bg-obsidian"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={item.image}
                              alt={name}
                              className="h-full w-full object-cover"
                            />
                          </Link>
                          <div className="flex flex-1 flex-col justify-between">
                            <div>
                              <Link
                                href={`/shop/${item.slug}`}
                                onClick={closeCart}
                                className="font-display text-base text-ivory transition-colors hover:text-champagne"
                              >
                                {name}
                              </Link>
                              {item.size && (
                                <p className="font-body mt-1 text-xs text-ivory/40">
                                  {item.size}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="font-body flex items-baseline gap-2 text-sm">
                                <span className="text-ivory/80">
                                  {formatPrice(item.price, locale)}
                                </span>
                                {item.compareAtPrice && (
                                  <span className="text-xs text-ivory/35 line-through">
                                    {formatPrice(item.compareAtPrice, locale)}
                                  </span>
                                )}
                              </span>
                              <button
                                onClick={() => remove(item.productId)}
                                className="font-body text-[11px] uppercase tracking-[0.2em] text-ivory/40 transition-colors hover:text-champagne"
                              >
                                {t("remove")}
                              </button>
                            </div>
                          </div>
                        </motion.li>
                      );
                    })}
                  </AnimatePresence>
                </ul>

                {/* Footer */}
                <div className="border-t border-ivory/10 px-6 py-5">
                  {savings > 0 && (
                    <p className="font-body mb-3 text-xs text-aqua">
                      {t("youSave", { amount: formatPrice(savings, locale) })}
                    </p>
                  )}
                  <div className="font-body flex justify-between text-base text-ivory">
                    <span>{t("subtotal")}</span>
                    <span>{formatPrice(subtotal, locale)}</span>
                  </div>
                  <Link
                    href="/checkout"
                    onClick={closeCart}
                    className="font-body mt-5 block rounded-full bg-champagne px-9 py-4 text-center text-xs uppercase tracking-[0.25em] text-obsidian transition-opacity hover:opacity-90"
                  >
                    {t("checkout")}
                  </Link>
                  <button
                    onClick={closeCart}
                    className="font-body mt-3 block w-full text-center text-[11px] uppercase tracking-[0.2em] text-ivory/45 transition-colors hover:text-ivory"
                  >
                    {t("continue")}
                  </button>
                </div>
              </>
            )}
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
