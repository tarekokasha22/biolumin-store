import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Logo } from "@/components/ui/Logo";

export function Footer() {
  const t = useTranslations("footer");
  const locale = useLocale();

  return (
    <footer className="border-t border-greige/16 bg-[rgba(10,10,12,.6)] px-[18px] pt-[52px] pb-[calc(96px+env(safe-area-inset-bottom))]">

      {/* ── Brand centrepiece ─────────────────────────────── */}
      <div className="flex flex-col items-center text-center mb-9">

        {/* Horizontal wordmark — matches the nav logo exactly */}
        <Logo size="md" className="mb-3" />

        {/* Tagline: Arabic locale → Arabic only, English locale → English only */}
        {locale === "ar" ? (
          <p
            dir="rtl"
            style={{
              fontFamily: "var(--font-amiri, var(--font-cormorant)), Georgia, serif",
              fontSize: "18px",
              letterSpacing: "0.06em",
              color: "rgba(201,166,107,0.85)",
            }}
          >
            نورِك يبان
          </p>
        ) : (
          <p className="font-body text-[11px] uppercase tracking-[0.32em] text-ivory/45">
            Wear your light
          </p>
        )}

        {/* Subtle champagne divider */}
        <div
          className="mt-5 h-px w-16"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(201,166,107,0.45), transparent)",
          }}
        />
      </div>

      {/* ── Social + Story ────────────────────────────────── */}
      <div className="mb-7 flex justify-center gap-2.5">
        <a
          href="https://instagram.com/biolumin.eg"
          target="_blank"
          rel="noreferrer"
          aria-label={t("instagram")}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-greige/20 bg-white/5 text-ivory transition-colors hover:border-champagne/50 hover:text-champagne"
        >
          <svg
            viewBox="0 0 24 24"
            width="17"
            height="17"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <rect x="3" y="3" width="18" height="18" rx="5" />
            <circle cx="12" cy="12" r="4" />
            <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
          </svg>
        </a>

        <a
          href="https://tiktok.com/@biolumin.eg"
          target="_blank"
          rel="noreferrer"
          aria-label={t("tiktok")}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-greige/20 bg-white/5 text-ivory transition-colors hover:border-champagne/50 hover:text-champagne"
        >
          <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor">
            <path d="M13 3v12.5a3.5 3.5 0 11-3.5-3.5c.3 0 .7 0 1 .1V9.1a6.4 6.4 0 00-1-.1A6.5 6.5 0 1016 15.5V8.8a7.7 7.7 0 004 1.1V6.6a4.6 4.6 0 01-4-3.6 4.7 4.7 0 01-.1-.9z" />
          </svg>
        </a>

        <Link
          href="/story"
          className="flex h-10 items-center rounded-full border border-greige/20 bg-white/5 px-4 font-body text-xs uppercase tracking-[0.1em] text-ivory transition-colors hover:border-champagne/50 hover:text-champagne"
        >
          {t("story")}
        </Link>
      </div>

      {/* ── Copyright ─────────────────────────────────────── */}
      <div className="font-body text-center text-[10.5px] tracking-[0.04em] text-ivory/28">
        © {new Date().getFullYear()} BIOLUMIN · {t("rights")}
      </div>
    </footer>
  );
}
