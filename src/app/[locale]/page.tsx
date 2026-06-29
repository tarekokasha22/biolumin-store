import { setRequestLocale } from "next-intl/server";
import { getProducts } from "@/lib/catalog";
import { HomeHero }        from "@/components/home/HomeHero";
import HomeTrust           from "@/components/home/HomeTrust";
import HomeDrop            from "@/components/home/HomeDrop";
import { HomePillars }     from "@/components/home/HomePillars";
import HomeReviews         from "@/components/home/HomeReviews";
import { HomeClosing }     from "@/components/home/HomeClosing";
import HomeNewsletter      from "@/components/home/HomeNewsletter";
import WhatsAppFab         from "@/components/layout/WhatsAppFab";

// Render per-request so the featured-drop teasers reflect live one-of-one
// inventory (SOLD/اتباعت updates instantly) and the build never depends on a
// cold-start DB connection during static prerender.
export const dynamic = "force-dynamic";

type Props = { params: Promise<{ locale: string }> };

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const allProducts = await getProducts();

  const products = allProducts.slice(0, 6).map((p) => ({
    id:     p.id,
    slug:   p.slug,
    nameAr: p.nameAr,
    nameEn: p.nameEn,
    price:  p.price,
    status: p.status as "AVAILABLE" | "SOLD" | "RESERVED",
    images: p.images.map((img) => img.url),
    catEn:  p.category,
    catAr:  p.category,
  }));

  return (
    <>
      <HomeHero />
      <HomeTrust />
      <HomeDrop products={products} />
      <HomePillars />
      <HomeReviews />
      <HomeClosing />
      <HomeNewsletter />
      <WhatsAppFab />
    </>
  );
}
