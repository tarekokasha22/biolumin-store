import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export function Footer() {
  const t = useTranslations("footer");
  const tb = useTranslations("brand");

  return (
    <footer className="relative mt-32 border-t border-greige/15 bg-obsidian px-6 py-16">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-8 text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/brand/wordmark.png"
          alt={tb("name")}
          className="h-10 w-auto mix-blend-screen"
        />
        <p className="font-display text-lg text-champagne">{t("tagline")}</p>
        <div className="rule-gold w-40" />
        <div className="flex flex-wrap items-center justify-center gap-8 font-body text-xs uppercase tracking-[0.2em] text-ivory/60">
          <Link href="/shop" className="hover:text-champagne">
            {t("shop")}
          </Link>
          <Link href="/story" className="hover:text-champagne">
            {t("story")}
          </Link>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noreferrer"
            className="hover:text-champagne"
          >
            {t("instagram")}
          </a>
          <a
            href="https://tiktok.com"
            target="_blank"
            rel="noreferrer"
            className="hover:text-champagne"
          >
            {t("tiktok")}
          </a>
        </div>
        <p className="font-body text-[11px] uppercase tracking-[0.2em] text-greige">
          © {new Date().getFullYear()} {tb("name")} · {t("rights")}
        </p>
      </div>
    </footer>
  );
}
