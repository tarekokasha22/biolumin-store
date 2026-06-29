"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

export function CategoryFilter({
  activeCategory,
  categories,
}: {
  activeCategory: string;
  categories: [string, { ar: string; en: string }][];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  function onChange(value: string) {
    const next = new URLSearchParams(params.toString());
    if (value !== "all") next.set("category", value);
    else next.delete("category");
    router.replace(`${pathname}?${next.toString()}`);
  }

  return (
    <select
      value={activeCategory}
      onChange={(e) => onChange(e.target.value)}
      className="font-body rounded-sm border border-ivory/15 bg-obsidian px-3 py-2 text-sm text-ivory focus:border-champagne/60 focus:outline-none"
    >
      <option value="all">All categories</option>
      {categories.map(([slug, { en }]) => (
        <option key={slug} value={slug}>{en}</option>
      ))}
    </select>
  );
}
