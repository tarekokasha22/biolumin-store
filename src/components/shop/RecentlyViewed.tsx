"use client";

import { useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useRecentlyViewed } from "@/lib/recently-viewed-store";
import { useWishlist, type WishItem } from "@/lib/wishlist-store";
import { formatPrice } from "@/lib/format";
import { useHydrated } from "@/lib/use-hydrated";

// Drop this on a product page; it records the view (store setter, not React
// state, so the set-state-in-effect lint rule does not apply).
export function RecentlyViewedTracker({ item }: { item: WishItem }) {
  const track = useRecentlyViewed((s) => s.track);
  useEffect(() => {
    track(item);
    // Only re-track when the viewed piece changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.slug]);
  return null;
}

// Display row, optionally hiding one slug (the current product).
export function RecentlyViewedRow({ excludeSlug }: { excludeSlug?: string }) {
  const t = useTranslations("wishlist");
  const items = useRecentlyViewed((s) => s.items);
  const mounted = useHydrated();
  if (!mounted) return null;
  const list = items.filter((i) => i.slug !== excludeSlug).slice(0, 6);
  if (list.length === 0) return null;
  return (
    <section className="mt-24">
      <h2 className="font-display mb-8 text-2xl text-ivory">
        {t("recentTitle")}
      </h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {list.map((i) => (
          <MiniCard key={i.slug} item={i} />
        ))}
      </div>
    </section>
  );
}

function MiniCard({ item }: { item: WishItem }) {
  const locale = useLocale();
  const name = locale === "ar" ? item.nameAr : item.nameEn;
  return (
    <Link href={`/shop/${item.slug}`} className="group block">
      <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-obsidian-soft ring-1 ring-ivory/5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.image}
          alt={name}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      </div>
      <p className="font-body mt-2 line-clamp-1 text-xs text-ivory/70 transition-colors group-hover:text-champagne">
        {name}
      </p>
      <p className="font-body text-xs text-ivory/45">
        {formatPrice(item.price, locale)}
      </p>
    </Link>
  );
}

// Re-export to keep wishlist usage in one import site where convenient.
export { useWishlist };
