import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { getProductBySlug, getRelatedProducts } from "@/lib/catalog";
import { getReviewsForProduct, getProductRatingSummary } from "@/lib/reviews";
import { gradientPlaceholder } from "@/lib/placeholder";
import { formatPrice } from "@/lib/format";
import { categoryLabel, isApparelSizing } from "@/lib/categories";
import { ProductGallery } from "@/components/shop/ProductGallery";
import { ProductAccordions } from "@/components/shop/ProductAccordions";
import { SizeGuide } from "@/components/shop/SizeGuide";
import { StickyBuyBar } from "@/components/shop/StickyBuyBar";
import { RelatedProductCard } from "@/components/shop/RelatedProductCard";
import { ShareButton } from "@/components/shop/ShareButton";
import {
  RecentlyViewedTracker,
  RecentlyViewedRow,
} from "@/components/shop/RecentlyViewed";
import { WishlistButton } from "@/components/shop/WishlistButton";

// Live one-of-one stock — render per request so availability is always current.
export const dynamic = "force-dynamic";

type Props = { params: Promise<{ locale: string; slug: string }> };

// Deterministic, display-only "N women viewing" — same simulated-social-proof
// spirit as the Live Activity toast. No real analytics behind this number.
function fakeViewerCount(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 97;
  return 6 + (h % 17);
}

const SIZE_CHIPS = ["S", "M", "L"];

