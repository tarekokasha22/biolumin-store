"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { useCart } from "@/lib/cart-store";
import { useUI } from "@/lib/ui-store";
import { formatPrice } from "@/lib/format";
import { FREE_SHIP_THRESHOLD, amountToFreeShipping } from "@/lib/shipping";
import { useHydrated } from "@/lib/use-hydrated";
import { BottomSheet } from "@/components/ui/BottomSheet";

export function CartDrawer() {
  const t = useTranslations("cart");
  const locale = useLocale();
  const pathname = usePathname();
  const items = useCart((s) => s.items);
  const remove = useCart((s) => s.remove);
  const open = useUI((s) => s.cartOpen);
  const closeCart = useUI((s) => s.closeCart);
  const mounted = useHydrated();

  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    if (open) closeCart();
  }

  const subtotal = mounted ? items.reduce((s, i) => s + i.price, 0) : 0;
  const toFree = amountToFreeShipping(subtotal);
  const freeShip = subtotal >= FREE_SHIP_THRESHOLD;
  const pct = Math.min(100, Math.round((subtotal / FREE_SHIP_THRESHOLD) * 100));

  return (
    <BottomSheet open={open} onClose={closeCart} ariaLabel={t("drawerTitle")}>
      <div className="flex items-center justify-between px-[18px] pb-3.5">
        <h3 className="font-display text-[23px] text-white">
          {t("drawerTitle")}
          {mounted && items.length > 0 && (
            <span className="ms-2 text-sm text-ivory/45">({items.length})</span>
          )}
        </h3>
      </div>

      {!mounted || items.length === 0 ? (
        <div className="px-[30px] py-[50px] text-center">
          <div className="mx-auto mb-4 flex h-[58px] w-[58px] items-center justify-center rounded-full border border-champagne/25 bg-champagne/10 text-champagne">
            <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 7h12l-1 13H7L6 7z" />
              <path d="M9 7a3 3 0 016 0" />
            </svg>
          </div>
          <p className="font-body mb-5 text-[15px] text-ivory/62">{t("empty")}</p>
          <Link
            href="/shop"
            onClick={closeCart}
            className="font-body rounded-(--radius-button) bg-linear-to-r from-[#d8b87a] to-champagne px-6.5 py-3.5 text-[13px] font-semibold text-[#1a160d]"
          >
            {t("emptyCta")}
          </Link>
        </div>
      ) : (
        <div>
          {!freeShip && (
            <div className="px-[18px] pt-1 pb-1">
              <p className="font-body mb-1.5 text-[11.5px] text-aqua-light">{t("freeShipProgress", { amount: formatPrice(toFree, locale) })}</p>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-greige/22">
                <div className="h-full rounded-full bg-linear-to-r from-champagne to-aqua-light" style={{ width: `${pct}%` }} />
              </div>
            </div>
          )}

          <div className="max-h-[42svh] overflow-y-auto px-[18px]">
            {items.map((item, i) => {
              const name = locale === "ar" ? item.nameAr : item.nameEn;
              return (
                <div key={`${item.productId}-${i}`} className="flex gap-3 border-b border-greige/12 py-3.5">
                  <Link href={`/shop/${item.slug}`} onClick={closeCart} className="relative aspect-3/4 w-16 flex-none overflow-hidden rounded-[10px] bg-obsidian">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.image} alt={name} className="h-full w-full object-cover" />
                  </Link>
                  <div className="flex flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <Link href={`/shop/${item.slug}`} onClick={closeCart} className="font-display text-base text-ivory">
                        {name}
                      </Link>
                      <button onClick={() => remove(item.productId)} aria-label={t("remove")} className="flex-none p-0.5 text-ivory/40">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                          <path d="M6 6l12 12M18 6L6 18" />
                        </svg>
                      </button>
                    </div>
                    {item.size && <p className="font-body mt-0.5 text-[11px] text-ivory/50">{item.size}</p>}
                    <div className="mt-auto flex items-center justify-between pt-2">
                      <span className="font-body text-sm font-semibold text-white">{formatPrice(item.price, locale)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="border-t border-greige/16 bg-[rgba(15,15,17,.8)] px-[18px] pt-3.5" style={{ paddingBottom: "calc(16px + env(safe-area-inset-bottom))" }}>
            <div className="mb-1.5 flex justify-between font-body text-[13px] text-ivory/70">
              <span>{t("subtotal")}</span>
              <span>{formatPrice(subtotal, locale)}</span>
            </div>
            <div className="mb-2.5 flex justify-between font-body text-[13px] text-ivory/70">
              <span>{t("shipping")}</span>
              <span className="text-aqua-light">{t("shippingCalc")}</span>
            </div>
            <div className="mb-3.5 flex justify-between font-body text-[18px] font-semibold text-white">
              <span>{t("total")}</span>
              <span>{formatPrice(subtotal, locale)}</span>
            </div>
            <Link
              href="/checkout"
              onClick={closeCart}
              className="font-body block w-full rounded-(--radius-button) bg-linear-to-r from-[#d8b87a] to-champagne py-4 text-center text-[15px] font-bold text-[#1a160d] shadow-[0_10px_28px_-10px_rgba(201,166,107,.55)]"
            >
              {t("checkout")}
            </Link>
            <div className="mt-2.5 text-center font-body text-[10.5px] text-ivory/45">{t("codReassurance")}</div>
          </div>
        </div>
      )}
    </BottomSheet>
  );
}
