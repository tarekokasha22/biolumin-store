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

export function StickyBuyBar({ item, status, priceLabel, categoryLabel }: Props) {
  const t = useTranslations("product");
  const tc = useTranslations("cart");
  const router = useRouter();
  const add = useCart((s) => s.add);
  const openCart = useUI((s) => s.openCart);
  const has = useCart((s) => s.items.some((i) => i.productId === item.productId));
  const mounted = useHydrated();

  const bar =
    "fixed inset-x-0 bottom-0 z-55 mx-auto w-full max-w-(--shell-width) border-t border-champagne/15 bg-[rgba(8,8,10,.97)] backdrop-blur-md";

  if (status === "SOLD" || status === "RESERVED") {
    return (
      <div
        className={`${bar} py-3.5 text-center`}
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
      className={`${bar} px-3.5 py-3`}
      style={{ paddingBottom: "calc(12px + env(safe-area-inset-bottom))" }}
    >
      <div className="flex items-center gap-2.5">
        <div className="flex-none min-w-[72px]">
          <div className="font-body text-[9px] leading-none tracking-[0.08em] text-ivory/45 uppercase">{categoryLabel}</div>
          <div className="font-body text-[17px] leading-[1.2] font-bold text-white">{priceLabel}</div>
        </div>
        {inCart ? (
          <>
            <div className="font-body flex h-[52px] flex-1 items-center justify-center rounded-(--radius-button) border border-aqua/40 bg-aqua/10 text-[13px] font-semibold text-aqua-light">
              {t("inCart")} ✓
            </div>
            <button
              type="button"
              onClick={openCart}
              className="font-body h-[52px] flex-1 rounded-(--radius-button) bg-linear-to-r from-[#e8c88a] via-champagne to-[#d4a85c] text-[14px] font-bold text-[#1a1208] shadow-[0_6px_24px_-4px_rgba(201,166,107,.7)] active:scale-[0.98] transition-transform"
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
                openCart();
              }}
              className="font-body h-[52px] flex-1 rounded-(--radius-button) border-2 border-champagne/60 bg-champagne/15 text-[13px] font-bold text-champagne-bright shadow-[0_4px_16px_-4px_rgba(201,166,107,.35)] active:scale-[0.98] transition-transform"
            >
              {t("addToCart")}
            </button>
            <button
              type="button"
              onClick={() => {
                add(item);
                router.push("/checkout");
              }}
              className="font-body h-[52px] flex-[1.15] rounded-(--radius-button) bg-linear-to-r from-[#e8c88a] via-champagne to-[#d4a85c] text-[14px] font-bold text-[#1a1208] shadow-[0_8px_28px_-6px_rgba(201,166,107,.75)] active:scale-[0.98] transition-transform"
            >
              {t("buyNow")} →
            </button>
          </>
        )}
      </div>
    </div>
  );
}
