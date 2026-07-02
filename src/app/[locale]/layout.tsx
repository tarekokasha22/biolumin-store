import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { fontVars } from "@/lib/fonts";
import { SmoothScroll } from "@/components/providers/SmoothScroll";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Newsletter } from "@/components/layout/Newsletter";
import { PhoneShell } from "@/components/layout/PhoneShell";
import { BottomTabBar } from "@/components/layout/BottomTabBar";
import { WhatsAppFab } from "@/components/layout/WhatsAppFab";
import { PageTransition } from "@/components/motion/PageTransition";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { Toast } from "@/components/ui/Toast";
import { LiveActivityToast } from "@/components/ui/LiveActivityToast";
import { SITE_URL, canonical, alternateLanguages } from "@/lib/seo";
import "../globals.css";

const META = {
  ar: {
    title: "BIOLUMIN — نورك يبان",
    description:
      "بوتيك مصري حصري · قطعة واحدة بس من كل تصميم. النور اللي جوّاكي يبان في لبسك. شحن لكل المحافظات والدفع عند الاستلام.",
  },
  en: {
    title: "BIOLUMIN — Wear your light",
    description:
      "An exclusive Egyptian boutique · one of each, only one. Rare pieces that make you feel rare. Nationwide delivery and cash on delivery.",
  },
} as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const m = locale === "en" ? META.en : META.ar;
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: m.title, template: `%s · BIOLUMIN` },
    description: m.description,
    applicationName: "BIOLUMIN",
    alternates: {
      canonical: canonical(locale, "/"),
      languages: alternateLanguages("/"),
    },
    openGraph: {
      type: "website",
      siteName: "BIOLUMIN",
      title: m.title,
      description: m.description,
      url: canonical(locale, "/"),
      locale: locale === "en" ? "en_US" : "ar_EG",
    },
    twitter: {
      card: "summary_large_image",
      title: m.title,
      description: m.description,
    },
    robots: { index: true, follow: true },
  };
}

export const viewport: Viewport = {
  themeColor: "#0e0e10",
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <html lang={locale} dir={dir} className={`${fontVars} grain`}>
      <body className="min-h-screen text-ivory antialiased">
        <NextIntlClientProvider>
          <PhoneShell>
            <SmoothScroll>
              <Header />
              <main className="relative z-10 pb-20">
                <PageTransition>{children}</PageTransition>
              </main>
              <div className="relative z-10">
                <Newsletter />
                <Footer />
              </div>
            </SmoothScroll>
            <CartDrawer />
            <BottomTabBar />
            <WhatsAppFab />
            <Toast />
            <LiveActivityToast />
          </PhoneShell>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
