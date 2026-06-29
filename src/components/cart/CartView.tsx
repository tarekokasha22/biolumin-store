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
      <div className="py-24 text-center">
        {soldNotice && (
          <p className="font-body mb-6 text-sm text-champagne">
            {t("soldRemoved")}
          </p>
        )}
        <p className="font-body text-lg text-ivory/60">{t("empty")}</p>
        <Link
          href="/shop"
          className="font-body mt-8 inline-block rounded-full border border-champagne/50 px-9 py-4 text-xs uppercase tracking-[0.25em] text-ivory transition-all hover:bg-champagne hover:text-obsidian"
        >
          {t("emptyCta")}
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-12 lg:grid-cols-[1fr_360px]">
      <div>
        {soldNotice && (
          <p className="font-body mb-6 text-sm text-champagne">
            {t("soldRemoved")}
          </p>
        )}
        <ul className="divide-y divide-ivory/10">
          <AnimatePresence initial={false}>
            {items.map((item) => {
              const name = locale === "ar" ? item.nameAr : item.nameEn;
              return (
                <motion.li
                  key={item.productId}
                  layout
                  exit={{ opacity: 0, height: 0 }}
                  className="flex gap-5 py-6"
                >
                  <Link
                    href={`/shop/${item.slug}`}
                    className="relative aspect-[4/5] w-24 shrink-0 overflow-hidden rounded-sm bg-obsidian-soft"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.image}
                      alt={name}
                      className="h-full w-full object-cover"
                    />
                  </Link>
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <Link
                        href={`/shop/${item.slug}`}
                        className="font-display text-lg text-ivory transition-colors hover:text-champagne"
                      >
                        {name}
                      </Link>
                      {item.size && (
                        <p className="font-body mt-1 text-xs text-ivory/40">
                          {item.size}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-body text-sm text-ivory/70">
                        {formatPrice(item.price, locale)}
                      </span>
                      <button
                        onClick={() => remove(item.productId)}
                        className="font-body text-[11px] uppercase tracking-[0.2em] text-ivory/40 transition-colors hover:text-champagne"
                      >
                        {t("remove")}
                      </button>
                    </div>
                  </div>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
      </div>

      <aside className="h-fit rounded-sm border border-ivory/10 bg-obsidian-soft/40 p-8">
        <div className="font-body flex justify-between text-sm text-ivory/70">
          <span>{t("subtotal")}</span>
          <span>{formatPrice(subtotal, locale)}</span>
        </div>
        <div className="font-body mt-3 flex justify-between text-sm text-ivory/50">
          <span>{t("shipping")}</span>
          <span>{t("shippingCalc")}</span>
        </div>
        <div className="rule-gold my-6 h-px w-full" />
        <div className="font-body flex justify-between text-base text-ivory">
          <span>{t("total")}</span>
          <span>{formatPrice(subtotal, locale)}</span>
        </div>
        <Link
          href="/checkout"
          className="font-body mt-8 block rounded-full bg-champagne px-9 py-4 text-center text-xs uppercase tracking-[0.25em] text-obsidian transition-opacity hover:opacity-90"
        >
          {t("checkout")}
        </Link>
      </aside>
    </div>
  );
}
