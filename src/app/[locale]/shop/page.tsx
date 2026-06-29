import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { getProducts } from "@/lib/catalog";
import { canonical, alternateLanguages } from "@/lib/seo";
import { gradientPlaceholder } from "@/lib/placeholder";
import { Reveal } from "@/components/motion/Reveal";
import { ShopGrid, type ShopProduct } from "@/components/shop/ShopGrid";

type Props = { params: Promise<{ locale: string }> };

// One-of-one inventory must always reflect the live DB — never serve a cached
// page that still shows a piece as available after it's been sold.
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "shop" });
  return {
    title: t("title"),
    description: t("subtitle"),
    alternates: {
      canonical: canonical(locale, "/shop"),
      languages: alternateLanguages("/shop"),
    },
    openGraph: {
      title: t("title"),
      description: t("subtitle"),
      url: canonical(locale, "/shop"),
    },
  };
}

export default async function ShopPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("shop");

  const products = await getProducts();
  const items: ShopProduct[] = products.map((p) => ({
    slug: p.slug,
    nameAr: p.nameAr,
    nameEn: p.nameEn,
    price: p.price,
    image: p.images[0]?.url ?? gradientPlaceholder(p.slug, p.nameEn),
    status: p.status,
    category: p.category,
  }));

  return (
    <main className="px-6 pb-32 pt-36">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <header className="mb-16 text-center">
            <p className="font-body text-[11px] uppercase tracking-[0.35em] text-champagne">
              {t("kicker")}
            </p>
            <h1 className="font-display mt-4 text-5xl text-ivory sm:text-6xl">
              {t("title")}
            </h1>
            <p className="font-body mx-auto mt-6 max-w-xl text-sm leading-relaxed text-ivory/60">
              {t("subtitle")}
            </p>
          </header>
        </Reveal>

        <ShopGrid products={items} />
      </div>
    </main>
  );
}
