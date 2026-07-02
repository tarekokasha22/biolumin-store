import { setRequestLocale, getTranslations } from "next-intl/server";
import { CartView } from "@/components/cart/CartView";

type Props = { params: Promise<{ locale: string }> };

export default async function CartPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("cart");

  return (
    <div className="px-4 pt-6 pb-2">
      <h1 className="font-display mb-5 text-[28px] text-white">{t("title")}</h1>
      <CartView />
    </div>
  );
}
