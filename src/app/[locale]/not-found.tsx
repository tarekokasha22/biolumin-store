import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

// Locale-scoped 404. Covers any unknown path under /ar or /en, plus any
// notFound() thrown by a page (e.g. a product slug that doesn't exist).
export default async function NotFound() {
  const t = await getTranslations("errors");

  return (
    <main className="flex min-h-[70vh] flex-col items-center justify-center px-6 py-32 text-center">
      <p className="font-body text-[11px] uppercase tracking-[0.35em] text-champagne">
        {t("notFoundKicker")}
      </p>
      <h1 className="font-display mt-5 text-4xl text-ivory sm:text-5xl">
        {t("notFoundTitle")}
      </h1>
      <p className="font-body mx-auto mt-5 max-w-md text-sm leading-relaxed text-ivory/55">
        {t("notFoundBody")}
      </p>
      <Link
        href="/shop"
        className="font-body mt-10 rounded-full border border-champagne/60 px-8 py-3.5 text-[11px] uppercase tracking-[0.2em] text-champagne transition-colors hover:bg-champagne hover:text-obsidian"
      >
        {t("notFoundCta")}
      </Link>
    </main>
  );
}
