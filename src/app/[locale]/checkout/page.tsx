import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { paymobEnabled } from "@/lib/payments";

type Props = { params: Promise<{ locale: string }> };

// Transactional page — never indexed.
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function CheckoutPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("checkout");

  return (
    <main className="px-6 pb-32 pt-36">
      <div className="mx-auto max-w-5xl">
        <h1 className="font-display mb-12 text-4xl text-ivory sm:text-5xl">
          {t("title")}
        </h1>
        <CheckoutForm cardEnabled={paymobEnabled()} />
      </div>
    </main>
  );
}
