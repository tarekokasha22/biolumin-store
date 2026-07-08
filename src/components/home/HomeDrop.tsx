"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ProductCard } from "@/components/shop/ProductCard";
import type { RatingSummary } from "@/lib/reviews";

export type DropProduct = {
  id: string;
  slug: string;
  nameAr: string;
  nameEn: string;
  price: number;
  compareAtPrice?: number | null;
  image: string;
  status: "AVAILABLE" | "RESERVED" | "SOLD";
  category: string;
  ratingSummary?: RatingSummary;
};

const AR_DIGITS = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];

function pad(n: number, arabic: boolean) {
  const s = String(Math.max(0, n)).padStart(2, "0");
  return arabic ? s.replace(/\d/g, (d) => AR_DIGITS[+d]) : s;
}

function Countdown({ closesAt, label }: { closesAt: string; label: string }) {
  const locale = useLocale();
  const arabic = locale === "ar";
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    const end = new Date(closesAt).getTime();
    const tick = () => setRemaining(Math.max(0, end - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [closesAt]);

  if (remaining === null) return null;
  const h = Math.floor(remaining / 3600000);
  const m = Math.floor((remaining % 3600000) / 60000);
  const s = Math.floor((remaining % 60000) / 1000);

  return (
    <div className="mx-auto mb-5.5 flex max-w-[340px] items-center justify-center gap-2.5 rounded-[14px] border border-aqua/22 bg-linear-to-b from-aqua/7 to-panel/50 px-3.5 py-3.5">
      <span className="font-body text-[10.5px] tracking-[0.14em] text-aqua-light uppercase">{label}</span>
      <div className="flex items-center gap-1.5 font-mono tabular-nums">
        <span className="min-w-[34px] rounded-[7px] bg-[rgba(10,10,12,.6)] px-1 py-1.5 text-center text-base font-semibold text-white">
          {pad(h, arabic)}
        </span>
        <span className="font-bold text-aqua">:</span>
        <span className="min-w-[34px] rounded-[7px] bg-[rgba(10,10,12,.6)] px-1 py-1.5 text-center text-base font-semibold text-white">
          {pad(m, arabic)}
        </span>
        <span className="font-bold text-aqua">:</span>
        <span className="min-w-[34px] rounded-[7px] bg-[rgba(10,10,12,.6)] px-1 py-1.5 text-center text-base font-semibold text-white">
          {pad(s, arabic)}
        </span>
      </div>
    </div>
  );
}

export function HomeDrop({
  products,
  availableCount,
  closesAt,
}: {
  products: DropProduct[];
  availableCount: number;
  closesAt: string | null;
}) {
  const t = useTranslations("home");

  if (products.length === 0) return null;

  return (
    <section className="px-4 pt-[34px] pb-2">
      <div className="mb-4 text-center">
        <div className="font-body mb-2 text-[10.5px] tracking-[0.3em] text-champagne uppercase">
          {t("dropKicker")}
        </div>
        <h2 className="font-display text-[32px] leading-[1.1] text-white">{t("dropTitle")}</h2>
        <p className="font-body mx-auto mt-2.5 max-w-[300px] text-[12.5px] leading-[1.6] text-ivory/60">
          {t("dropNote")}
        </p>
      </div>

      {closesAt && <Countdown closesAt={closesAt} label={t("dropEnds")} />}

      {availableCount > 0 && (
        <p className="font-body mb-3.5 text-center text-xs tracking-[0.15em] text-aqua-light uppercase">
          {t("dropAvailable", { count: availableCount })}
        </p>
      )}

      <div className="grid grid-cols-2 gap-3">
        {products.map((p, i) => (
          <ProductCard
            key={p.slug}
            id={p.id}
            slug={p.slug}
            nameAr={p.nameAr}
            nameEn={p.nameEn}
            price={p.price}
            compareAtPrice={p.compareAtPrice}
            image={p.image}
            status={p.status}
            category={p.category}
            ratingSummary={p.ratingSummary}
            index={i}
          />
        ))}
      </div>

      <Link
        href="/shop"
        className="font-body mt-5 flex w-full items-center justify-center gap-2.5 rounded-(--radius-button) bg-linear-to-r from-[#e8c88a] via-champagne to-[#d4a85c] py-4 text-[14px] font-bold text-[#1a1208] shadow-[0_8px_28px_-6px_rgba(201,166,107,.6)] active:scale-[0.98] transition-transform"
      >
        {t("dropCta")}
        <span className="rtl:-scale-x-100 text-[16px]">→</span>
      </Link>
    </section>
  );
}
