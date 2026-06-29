import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { SITE_URL, LOCALES, alternateLanguages } from "@/lib/seo";

// Live sitemap — generated per request so newly added pieces appear immediately
// and sold-out pieces still resolve (they 404 only once deleted). Each entry
// carries hreflang alternates so AR/EN versions are linked for crawlers.
export const dynamic = "force-dynamic";

const STATIC_PATHS = ["", "/shop", "/story"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await prisma.product.findMany({
    select: { slug: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });

  const entries: MetadataRoute.Sitemap = [];

  for (const path of STATIC_PATHS) {
    for (const locale of LOCALES) {
      entries.push({
        url: `${SITE_URL}/${locale}${path}`,
        lastModified: new Date(),
        changeFrequency: path === "" ? "daily" : "daily",
        priority: path === "" ? 1 : 0.8,
        alternates: { languages: alternateLanguages(path) },
      });
    }
  }

  for (const p of products) {
    const path = `/shop/${p.slug}`;
    for (const locale of LOCALES) {
      entries.push({
        url: `${SITE_URL}/${locale}${path}`,
        lastModified: p.createdAt,
        changeFrequency: "weekly",
        priority: 0.7,
        alternates: { languages: alternateLanguages(path) },
      });
    }
  }

  return entries;
}
