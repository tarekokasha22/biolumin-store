import { setRequestLocale } from "next-intl/server";
import { getProducts, getLiveDrop } from "@/lib/catalog";
import { getFeaturedReviews, getRatingSummariesByProductIds } from "@/lib/reviews";
import { gradientPlaceholder } from "@/lib/placeholder";
import { HomeHero } from "@/components/home/HomeHero";
import { HomeTrustStrip } from "@/components/home/HomeTrustStrip";
import { HomePillars } from "@/components/home/HomePillars";
import { HomeDrop } from "@/components/home/HomeDrop";
import { HomeStoryTeaser } from "@/components/home/HomeStoryTeaser";
import { HomeReviews } from "@/components/home/HomeReviews";

// Render per-request so the featured-drop teasers reflect live one-of-one
// inventory (SOLD/اتباعت updates instantly) and the build never depends on a
// cold-start DB connection during static prerender.
export const dynamic = "force-dynamic";

type Props = { params: Promise<{ locale: string }> };

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [all, drop, featuredReviews] = await Promise.all([
    getProducts(),
    getLiveDrop(),
    getFeaturedReviews(),
  ]);

  const featuredRaw = all.filter((p) => p.status !== "SOLD").slice(0, 6);
  const ratings = await getRatingSummariesByProductIds(featuredRaw.map((p) => p.id));
  const featured = featuredRaw.map((p) => ({
    id: p.id,
    slug: p.slug,
    nameAr: p.nameAr,
    nameEn: p.nameEn,
    price: p.price,
    compareAtPrice: p.compareAtPrice,
    image: p.images[0]?.url ?? gradientPlaceholder(p.slug, p.nameEn),
    status: p.status,
    category: p.category,
    ratingSummary: ratings.get(p.id),
  }));

  const availableCount = all.filter((p) => p.status === "AVAILABLE").length;
  const heroSource = all.find((p) => p.status === "AVAILABLE") ?? all[0];
  const heroImage = heroSource?.images[0]?.url ?? gradientPlaceholder("hero", "BIOLUMIN");

  return (
    <>
      <HomeHero heroImage={heroImage} availableCount={availableCount} />
      <HomeTrustStrip />
      <HomeDrop
        products={featured}
        availableCount={availableCount}
        closesAt={drop?.closesAt ? drop.closesAt.toISOString() : null}
      />
      <HomePillars />
      <HomeStoryTeaser />
      <HomeReviews reviews={featuredReviews} />
    </>
  );
}
