"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useWishlist } from "@/lib/wishlist-store";
import { useHydrated } from "@/lib/use-hydrated";
import { ProductCard } from "@/components/shop/ProductCard";

type Status = "AVAILABLE" | "RESERVED" | "SOLD";

export function WishlistView() {
  const t = useTranslations("wishlist");
  const items = useWishlist((s) => s.items);
  const mounted = useHydrated();
  // A wishlisted piece may have sold/reserved since it was saved — refresh
  // live status the same way CartView re-validates before checkout, rather
  // than trusting the (possibly stale) snapshot taken at save-time.
  const [liveStatus, setLiveStatus] = useState<Record<string, Status>>({});

  useEffect(() => {
    if (!mounted || items.length === 0) return;
    fetch("/api/products/availability", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productIds: items.map((i) => i.productId) }),
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((res) => res?.statuses && setLiveStatus(res.statuses))
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, items.length]);

  if (!mounted) return null;

  if (items.length === 0) {
    return (
      <div className="py-16 text-center">
        <div className="mx-auto mb-4.5 flex h-16 w-16 items-center justify-center rounded-full border border-champagne/25 bg-champagne/10 text-champagne">
          <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20.3l-1.45-1.32C5.4 14.35 2 11.28 2 7.5 2 4.42 4.42 2 7.5 2c1.74 0 3.41.81 4.5 2.09C13.09 2.81 14.76 2 16.5 2 19.58 2 22 4.42 22 7.5c0 3.78-3.4 6.85-8.55 11.54L12 20.3z" />
          </svg>
        </div>
        <p className="font-body mb-5 text-[15px] text-ivory/62">{t("empty")}</p>
        <Link href="/shop" className="font-body rounded-(--radius-button) bg-linear-to-r from-[#d8b87a] to-champagne px-6.5 py-3.5 text-[13px] font-semibold text-[#1a160d]">
          {t("cta")}
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      <AnimatePresence mode="popLayout">
        {items.map((item, i) => (
          <motion.div key={item.slug} layout exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.3 }}>
            <ProductCard
              id={item.productId}
              slug={item.slug}
              nameAr={item.nameAr}
              nameEn={item.nameEn}
              price={item.price}
              compareAtPrice={item.compareAtPrice}
              image={item.image}
              status={liveStatus[item.productId] ?? "AVAILABLE"}
              category={item.category}
              hideStatusPill
              index={i}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