export default async function ProductPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("product");
  const ts = await getTranslations("shop");
  const isAr = locale === "ar";

  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const name = isAr ? product.nameAr : product.nameEn;
  const desc = isAr ? product.descAr : product.descEn;
  const sold = product.status === "SOLD";
  const buyable = product.status === "AVAILABLE";
  const onSale = buyable && !!product.compareAtPrice && product.compareAtPrice > product.price;
  const savePct = onSale
    ? Math.round(((product.compareAtPrice! - product.price) / product.compareAtPrice!) * 100)
    : 0;

  const [related, reviews, rating] = await Promise.all([
    getRelatedProducts(product.category, product.slug, 4),
    getReviewsForProduct(product.id),
    getProductRatingSummary(product.id),
  ]);

  const waNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "";
  const waHref = waNumber
    ? `https://wa.me/${waNumber}?text=${encodeURIComponent(t("whatsappMsg", { name }))}`
    : null;

  const images =
    product.images.length > 0
      ? product.images.map((img) => ({ url: img.url, alt: img.alt || name }))
      : [{ url: gradientPlaceholder(product.slug, product.nameEn), alt: name }];

  const apparel = isApparelSizing(product.category);
  const viewerCount = fakeViewerCount(product.id);

  return (
    <div style={{ paddingBottom: "96px" }}>
      <RecentlyViewedTracker
        item={{
          productId: product.id,
          slug: product.slug,
          nameAr: product.nameAr,
          nameEn: product.nameEn,
          category: product.category,
          price: product.price,
          compareAtPrice: product.compareAtPrice,
          image: images[0].url,
        }}
      />

      <ProductGallery
        images={images}
        sold={sold}
        soldLabel={t("soldOut")}
        badge={
          <div className="inline-flex items-center gap-1.5 rounded-(--radius-pill) border border-champagne/30 bg-[rgba(10,10,12,.55)] px-3 py-1.5 backdrop-blur-sm">
            <span className="h-[5px] w-[5px] rounded-full bg-champagne shadow-[0_0_6px_#c9a66b]" />
            <span className="font-body text-[9.5px] tracking-[0.14em] text-champagne-bright uppercase">
              {t("oneOfOne")}
            </span>
          </div>
        }
        wishlistSlot={
          <WishlistButton
            item={{
              productId: product.id,
              slug: product.slug,
              nameAr: product.nameAr,
              nameEn: product.nameEn,
              category: product.category,
              price: product.price,
              compareAtPrice: product.compareAtPrice,
              image: images[0].url,
            }}
            floating
          />
        }
      />

      <div className="px-4 pt-5">
        <div className="font-body mb-1.5 text-[10px] tracking-[0.16em] text-champagne/80 uppercase">
          {categoryLabel(product.category, locale)}
        </div>
        <h1 className="font-display text-[30px] leading-[1.1] text-white">{name}</h1>

        <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5">
          <span className={`font-body text-[23px] font-semibold ${onSale ? "text-aqua" : "text-white"}`}>
            {formatPrice(product.price, locale)}
          </span>
          {onSale && (
            <>
              <span className="font-body text-base text-ivory/35 line-through">
                {formatPrice(product.compareAtPrice!, locale)}
              </span>
              <span className="font-body rounded-(--radius-pill) bg-aqua px-2.5 py-1 text-[10px] font-semibold text-obsidian uppercase">
                {ts("save", { percent: savePct })}
              </span>
            </>
          )}
          {rating.count > 0 && (
            <a href="#reviews" className="font-body inline-flex items-center gap-1.5 text-xs">
              <span className="text-champagne-bright">{"★".repeat(Math.round(rating.average))}</span>
              <span className="text-ivory/60 underline underline-offset-2">
                {rating.average.toFixed(1)} ({rating.count})
              </span>
            </a>
          )}
        </div>

        <div className="mt-4 flex flex-col gap-2">
          {buyable && (
            <div className="flex items-center gap-2.5 rounded-(--radius-input) border border-champagne/22 bg-champagne/8 px-3.5 py-2.5">
              <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="#e3c895" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2l8 4v6c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6z" />
                <path d="M9 12l2 2 4-4" />
              </svg>
              <span className="font-body text-[12.5px] text-ivory">{t("stockUrgency")}</span>
            </div>
          )}
          {buyable && (
            <div className="flex items-center gap-2.5 rounded-(--radius-input) border border-aqua/20 bg-aqua/7 px-3.5 py-2.5">
              <span className="h-[7px] w-[7px] flex-none rounded-full bg-aqua shadow-[0_0_8px_#48d6c2]" />
              <span className="font-body text-[12.5px] text-aqua-light">
                {t("liveViewers", { count: viewerCount })}
              </span>
            </div>
          )}
        </div>

        <p className="font-body mt-4.5 text-sm leading-[1.75] text-ivory/74">{desc}</p>

        {/* Size */}
        <div className="mt-5.5">
          <div className="mb-2.5 flex items-center justify-between">
            <span className="font-body text-[11px] tracking-[0.16em] text-ivory/80 uppercase">{t("size")}</span>
            {apparel && <SizeGuide currentSize={product.size} />}
          </div>
          {apparel ? (
            <div className="flex gap-2">
              {SIZE_CHIPS.map((s) => {
                const isThis = s === product.size;
                return (
                  <div
                    key={s}
                    className={`relative flex-1 rounded-(--radius-input) border py-3.5 text-center text-sm font-semibold ${
                      isThis
                        ? "border-aqua bg-aqua/10 text-aqua-light"
                        : "border-greige/30 text-ivory/40"
                    }`}
                  >
                    {s}
                    {isThis && (
                      <span className="absolute -top-1.5 end-[-3px] rounded-(--radius-pill) bg-aqua px-1.5 py-0.5 text-[8px] tracking-[0.06em] text-[#06201c]">
                        {t("yourSize")}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="font-body text-sm text-ivory/80">{product.size}</p>
          )}
        </div>

        {/* Mini trust row */}
        <div className="mt-5.5 grid grid-cols-3 gap-2">
          {[
            { icon: <path d="M2 6h20v13H2z" />, label: t("trustAuth") },
            { icon: <path d="M3 12a9 9 0 0115-6.7L21 8M21 3v5h-5M21 12a9 9 0 01-15 6.7L3 16M3 21v-5h5" />, label: t("trustShip") },
            { icon: <path d="M3 11h18v10H3zM7 11V7a5 5 0 0110 0v4" />, label: t("trustSecure") },
          ].map((it, i) => (
            <div key={i} className="rounded-(--radius-input) border border-greige/14 bg-[rgba(20,20,23,.6)] px-1.5 py-3.5 text-center">
              <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="#c9a66b" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="mx-auto">
                {it.icon}
              </svg>
              <div className="font-body mt-1.5 text-[10px] leading-[1.3] text-ivory/66">{it.label}</div>
            </div>
          ))}
        </div>

        {/* Ways to pay — buyer reassurance right where the decision happens */}
        <div className="mt-5.5 rounded-(--radius-input) border border-greige/14 bg-[rgba(20,20,23,.5)] px-4 py-3.5">
          <div className="mb-2.5 flex items-center gap-2">
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="#c9a66b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 11h18v10H3zM7 11V7a5 5 0 0110 0v4" />
            </svg>
            <span className="font-body text-[11px] tracking-[0.14em] text-ivory/70 uppercase">
              {t("waysToPay")}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {["InstaPay", t("payWallet"), t("cod")].map((m) => (
              <span
                key={m}
                className="font-body rounded-(--radius-pill) border border-greige/22 bg-obsidian-soft/40 px-3 py-1.5 text-[11.5px] text-ivory/72"
              >
                {m}
              </span>
            ))}
          </div>
        </div>

        <ProductAccordions
          sections={[
            { title: t("fabricCare"), body: t("fabricCareBody") },
            { title: t("shippingReturns"), body: t("shippingReturnsBody") },
            { title: t("details"), body: desc },
          ]}
        />

        {waHref && (
          <div className="mt-5 flex items-center justify-between gap-4">
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="font-body text-xs text-ivory/55 underline-offset-4 hover:text-aqua hover:underline"
            >
              {t("askWhatsapp")}
            </a>
            <ShareButton title={name} />
          </div>
        )}
      </div>

      {reviews.length > 0 && (
        <section id="reviews" className="pt-6 pb-2.5">
          <h3 className="font-display px-4 mb-3.5 text-2xl text-white">{t("pdpReviewsTitle")}</h3>
          <div className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2">
            {reviews.map((rv) => (
              <div
                key={rv.id}
                className="flex-none basis-[84%] snap-center rounded-(--radius-card) border border-champagne/14 bg-[rgba(20,20,23,.7)] p-4.5"
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-champagne-bright text-xs">{"★".repeat(rv.rating)}</span>
                  <span className="text-[9.5px] text-aqua">✓ {t("verified")}</span>
                </div>
                <p className="font-body mb-3 text-[13.5px] leading-[1.6] text-ivory">
                  &ldquo;{isAr ? rv.bodyAr : rv.bodyEn}&rdquo;
                </p>
                <div className="text-[11.5px] text-ivory/55">
                  — {isAr ? rv.authorNameAr : rv.authorNameEn}, {isAr ? rv.authorCityAr : rv.authorCityEn}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section className="pt-5 pb-6">
          <h3 className="font-display px-4 mb-3.5 text-2xl text-white">{t("relatedTitle")}</h3>
          <div className="no-scrollbar flex gap-3 overflow-x-auto px-4 pb-2">
            {related.map((p) => (
              <RelatedProductCard
                key={p.slug}
                slug={p.slug}
                nameAr={p.nameAr}
                nameEn={p.nameEn}
                price={p.price}
                image={p.images[0]?.url ?? gradientPlaceholder(p.slug, p.nameEn)}
              />
            ))}
          </div>
        </section>
      )}

      <RecentlyViewedRow excludeSlug={product.slug} />

      <StickyBuyBar
        status={product.status}
        priceLabel={formatPrice(product.price, locale)}
        categoryLabel={categoryLabel(product.category, locale)}
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
    </div>
  );
}
