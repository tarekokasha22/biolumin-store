"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  productId: string;
  slug: string;
  nameAr: string;
  nameEn: string;
  price: number;
  compareAtPrice?: number | null;
  image: string;
  size: string;
};

type CartState = {
  items: CartItem[];
  add: (item: CartItem) => void;
  remove: (productId: string) => void;
  clear: () => void;
  has: (productId: string) => boolean;
  subtotal: () => number;
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      add: (item) =>
        set((s) =>
          s.items.some((i) => i.productId === item.productId)
            ? s
            : { items: [...s.items, item] },
        ),
      remove: (productId) =>
        set((s) => ({
          items: s.items.filter((i) => i.productId !== productId),
        })),
      clear: () => set({ items: [] }),
      has: (productId) => get().items.some((i) => i.productId === productId),
      subtotal: () => get().items.reduce((sum, i) => sum + i.price, 0),
    }),
    { name: "biolumin-cart" },
  ),
);
