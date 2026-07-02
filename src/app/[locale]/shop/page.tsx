import { setRequestLocale, getTranslations } from "next-intl/server";
import { getProducts } from "@/lib/catalog";
import { getRatingSummariesByProductIds } from "@/lib/reviews";
import { gradientPlaceholder } from "@/lib/placeholder";
import { ShopGrid, type ShopProduct } from "@/components/shop/ShopGrid";

// Inventory is live one-of-one stock — must reflect real-time availability and
// must never be prerendered at build (which would hit the DB during export).
export const dynamic = "force-dynamic";

type Props = { params: Promise<{ locale: string }> };

export default async function ShopPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("shop");

  const products = await getProducts();
  const ratings = await getRatingSummariesByProductIds(products.map((p) => p.id));
  const items: ShopProduct[] = products.map((p) => ({
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

  return (
    <div className="px-4 pt-6 pb-2">
      <div className="font-body mb-1.5 text-[10.5px] tracking-[0.3em] text-champagne uppercase">
        {t("kicker")}
      </div>
      <h1 className="font-display text-[34px] leading-[1.05] text-white">{t("title")}</h1>
      <p className="font-body mt-2 max-w-[340px] text-[13px] leading-[1.6] text-ivory/62">
        {t("subtitle")}
      </p>

      <div className="mt-5">
        <ShopGrid products={items} />
      </div>
    </div>
  );
}
