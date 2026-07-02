"use client";

import { useTranslations, useLocale } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { useCart } from "@/lib/cart-store";
import { useUI } from "@/lib/ui-store";
import { useHydrated } from "@/lib/use-hydrated";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Logo } from "@/components/ui/Logo";

/**
 * Header shrinks to just back/logo/lang/cart — the desktop nav links
 * and mobile hamburger are gone, replaced by BottomTabBar everywhere.
 * Full glass-background + back-button restyle lands with the
 * AnnouncementBar marquee rewrite (same phase, avoids restyling twice).
 */
export function Header() {
  const t = useTranslations("nav");
  const tb = useTranslations("brand");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const items = useCart((s) => s.items);
  const openCart = useUI((s) => s.openCart);
  const mounted = useHydrated();

  const switchLocale = locale === "ar" ? "en" : "ar";
  const toggleLocale = () =>
    router.replace(pathname, { locale: switchLocale });

  const count = mounted ? items.length : 0;

  return (
    <header className="sticky top-0 z-50 bg-obsidian border-b border-greige/16">
      <AnnouncementBar />
      <nav className="flex h-14 items-center justify-between px-3.5">
        <div className="flex min-w-[74px] items-center gap-1.5" />

        <Link href="/" aria-label={tb("name")} className="flex items-center">
          <Logo />
        </Link>

        <div className="flex min-w-[74px] items-center justify-end gap-2">
          <button
            onClick={toggleLocale}
            className="rounded-full border border-greige/34 px-2.5 py-1 font-body text-[10.5px] uppercase tracking-[0.12em] text-ivory/85"
            aria-label="Switch language"
          >
            {switchLocale === "en" ? "EN" : "ع"}
          </button>

          <button
            onClick={openCart}
            className="relative inline-flex items-center p-1 text-ivory"
            aria-label={t("cart")}
          >
            <svg
              viewBox="0 0 24 24"
              width="25"
              height="25"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 7h12l-1 13H7L6 7z" />
              <path d="M9 7a3 3 0 016 0" />
            </svg>
            {count > 0 && (
              <span className="absolute -end-1 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-champagne px-1 text-[9.5px] font-bold text-obsidian">
                {count}
              </span>
            )}
          </button>
        </div>
      </nav>
    </header>
  );
}
