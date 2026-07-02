"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useCart, type CartItem } from "@/lib/cart-store";
import { useUI } from "@/lib/ui-store";
import { useHydrated } from "@/lib/use-hydrated";

type Props = {
  item: CartItem;
  status: "AVAILABLE" | "RESERVED" | "SOLD";
  priceLabel: string;
  categoryLabel: string;
};

/**
 * PDP-only sticky bottom bar — absorbs AddToCart.tsx's 4-state machine
 * (sold / reserved / available / already-in-cart), which is richer than
 * the design prototype's simpler 3-state version and worth keeping.
 */
export function StickyBuyBar({ item, status, priceLabel, categoryLabel }: Props) {
  const t = useTranslations("product");
  const tc = useTranslations("cart");
  const tToast = useTranslations("toast");
  const router = useRouter();
  const add = useCart((s) => s.add);
  const openCart = useUI((s) => s.openCart);
  const showToast = useUI((s) => s.showToast);
  const has = useCart((s) => s.items.some((i) => i.productId === item.productId));
  const mounted = useHydrated();

  const bar =
    "fixed inset-x-0 bottom-0 z-55 mx-auto w-full max-w-(--shell-width) border-t px-3.5 bg-[#0b0b0d]";

  if (status === "SOLD" || status === "RESERVED") {
    return (
      <div
        className={`${bar} border-greige/25 py-3.5 text-center`}
        style={{ paddingBottom: "calc(14px + env(safe-area-inset-bottom))" }}
      >
        <p className="font-body text-sm text-ivory/70">
          {status === "SOLD" ? t("soldOutNote") : t("reservedNote")}
        </p>
      </div>
    );
  }

  const inCart = mounted && has;

  return (
    <div
      className={`${bar} border-champagne/20 py-2.5`}
      style={{ paddingBottom: "calc(11px + env(safe-area-inset-bottom))" }}
    >
      <div className="flex items-center gap-2.5">
        <div className="flex-none">
          <div className="font-body text-[10px] leading-none text-ivory/50">{categoryLabel}</div>
          <div className="font-body text-[18px] leading-[1.2] font-semibold text-white">{priceLabel}</div>
        </div>
        {inCart ? (
          <>
            <div className="font-body flex h-[50px] flex-1 items-center justify-center rounded-(--radius-button) border border-champagne/50 bg-champagne/12 text-[13px] font-semibold text-champagne-bright">
              {t("inCart")} ✓
            </div>
            <button
              type="button"
              onClick={openCart}
              className="font-body h-[50px] flex-1 rounded-(--radius-button) bg-champagne text-[13px] font-bold text-obsidian"
            >
              {tc("viewBag")}
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => {
                add(item);
                showToast(tToast("addedToBag"));
                openCart();
              }}
              className="font-body h-[50px] flex-1 rounded-(--radius-button) border border-champagne/50 bg-champagne/12 text-[13px] font-semibold text-champagne-bright"
            >
              {t("addToCart")}
            </button>
            <button
              type="button"
              onClick={() => {
                add(item);
                router.push("/checkout");
              }}
              className="font-body h-[50px] flex-1 rounded-(--radius-button) bg-linear-to-r from-[#d8b87a] to-champagne text-[13px] font-bold text-[#1a160d] shadow-[0_8px_22px_-8px_rgba(201,166,107,.6)]"
            >
              {t("buyNow")}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
