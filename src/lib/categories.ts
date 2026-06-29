export const CATEGORY_LABELS: Record<string, { ar: string; en: string }> = {
  dresses: { ar: "فساتين", en: "Dresses" },
  blouses: { ar: "بلوزات", en: "Blouses" },
  shirts: { ar: "قمصان", en: "Shirts" },
  coats: { ar: "جواكت", en: "Coats" },
  pants: { ar: "بناطيل", en: "Pants" },
  boots: { ar: "بوت", en: "Boots" },
  sneakers: { ar: "كوتشي", en: "Sneakers" },
};

export function categoryLabel(slug: string, locale: string): string {
  const entry = CATEGORY_LABELS[slug];
  if (!entry) return slug;
  return locale === "ar" ? entry.ar : entry.en;
}
