import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { canonical, alternateLanguages } from "@/lib/seo";
import { StoryScroll } from "@/components/story/StoryScroll";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "story" });
  return {
    title: t("title"),
    description: t("body").replace(/\n/g, " ").slice(0, 160),
    alternates: {
      canonical: canonical(locale, "/story"),
      languages: alternateLanguages("/story"),
    },
    openGraph: {
      title: t("title"),
      description: t("body").replace(/\n/g, " ").slice(0, 160),
      url: canonical(locale, "/story"),
    },
  };
}

export default async function StoryPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <StoryScroll />;
}
