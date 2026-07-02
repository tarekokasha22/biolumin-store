"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { useCart } from "@/lib/cart-store";
import { useWishlist } from "@/lib/wishlist-store";
import { useUI } from "@/lib/ui-store";
import { useHydrated } from "@/lib/use-hydrated";

const ICONS = {
  home: (
    <>
      <path d="M3.6 10.4 12 3.8l8.4 6.6" />
      <path d="M5.6 9v9.6a1 1 0 0 0 1 1h10.8a1 1 0 0 0 1-1V9" />
      <path d="M10 19.6v-4.9a2 2 0 0 1 4 0v4.9" />
    </>
  ),
  bag: (
    <>
      <path d="M6.4 8h11.2l-.85 10.9a1.1 1.1 0 0 1-1.1 1H8.35a1.1 1.1 0 0 1-1.1-1L6.4 8z" />
      <path d="M9.3 8.4V6.7a2.7 2.7 0 0 1 5.4 0v1.7" />
    </>
  ),
  shop: (
    <>
      <path d="M4.4 8.6 5.7 4.8h12.6l1.3 3.8" />
      <path d="M3.8 8.6h16.4" />
      <path d="M5.6 8.6v9.8a1 1 0 0 0 1 1h10.8a1 1 0 0 0 1-1V8.6" />
      <path d="M9.6 19.4v-4.3a1 1 0 0 1 1-1h2.8a1 1 0 0 1 1 1v4.3" />
    </>
  ),
  heart: (
    <path d="M12 20.3l-1.45-1.32C5.4 14.35 2 11.28 2 7.5 2 4.42 4.42 2 7.5 2c1.74 0 3.41.81 4.5 2.09C13.09 2.81 14.76 2 16.5 2 19.58 2 22 4.42 22 7.5c0 3.78-3.4 6.85-8.55 11.54L12 20.3z" />
  ),
};

function TabIcon({ name }: { name: keyof typeof ICONS }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="22"
      height="22"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {ICONS[name]}
    </svg>
  );
}

function Badge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="absolute -top-1 -end-1.5 flex h-[15px] min-w-[15px] items-center justify-center rounded-full bg-champagne px-1 text-[9px] font-bold text-obsidian">
      {count}
    </span>
  );
}

/**
 * Fixed bottom tab bar — replaces the old desktop header nav entirely.
 * Only shown on the three "root" screens (Home/Shop/Wishlist); the PDP
 * shows StickyBuyBar instead, and Cart/Checkout/Confirmation are focused
 * single-task screens with neither.
 */
export function BottomTabBar() {
  const t = useTranslations();
  const pathname = usePathname();
  const cartCount = useCart((s) => s.items.length);
  const wishCount = useWishlist((s) => s.items.length);
  const cartOpen = useUI((s) => s.cartOpen);
  const openCart = useUI((s) => s.openCart);
  const hydrated = useHydrated();

  const visible = pathname === "/" || pathname === "/shop" || pathname === "/wishlist";
  if (!visible) return null;

  const bag = hydrated ? cartCount : 0;
  const wishes = hydrated ? wishCount : 0;

  const tabClass = (active: boolean) =>
    `relative flex flex-1 flex-col items-center gap-[3px] py-[11px] pb-[13px] ${
      active ? "text-champagne-bright" : "text-ivory/50"
    }`;

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-[55] mx-auto flex w-full max-w-(--shell-width) items-stretch border-t border-greige/20 bg-[#0b0b0d]"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <Link href="/" className={tabClass(pathname === "/")}>
        <TabIcon name="home" />
        <span className="text-[9.5px] tracking-[0.04em]">{t("nav.home")}</span>
        {pathname === "/" && <ActiveDash />}
      </Link>
      <Link href="/shop" className={tabClass(pathname === "/shop")}>
        <TabIcon name="shop" />
        <span className="text-[9.5px] tracking-[0.04em]">{t("nav.shop")}</span>
        {pathname === "/shop" && <ActiveDash />}
      </Link>
      <Link href="/wishlist" className={tabClass(pathname === "/wishlist")}>
        <span className="relative inline-flex">
          <TabIcon name="heart" />
          <Badge count={wishes} />
        </span>
        <span className="text-[9.5px] tracking-[0.04em]">{t("wishlist.nav")}</span>
        {pathname === "/wishlist" && <ActiveDash />}
      </Link>
      <button type="button" onClick={openCart} className={tabClass(cartOpen)}>
        <span className="relative inline-flex">
          <TabIcon name="bag" />
          <Badge count={bag} />
        </span>
        <span className="text-[9.5px] tracking-[0.04em]">{t("nav.cart")}</span>
        {cartOpen && <ActiveDash />}
      </button>
    </nav>
  );
}

function ActiveDash() {
  return (
    <span className="absolute top-0 left-1/2 h-[2px] w-[22px] -translate-x-1/2 rounded-full bg-champagne shadow-[0_0_8px_rgba(201,166,107,.7)]" />
  );
}
