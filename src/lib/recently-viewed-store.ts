"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { WishItem } from "@/lib/wishlist-store";

const MAX = 8;

type RVState = {
  items: WishItem[];
  track: (item: WishItem) => void;
};

export const useRecentlyViewed = create<RVState>()(
  persist(
    (set) => ({
      items: [],
      track: (item) =>
        set((s) => {
          const rest = s.items.filter((i) => i.slug !== item.slug);
          return { items: [item, ...rest].slice(0, MAX) };
        }),
    }),
    { name: "biolumin-recently-viewed" },
  ),
);
