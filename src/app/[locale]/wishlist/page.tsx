import { setRequestLocale, getTranslations } from "next-intl/server";
import { WishlistView } from "@/components/shop/WishlistView";

type Props = { params: Promise<{ locale: string }> };

export default async function WishlistPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("wishlist");

  return (
    <div className="px-4 pt-6 pb-2">
      <div className="font-body mb-1.5 text-[10.5px] tracking-[0.3em] text-champagne uppercase">{t("nav")}</div>
      <h1 className="font-display mb-5 text-[34px] leading-[1.05] text-white">{t("title")}</h1>
      <WishlistView />
    </div>
  );
}
