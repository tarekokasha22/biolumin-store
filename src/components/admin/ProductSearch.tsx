"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTransition, useRef } from "react";

export function ProductSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [, startTransition] = useTransition();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function onChange(value: string) {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      const next = new URLSearchParams(params.toString());
      if (value) next.set("q", value);
      else next.delete("q");
      startTransition(() => router.replace(`${pathname}?${next.toString()}`));
    }, 300);
  }

  return (
    <input
      type="search"
      defaultValue={params.get("q") ?? ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Search products…"
      className="font-body rounded-sm border border-ivory/15 bg-obsidian-soft/40 px-3 py-2 text-sm text-ivory placeholder:text-ivory/30 focus:border-champagne/60 focus:outline-none w-52"
    />
  );
}
