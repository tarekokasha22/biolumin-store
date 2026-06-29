"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { useWishlist, type WishItem } from "@/lib/wishlist-store";
import { useHydrated } from "@/lib/use-hydrated";

export function WishlistButton({
  item,
  floating = false,
}: {
  item: WishItem;
  floating?: boolean;
}) {
  const t = useTranslations("wishlist");
  const toggle = useWishlist((s) => s.toggle);
  const active = useWishlist((s) => s.items.some((i) => i.slug === item.slug));
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
        className="h-[18px] w-[18px] transition-colors"
        fill={on ? "#48d6c2" : "none"}
        stroke={on ? "#48d6c2" : "currentColor"}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ color: "rgba(244,240,233,0.6)" }}
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    </motion.button>
  );
}
