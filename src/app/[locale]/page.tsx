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
