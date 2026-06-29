"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { useCart, type CartItem } from "@/lib/cart-store";
import { useUI } from "@/lib/ui-store";
import { useHydrated } from "@/lib/use-hydrated";

type Props = {
  item: CartItem;
  status: "AVAILABLE" | "RESERVED" | "SOLD";
};

export function AddToCart({ item, status }: Props) {
  const t = useTranslations("product");
  const tc = useTranslations("cart");
  const add = useCart((s) => s.add);
  const openCart = useUI((s) => s.openCart);
  const has = useCart((s) => s.items.some((i) => i.productId === item.productId));
  const mounted = useHydrated();

  if (status === "SOLD") {
    return (
      <div className="font-body rounded-sm border border-ivory/15 bg-obsidian-soft/40 px-6 py-5 text-center">
        <p className="text-lg text-ivory/80">{t("soldOut")}</p>
        <p className="mt-2 text-sm text-ivory/50">{t("soldOutNote")}</p>
      </div>
    );
  }

  if (status === "RESERVED") {
    return (
      <div className="font-body rounded-sm border border-champagne/30 bg-obsidian-soft/40 px-6 py-5 text-center">
        <p className="text-lg text-champagne">{t("reservedNote")}</p>
      </div>
    );
  }

  const inCart = mounted && has;

  if (inCart) {
    return (
      <div className="flex flex-col gap-3">
        <div className="font-body rounded-full border border-champagne/40 bg-champagne/10 px-9 py-4 text-center text-xs uppercase tracking-[0.25em] text-champagne">
          {t("inCart")} ✓
        </div>
        <button
          onClick={openCart}
          className="font-body rounded-full bg-champagne px-9 py-4 text-center text-xs uppercase tracking-[0.25em] text-obsidian transition-opacity hover:opacity-90"
        >
          {tc("viewBag")}
        </button>
      </div>
    );
  }

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={() => {
        add(item);
        openCart();
      }}
      className="font-body group relative flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-full bg-champagne px-9 py-[18px] text-xs font-semibold uppercase tracking-[0.25em] text-obsidian transition-all duration-300 hover:bg-[#e3c895]"
      style={{
        boxShadow:
          "0 0 0 1px rgba(201,166,107,.55), 0 14px 44px -14px rgba(201,166,107,.55)",
      }}
    >
      <svg
        viewBox="0 0 24 24"
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M6 8h12l-1 12H7z" />
        <path d="M9 8a3 3 0 016 0" />
      </svg>
      {t("addToCart")}
    </motion.button>
  );
}
