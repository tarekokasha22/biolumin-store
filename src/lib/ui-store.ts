"use client";

import { create } from "zustand";

let toastTimer: ReturnType<typeof setTimeout> | undefined;

// Ephemeral UI state (not persisted): the cart drawer + the shared bottom
// toast. A store (not a local hook) because unrelated consumers — cart add,
// wishlist toggle, checkout's copy button — all need to trigger the same
// toast without prop-drilling.
type UIState = {
  cartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  toast: string;
  showToast: (message: string) => void;
};

export const useUI = create<UIState>((set) => ({
  cartOpen: false,
  openCart: () => set({ cartOpen: true }),
  closeCart: () => set({ cartOpen: false }),
  toggleCart: () => set((s) => ({ cartOpen: !s.cartOpen })),
  toast: "",
  showToast: (message) => {
    clearTimeout(toastTimer);
    set({ toast: message });
    toastTimer = setTimeout(() => set({ toast: "" }), 2000);
  },
}));
