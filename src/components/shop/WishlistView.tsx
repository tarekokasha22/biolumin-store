"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useWishlist } from "@/lib/wishlist-store";
import { useHydrated } from "@/lib/use-hydrated";
import { formatPrice } from "@/lib/format";

export function WishlistView() {
  const t = useTranslations("wishlist");
  const locale = useLocale();
  const items = useWishlist((s) => s.items);
  const remove = useWishlist((s) => s.remove);
  const mounted = useHydrated();

  if (!mounted) return null;

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-md py-24 text-center">
        <svg
          viewBox="0 0 24 24"
          className="mx-auto h-10 w-10 text-ivory/20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
        >
          <path d="M12 21s-7.5-4.6-10-9.2C.6 9.1 1.6 5.5 5 5.5c2 0 3.2 1.2 4 2.4.8-1.2 2-2.4 4-2.4 3.4 0 4.4 3.6 3 6.3C19.5 16.4 12 21 12 21z" />
        </svg>
        <p className="font-body mt-6 text-sm text-ivory/55">{t("empty")}</p>
        <Link
          href="/shop"
          className="font-body mt-8 inline-block border-b border-champagne/40 pb-1 text-xs uppercase tracking-[0.22em] text-champagne transition-colors hover:border-champagne"
        >
          {t("cta")}
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
      <AnimatePresence mode="popLayout">
        {items.map((item) => {
          const name = locale === "ar" ? item.nameAr : item.nameEn;
          const onSale =
            !!item.compareAtPrice && item.compareAtPrice > item.price;
          return (
            <motion.div
              key={item.slug}
              layout
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="group"
            >
              <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-obsidian-soft ring-1 ring-ivory/5 transition-all duration-700 group-hover:ring-aqua/25">
                <Link href={`/shop/${item.slug}`} className="block h-full w-full">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.image}
                    alt={name}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </Link>
                <button
                  type="button"
                  onClick={() => remove(item.slug)}
                  aria-label={t("remove")}
                  className="absolute end-2 top-2 flex h-8 w-8 items-center justify-center rounded-full border border-ivory/15 bg-obsidian/60 text-ivory/70 backdrop-blur-sm transition-colors hover:border-aqua/50 hover:text-aqua"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="h-3.5 w-3.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <path d="M6 6l12 12M18 6L6 18" />
                  </svg>
                </button>
              </div>
              <Link href={`/shop/${item.slug}`} className="mt-3 block">
                <h3 className="font-display text-base text-ivory transition-colors group-hover:text-champagne">
                  {name}
                </h3>
                <span className="font-body mt-1 flex items-baseline gap-2 text-sm">
                  {onSale && (
                    <span className="text-xs text-ivory/35 line-through">
                      {formatPrice(item.compareAtPrice!, locale)}
                    </span>
                  )}
                  <span className={onSale ? "text-aqua" : "text-ivory/65"}>
                    {formatPrice(item.price, locale)}
                  </span>
                </span>
              </Link>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
