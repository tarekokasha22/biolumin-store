"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { useWishlist, type WishItem } from "@/lib/wishlist-store";
import { useUI } from "@/lib/ui-store";
import { useHydrated } from "@/lib/use-hydrated";

export function WishlistButton({
  item,
  floating = false,
}: {
  item: WishItem;
  floating?: boolean;
}) {
  const t = useTranslations("wishlist");
  const tToast = useTranslations("toast");
  const toggle = useWishlist((s) => s.toggle);
  const active = useWishlist((s) => s.items.some((i) => i.slug === item.slug));
  const showToast = useUI((s) => s.showToast);
  const mounted = useHydrated();
  const on = mounted && active;

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.85 }}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(item);
        showToast(on ? tToast("removedFromFavourites") : tToast("savedToFavourites"));
      }}
      aria-label={on ? t("remove") : t("add")}
      className={
        floating
          ? "flex h-9 w-9 items-center justify-center rounded-full border border-ivory/15 bg-obsidian/50 backdrop-blur-sm transition-colors hover:border-aqua/50"
          : "flex h-9 w-9 items-center justify-center rounded-full border border-ivory/15 transition-colors hover:border-aqua/50"
      }
    >
      <svg
        viewBox="0 0 24 24"
        className="h-4 w-4 transition-colors"
        fill={on ? "#48d6c2" : "none"}
        stroke={on ? "#48d6c2" : "currentColor"}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ color: "rgba(244,240,233,0.6)" }}
      >
        <path d="M12 20.3l-1.45-1.32C5.4 14.35 2 11.28 2 7.5 2 4.42 4.42 2 7.5 2c1.74 0 3.41.81 4.5 2.09C13.09 2.81 14.76 2 16.5 2 19.58 2 22 4.42 22 7.5c0 3.78-3.4 6.85-8.55 11.54L12 20.3z" />
      </svg>
    </motion.button>
  );
}
