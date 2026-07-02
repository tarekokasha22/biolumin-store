import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Logo } from "@/components/ui/Logo";

export function Footer() {
  const t = useTranslations("footer");

  return (
    <footer className="border-t border-greige/16 bg-[rgba(10,10,12,.5)] px-[18px] pt-[30px] pb-[calc(88px+env(safe-area-inset-bottom))]">
      <Logo size="sm" className="mb-2" />
      <p className="font-body mb-4.5 max-w-[320px] text-[12.5px] leading-[1.7] text-ivory/55">
        {t("about")}
      </p>
      <div className="mb-4.5 flex gap-2.5">
        <a
          href="https://instagram.com/biolumin.eg"
          target="_blank"
          rel="noreferrer"
          aria-label={t("instagram")}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-greige/20 bg-white/5 text-ivory"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5">
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
          className="flex h-10 w-10 items-center justify-center rounded-full border border-greige/20 bg-white/5 text-ivory"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
            <path d="M13 3v12.5a3.5 3.5 0 11-3.5-3.5c.3 0 .7 0 1 .1V9.1a6.4 6.4 0 00-1-.1A6.5 6.5 0 1016 15.5V8.8a7.7 7.7 0 004 1.1V6.6a4.6 4.6 0 01-4-3.6 4.7 4.7 0 01-.1-.9z" />
          </svg>
        </a>
        <Link
          href="/story"
          className="flex h-10 items-center rounded-full border border-greige/20 bg-white/5 px-4 font-body text-xs uppercase tracking-[0.1em] text-ivory"
        >
          {t("story")}
        </Link>
      </div>
      <div className="font-body text-[10.5px] tracking-[0.04em] text-ivory/35">
        © {new Date().getFullYear()} BIOLUMIN · {t("rights")}
      </div>
    </footer>
  );
}
