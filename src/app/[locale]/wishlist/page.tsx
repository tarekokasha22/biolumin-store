import { setRequestLocale, getTranslations } from "next-intl/server";
import { Reveal } from "@/components/motion/Reveal";
import { WishlistView } from "@/components/shop/WishlistView";

type Props = { params: Promise<{ locale: string }> };

export default async function WishlistPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("wishlist");

  return (
    <main className="px-6 pb-32 pt-36">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <header className="mb-16 text-center">
            <p className="font-body text-[11px] uppercase tracking-[0.35em] text-champagne">
              {t("nav")}
            </p>
            <h1 className="font-display mt-4 text-5xl text-ivory sm:text-6xl">
              {t("title")}
            </h1>
          </header>
        </Reveal>

        <WishlistView />
      </div>
    </main>
  );
}
