"use client";

import { useTranslations, useLocale } from "next-intl";
import { useCart, type CartItem } from "@/lib/cart-store";
import { useUI } from "@/lib/ui-store";
import { useHydrated } from "@/lib/use-hydrated";
import { formatPrice } from "@/lib/format";

type Props = {
  item: CartItem;
  status: "AVAILABLE" | "RESERVED" | "SOLD";
  price: number;
};

/** Mobile-only sticky bottom bar with price + primary CTA. Hidden on desktop. */
export function StickyBuyBar({ item, status, price }: Props) {
  const t = useTranslations("product");
  const tc = useTranslations("cart");
  const locale = useLocale();
  const add = useCart((s) => s.add);
  const openCart = useUI((s) => s.openCart);
  const has = useCart((s) => s.items.some((i) => i.productId === item.productId));
  const mounted = useHydrated();

  if (status === "SOLD") return null;

  const inCart = mounted && has;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 border-t border-ivory/10 bg-obsidian/95 px-4 py-3 backdrop-blur-md md:hidden"
      style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}
    >
      <div className="mx-auto flex max-w-md items-center gap-3">
        <div className="flex min-w-0 flex-col">
          <span className="font-body text-[10px] uppercase tracking-[0.18em] text-ivory/45">
            {t("oneOfOne")}
          </span>
          <span className="font-body truncate text-lg text-ivory">
            {formatPrice(price, locale)}
          </span>
        </div>

        {status === "RESERVED" ? (
          <span className="font-body ms-auto rounded-full border border-champagne/40 px-6 py-3 text-center text-[11px] uppercase tracking-[0.2em] text-champagne">
            {t("reserved")}
          </span>
        ) : inCart ? (
          <button
            onClick={openCart}
            className="font-body ms-auto rounded-full bg-champagne px-7 py-3 text-[11px] uppercase tracking-[0.2em] text-obsidian transition-opacity hover:opacity-90"
          >
            {tc("viewBag")}
          </button>
        ) : (
          <button
            onClick={() => {
              add(item);
              openCart();
            }}
            className="font-body ms-auto rounded-full bg-champagne px-7 py-3 text-[11px] uppercase tracking-[0.2em] text-obsidian transition-opacity hover:opacity-90"
          >
            {t("addToCart")}
          </button>
        )}
      </div>
    </div>
  );
}
