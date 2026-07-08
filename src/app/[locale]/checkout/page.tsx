import { setRequestLocale, getTranslations } from "next-intl/server";
import { paymobEnabled } from "@/lib/payments";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";

type Props = { params: Promise<{ locale: string }> };

export default async function CheckoutPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("checkout");

  return (
    <div className="px-4 pt-5 pb-4">
      <div className="mb-6 text-center">
        <h1 className="font-display text-[28px] leading-[1.15] text-white">{t("title")}</h1>
        <p className="font-body mt-2 text-[13px] text-ivory/55">{t("secureNote")}</p>
      </div>
      <CheckoutForm cardEnabled={paymobEnabled()} />
    </div>
  );
}
