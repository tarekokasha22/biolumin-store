"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type WishItem = {
  productId: string;
  slug: string;
  nameAr: string;
  nameEn: string;
  price: number;
  compareAtPrice?: number | null;
  image: string;
  category: string;
};

type WishState = {
  items: WishItem[];
  toggle: (item: WishItem) => void;
  remove: (slug: string) => void;
  has: (slug: string) => boolean;
  clear: () => void;
};

export const useWishlist = create<WishState>()(
  persist(
    (set, get) => ({
      items: [],
      toggle: (item) =>
        set((s) =>
          s.items.some((i) => i.slug === item.slug)
            ? { items: s.items.filter((i) => i.slug !== item.slug) }
            : { items: [item, ...s.items] },
        ),
      remove: (slug) =>
        set((s) => ({ items: s.items.filter((i) => i.slug !== slug) })),
      has: (slug) => get().items.some((i) => i.slug === slug),
      clear: () => set({ items: [] }),
    }),
    { name: "biolumin-wishlist" },
  ),
);
