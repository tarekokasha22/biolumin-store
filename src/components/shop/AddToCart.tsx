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
      whileTap={{ scale: 0.97 }}
      onClick={() => {
        add(item);
        openCart();
      }}
      className="font-body group relative w-full overflow-hidden rounded-full border border-champagne/50 px-9 py-4 text-xs uppercase tracking-[0.25em] text-ivory transition-all duration-500 hover:border-champagne hover:bg-champagne hover:text-obsidian"
    >
      {t("addToCart")}
    </motion.button>
  );
}
