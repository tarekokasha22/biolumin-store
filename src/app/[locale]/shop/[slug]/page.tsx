import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getProductBySlug, getRelatedProducts } from "@/lib/catalog";
import { SITE_URL, canonical, alternateLanguages } from "@/lib/seo";
import { gradientPlaceholder } from "@/lib/placeholder";
import { formatPrice } from "@/lib/format";
import { categoryLabel } from "@/lib/categories";
import { FREE_SHIP_THRESHOLD } from "@/lib/shipping";
import { Reveal } from "@/components/motion/Reveal";
import { AddToCart } from "@/components/shop/AddToCart";
import { StickyBuyBar } from "@/components/shop/StickyBuyBar";
import { ProductGallery } from "@/components/shop/ProductGallery";
import { ProductCard } from "@/components/shop/ProductCard";
import { ProductAccordions } from "@/components/shop/ProductAccordions";
import { SizeGuide } from "@/components/shop/SizeGuide";
import { ShareButton } from "@/components/shop/ShareButton";
import {
  RecentlyViewedTracker,
  RecentlyViewedRow,
} from "@/components/shop/RecentlyViewed";
import { WishlistButton } from "@/components/shop/WishlistButton";

type Props = { params: Promise<{ locale: string; slug: string }> };

// Live inventory truth — a sold piece must show "اتباعت" immediately, even in
// production, so this page is never statically cached.
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};

  const isAr = locale === "ar";
  const name = isAr ? product.nameAr : product.nameEn;
  const desc = (isAr ? product.descAr : product.descEn) || name;
  const path = `/shop/${product.slug}`;
  const image = product.images[0]?.url
    ? new URL(product.images[0].url, SITE_URL).toString()
    : `${SITE_URL}/og.png`;

  return {
    title: name,
    description: desc.slice(0, 160),
    alternates: {
      canonical: canonical(locale, path),
      languages: alternateLanguages(path),
    },
    openGraph: {
      type: "website",
      title: name,
      description: desc.slice(0, 160),
      url: canonical(locale, path),
      images: [{ url: image, alt: name }],
      locale: isAr ? "ar_EG" : "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: name,
      description: desc.slice(0, 160),
      images: [image],
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("product");
  const ts = await getTranslations("shop");

  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const isAr = locale === "ar";
  const name = isAr ? product.nameAr : product.nameEn;
  const desc = isAr ? product.descAr : product.descEn;
  const sold = product.status === "SOLD";
  const onSale =
    !sold &&
    product.compareAtPrice != null &&
    product.compareAtPrice > product.price;
  const savePct = onSale
    ? Math.round(
        ((product.compareAtPrice! - product.price) / product.compareAtPrice!) *
          100,
      )
    : 0;

  const freeShipThreshold = FREE_SHIP_THRESHOLD;

  const waNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "";
  const waHref = waNumber
    ? `https://wa.me/${waNumber}?text=${encodeURIComponent(
        t("whatsappMsg", { name }),
      )}`
    : null;

  const images =
    product.images.length > 0
      ? product.images.map((img) => ({
          url: img.url,
          alt: img.alt || name,
        }))
      : [{ url: gradientPlaceholder(product.slug, product.nameEn), alt: name }];

  const related = await getRelatedProducts(product.category, product.slug);

  // Product structured data for rich search results. Availability mirrors the
  // one-of-one status; price is in EGP. Absolute image URLs for crawlers.
  const jsonLd = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name,
    description: desc,
    image: images.map((img) => new URL(img.url, SITE_URL).toString()),
    brand: { "@type": "Brand", name: "BIOLUMIN" },
    category: categoryLabel(product.category, locale),
    offers: {
      "@type": "Offer",
      priceCurrency: "EGP",
      price: product.price,
      url: canonical(locale, `/shop/${product.slug}`),
      availability: sold
        ? "https://schema.org/SoldOut"
        : product.status === "RESERVED"
          ? "https://schema.org/LimitedAvailability"
          : "https://schema.org/InStock",
    },
  };

  return (
    <main className="px-6 pb-32 pt-32">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <RecentlyViewedTracker
        item={{
          slug: product.slug,
          nameAr: product.nameAr,
          nameEn: product.nameEn,
          price: product.price,
          compareAtPrice: product.compareAtPrice,
          image: images[0].url,
        }}
      />
      <div className="mx-auto max-w-6xl">
        <Link
          href="/shop"
          className="font-body group mb-10 inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-ivory/50 transition-colors hover:text-champagne"
        >
          <span className="transition-transform duration-500 group-hover:-translate-x-1 rtl:rotate-180 rtl:group-hover:translate-x-1">
            ←
          </span>
          {t("backToShop")}
        </Link>

        <div className="grid gap-12 md:grid-cols-2 md:gap-16">
          <Reveal>
            <ProductGallery
              images={images}
              sold={sold}
              soldLabel={t("soldOut")}
            />
          </Reveal>

          <Reveal delay={0.1}>
            <div className="flex flex-col">
              {/* availability + wishlist */}
              <div className="flex items-center justify-between gap-4">
                {sold ? (
                  <span className="font-body text-[11px] uppercase tracking-[0.28em] text-ivory/45">
                    {t("sold")}
                  </span>
                ) : product.status === "RESERVED" ? (
                  <span className="font-body text-[11px] uppercase tracking-[0.28em] text-champagne">
                    {t("reserved")}
                  </span>
                ) : (
                  <span className="font-body inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-aqua">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-aqua/70" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-aqua" />
                    </span>
                    {t("available")}
                  </span>
                )}
                <WishlistButton
                  item={{
                    slug: product.slug,
                    nameAr: product.nameAr,
                    nameEn: product.nameEn,
                    price: product.price,
                    image: images[0].url,
                  }}
                />
              </div>

              <p className="font-body mt-5 text-[11px] uppercase tracking-[0.3em] text-champagne/80">
                {t("oneOfOne")}
              </p>
              <h1 className="font-display mt-2 text-4xl leading-tight text-ivory sm:text-5xl">
                {name}
              </h1>

              <div className="mt-4 flex items-center gap-4">
                <p
                  className={`font-body text-2xl ${
                    onSale ? "text-aqua" : "text-ivory/80"
                  }`}
                >
                  {formatPrice(product.price, locale)}
                </p>
                {onSale && (
                  <>
                    <span className="font-body text-lg text-ivory/35 line-through">
                      {formatPrice(product.compareAtPrice!, locale)}
                    </span>
                    <span className="font-body rounded-full bg-aqua px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-obsidian">
                      {ts("save", { percent: savePct })}
                    </span>
                  </>
                )}
              </div>

              <div className="rule-gold my-8 h-px w-full" />

              <p className="font-body text-base leading-relaxed text-ivory/70">
                {desc}
              </p>

              <dl className="font-body mt-8 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="text-ivory/40">{t("category")}</dt>
                  <dd className="mt-1 text-ivory/80">
                    {categoryLabel(product.category, locale)}
                  </dd>
                </div>
                {product.size && (
                  <div>
                    <dt className="flex items-center justify-between text-ivory/40">
                      <span>{t("size")}</span>
                      <SizeGuide />
                    </dt>
                    <dd className="mt-1 text-ivory/80">{product.size}</dd>
                  </div>
                )}
              </dl>

              {!sold && (
                <p className="font-body mt-7 text-xs leading-relaxed text-ivory/45">
                  {t("onlyOne")}
                </p>
              )}

              <div className="mt-5">
                <AddToCart
                  status={product.status}
                  item={{
                    productId: product.id,
                    slug: product.slug,
                    nameAr: product.nameAr,
                    nameEn: product.nameEn,
                    price: product.price,
                    compareAtPrice: product.compareAtPrice,
                    image: images[0].url,
                    size: product.size ?? "",
                  }}
                />
                {!sold && (
                  <p className="font-body mt-3 flex items-center justify-center gap-2 text-center text-[11px] leading-relaxed text-ivory/45">
                    <svg
                      viewBox="0 0 24 24"
                      className="h-3.5 w-3.5 shrink-0 text-ivory/40"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <rect x="5" y="11" width="14" height="9" rx="2" />
                      <path d="M8 11V8a4 4 0 018 0v3" />
                    </svg>
                    {t("secureNote")}
                  </p>
                )}
              </div>

              {/* Delivery callout */}
              {!sold && (
                <div className="mt-6 flex items-start gap-3 rounded-sm border border-aqua/15 bg-aqua/[0.04] px-4 py-3.5">
                  <svg
                    viewBox="0 0 24 24"
                    className="mt-0.5 h-5 w-5 shrink-0 text-aqua"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 7h11v8H3z" />
                    <path d="M14 10h4l3 3v2h-7z" />
                    <circle cx="7" cy="18" r="1.6" />
                    <circle cx="17.5" cy="18" r="1.6" />
                  </svg>
                  <div>
                    <p className="font-body text-xs text-aqua/90">
                      {t("etaGeneric")}
                    </p>
                    <p className="font-body mt-1 text-[11px] text-ivory/45">
                      {t("freeShipNote", { amount: formatPrice(freeShipThreshold, locale) })}
                    </p>
                  </div>
                </div>
              )}

              {/* Trust badges — three distinct assurances */}
              <ul className="font-body mt-5 grid grid-cols-3 gap-3">
                <li className="flex flex-col items-center gap-2 rounded-sm border border-ivory/10 px-2 py-4 text-center">
                  <svg viewBox="0 0 24 24" className="h-5 w-5 text-champagne" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 3l7 3v5c0 4.5-3 7.6-7 9-4-1.4-7-4.5-7-9V6z" />
                    <path d="M9 12l2 2 4-4" />
                  </svg>
                  <span className="text-[10px] uppercase leading-tight tracking-[0.1em] text-ivory/55">
                    {t("trustSecure")}
                  </span>
                </li>
                <li className="flex flex-col items-center gap-2 rounded-sm border border-ivory/10 px-2 py-4 text-center">
                  <svg viewBox="0 0 24 24" className="h-5 w-5 text-champagne" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9h18v11H3z" />
                    <path d="M3 9l2-4h14l2 4" />
                    <path d="M12 5v15" />
                  </svg>
                  <span className="text-[10px] uppercase leading-tight tracking-[0.1em] text-ivory/55">
                    {t("trustPackaging")}
                  </span>
                </li>
                <li className="flex flex-col items-center gap-2 rounded-sm border border-ivory/10 px-2 py-4 text-center">
                  <svg viewBox="0 0 24 24" className="h-5 w-5 text-champagne" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9l4-4v3h11" />
                    <path d="M21 15l-4 4v-3H6" />
                  </svg>
                  <span className="text-[10px] uppercase leading-tight tracking-[0.1em] text-ivory/55">
                    {t("exchange")}
                  </span>
                </li>
              </ul>

              {/* Ways to pay */}
              <div className="mt-7">
                <p className="font-body mb-3 text-[10px] uppercase tracking-[0.28em] text-ivory/40">
                  {t("waysToPay")}
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="font-body inline-flex items-center gap-2 rounded-full border border-ivory/15 px-4 py-2 text-[11px] text-ivory/65">
                    <svg viewBox="0 0 24 24" className="h-4 w-4 text-champagne" fill="none" stroke="currentColor" strokeWidth="1.4">
                      <rect x="2.5" y="6" width="19" height="12" rx="2" />
                      <circle cx="12" cy="12" r="2.4" />
                    </svg>
                    {t("cod")}
                  </span>
                  <span className="font-body inline-flex items-center gap-2 rounded-full border border-ivory/15 px-4 py-2 text-[11px] text-ivory/65">
                    <svg viewBox="0 0 24 24" className="h-4 w-4 text-champagne" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 7h13a2 2 0 012 2v7a2 2 0 01-2 2H6a2 2 0 01-2-2z" />
                      <path d="M16 12h3" />
                    </svg>
                    InstaPay
                  </span>
                  <span className="font-body inline-flex items-center gap-2 rounded-full border border-ivory/15 px-4 py-2 text-[11px] text-ivory/65">
                    <svg viewBox="0 0 24 24" className="h-4 w-4 text-champagne" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="6" width="18" height="13" rx="2" />
                      <path d="M3 10h18" />
                    </svg>
                    {t("payWallet")}
                  </span>
                </div>
              </div>

              {/* WhatsApp + share */}
              <div className="mt-7 flex items-center justify-between gap-4">
                {waHref && (
                  <a
                    href={waHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-body inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-ivory/55 underline-offset-4 transition-colors hover:text-aqua hover:underline"
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="#48d6c2">
                      <path d="M12 2a10 10 0 00-8.6 15l-1.3 4.7 4.8-1.3A10 10 0 1012 2zm0 18a8 8 0 01-4.1-1.1l-.3-.2-2.8.7.7-2.8-.2-.3A8 8 0 1112 20zm4.4-6c-.2-.1-1.4-.7-1.6-.8s-.4-.1-.5.1-.6.8-.8 1-.3.2-.5.1a6.5 6.5 0 01-1.9-1.2 7.2 7.2 0 01-1.3-1.7c-.1-.2 0-.4.1-.5l.4-.4.2-.4v-.4l-.8-1.8c-.2-.5-.4-.4-.5-.4h-.5a.9.9 0 00-.7.3 2.8 2.8 0 00-.9 2.1 4.9 4.9 0 001 2.6 11.2 11.2 0 004.3 3.8c.6.3 1.1.4 1.5.5a3.6 3.6 0 001.6.1c.5-.1 1.4-.6 1.6-1.1s.2-1 .1-1.1z" />
                    </svg>
                    {t("askWhatsapp")}
                  </a>
                )}
                <ShareButton title={name} />
              </div>

              {/* Accordions */}
              <ProductAccordions
                sections={[
                  { title: t("details"), body: desc },
                  { title: t("fabricCare"), body: t("fabricCareBody") },
                  {
                    title: t("shippingReturns"),
                    body: t("shippingReturnsBody"),
                  },
                ]}
              />
            </div>
          </Reveal>
        </div>

        {related.length > 0 && (
          <section className="mt-32">
            <Reveal>
              <h2 className="font-display mb-12 text-3xl text-ivory">
                {t("relatedTitle")}
              </h2>
            </Reveal>
            <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3">
              {related.map((p, i) => (
                <ProductCard
                  key={p.slug}
                  slug={p.slug}
                  nameAr={p.nameAr}
                  nameEn={p.nameEn}
                  price={p.price}
                  compareAtPrice={p.compareAtPrice}
                  image={
                    p.images[0]?.url ??
                    gradientPlaceholder(p.slug, p.nameEn)
                  }
                  status={p.status}
                  category={p.category}
                  index={i}
                />
              ))}
            </div>
          </section>
        )}

        <RecentlyViewedRow excludeSlug={product.slug} />
      </div>

      <StickyBuyBar
        status={product.status}
        price={product.price}
        item={{
          productId: product.id,
          slug: product.slug,
          nameAr: product.nameAr,
          nameEn: product.nameEn,
          price: product.price,
          compareAtPrice: product.compareAtPrice,
          image: images[0].url,
          size: product.size ?? "",
        }}
      />
    </main>
  );
}
