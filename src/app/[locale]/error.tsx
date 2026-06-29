"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

// Route-segment error boundary. Lives inside the locale layout, so the intl
// provider, fonts and brand styles are all available. Reduced-motion-safe:
// it's a quiet static fallback, no animation.
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("errors");

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-[70vh] flex-col items-center justify-center px-6 py-32 text-center">
      <p className="font-body text-[11px] uppercase tracking-[0.35em] text-champagne">
        {t("errorKicker")}
      </p>
      <h1 className="font-display mt-5 text-4xl text-ivory sm:text-5xl">
        {t("errorTitle")}
      </h1>
      <p className="font-body mx-auto mt-5 max-w-md text-sm leading-relaxed text-ivory/55">
        {t("errorBody")}
      </p>
      <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
        <button
          onClick={() => reset()}
          className="font-body rounded-full border border-champagne/60 px-8 py-3.5 text-[11px] uppercase tracking-[0.2em] text-champagne transition-colors hover:bg-champagne hover:text-obsidian"
        >
          {t("errorRetry")}
        </button>
        <Link
          href="/"
          className="font-body text-[11px] uppercase tracking-[0.2em] text-ivory/50 underline-offset-4 transition-colors hover:text-ivory"
        >
          {t("errorHome")}
        </Link>
      </div>
    </main>
  );
}
