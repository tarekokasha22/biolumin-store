import { setRequestLocale } from "next-intl/server";
import { paymobEnabled } from "@/lib/payments";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";

type Props = { params: Promise<{ locale: string }> };

export default async function CheckoutPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="px-4 pt-4.5 pb-2">
      <CheckoutForm cardEnabled={paymobEnabled()} />
    </div>
  );
}
