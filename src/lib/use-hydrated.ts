"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

// Returns false during SSR and the first client render, true thereafter.
// Lets persisted (localStorage) state render without hydration mismatches,
// without a setState-in-effect.
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
