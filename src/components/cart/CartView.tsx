"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useCart } from "@/lib/cart-store";
import { formatPrice } from "@/lib/format";
import { useHydrated } from "@/lib/use-hydrated";

export function CartView() {
  const t = useTranslations("cart");
  const locale = useLocale();
  const items = useCart((s) => s.items);
  const remove = useCart((s) => s.remove);
  const mounted = useHydrated();
  const [soldNotice, setSoldNotice] = useState(false);

  // Re-validate one-of-one availability on entry; prune anything sold.
  useEffect(() => {
    if (items.length === 0) return;
    const ids = items.map((i) => i.productId);
    fetch("/api/products/availability", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productIds: ids }),
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((res) => {
        if (!res?.statuses) return;
        let pruned = false;
        for (const i of items) {
          if (res.statuses[i.productId] === "SOLD") {
            remove(i.productId);
            pruned = true;
          }
        }
        if (pruned) setSoldNotice(true);
      })
      .catch(() => {});
    // run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!mounted) return null;

  const subtotal = items.reduce((s, i) => s + i.price, 0);

  if (items.length === 0) {
    return (
      <div className="py-16 text-center">
        {soldNotice && <p className="font-body mb-5 text-sm text-champagne">{t("soldRemoved")}</p>}
        <p className="font-body text-[15px] text-ivory/62">{t("empty")}</p>
        <Link
          href="/shop"
          className="font-body mt-6 inline-block rounded-(--radius-button) border border-champagne/50 px-6.5 py-3.5 text-[13px] text-ivory"
        >
          {t("emptyCta")}
        </Link>
      </div>
    );
  }

  return (
    <div>
      {soldNotice && <p className="font-body mb-4 text-sm text-champagne">{t("soldRemoved")}</p>}
      <ul className="divide-y divide-greige/12">
        <AnimatePresence initial={false}>
          {items.map((item) => {
            const name = locale === "ar" ? item.nameAr : item.nameEn;
            return (
              <motion.li key={item.productId} layout exit={{ opacity: 0, height: 0 }} className="flex gap-3.5 py-4">
                <Link href={`/shop/${item.slug}`} className="relative aspect-3/4 w-20 flex-none overflow-hidden rounded-(--radius-card-sm) bg-obsidian-soft">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.image} alt={name} className="h-full w-full object-cover" />
                </Link>
                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <Link href={`/shop/${item.slug}`} className="font-display text-base text-ivory">
                      {name}
                    </Link>
                    {item.size && <p className="font-body mt-0.5 text-xs text-ivory/40">{item.size}</p>}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-body text-sm text-ivory/70">{formatPrice(item.price, locale)}</span>
                    <button onClick={() => remove(item.productId)} className="font-body text-[11px] text-ivory/40 uppercase">
                      {t("remove")}
                    </button>
                  </div>
                </div>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ul>

      <div className="mt-5 rounded-[14px] border border-greige/16 bg-panel/60 p-4">
        <div className="font-body flex justify-between text-sm text-ivory/70">
          <span>{t("subtotal")}</span>
          <span>{formatPrice(subtotal, locale)}</span>
        </div>
        <div className="font-body mt-2 flex justify-between text-sm text-ivory/50">
          <span>{t("shipping")}</span>
          <span>{t("shippingCalc")}</span>
        </div>
        <div className="rule-gold my-3.5 h-px w-full" />
        <div className="font-body flex justify-between text-base text-white">
          <span>{t("total")}</span>
          <span>{formatPrice(subtotal, locale)}</span>
        </div>
        <Link
          href="/checkout"
          className="font-body mt-4 block rounded-(--radius-button) bg-linear-to-r from-[#d8b87a] to-champagne py-4 text-center text-[15px] font-bold text-[#1a160d]"
        >
          {t("checkout")}
        </Link>
      </div>
    </div>
  );
}
