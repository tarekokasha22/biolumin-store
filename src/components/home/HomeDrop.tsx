"use client";

import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import HomeProductCard from "@/components/home/HomeProductCard";

export type ProductStatus = "AVAILABLE" | "SOLD" | "RESERVED";

export interface DropProduct {
  id:       string;
  slug:     string;
  nameAr:   string;
  nameEn:   string;
  price:    number;
  status:   ProductStatus;
  images:   string[];
  catAr?:   string;
  catEn?:   string;
}

export default function HomeDrop({ products }: { products: DropProduct[] }) {
  const t      = useTranslations();
  const locale = useLocale();
  const isAr   = locale === "ar";

  const available = products.filter((p) => p.status === "AVAILABLE").length;

  return (
    <section
      id="drop"
      style={{
        position: "relative",
        padding: "96px 24px 64px",
        scrollMarginTop: "90px",
      }}
    >
      <div style={{ maxWidth: "1280px", margin: "0 auto" }}>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: "24px",
            marginBottom: "46px",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ position: "relative", display: "flex", height: "8px", width: "8px" }}>
                <span
                  style={{
                    position: "absolute", inset: 0, borderRadius: "99px",
                    background: "rgba(72,214,194,.7)",
                    animation: "bl-pulse 2.2s ease-in-out infinite",
                  }}
                />
                <span style={{ position: "relative", height: "8px", width: "8px", borderRadius: "99px", background: "#48d6c2" }} />
              </span>
              <span style={{ fontSize: "11px", letterSpacing: ".32em", textTransform: "uppercase", color: "#c9a66b" }}>
                {t("drop.kicker")}
              </span>
            </div>

            <h2
              style={{
                fontFamily: "var(--font-display-active, Georgia, serif)",
                fontWeight: 500,
                fontSize: "clamp(2rem,4.4vw,3.6rem)",
                color: "#f4f0e9",
                marginTop: "14px",
                lineHeight: isAr ? 1.18 : 0.98,
              }}
            >
              {t("drop.title")}
            </h2>

            <p style={{ marginTop: "14px", maxWidth: "30rem", fontSize: "13.5px", lineHeight: 1.7, color: "rgba(244,240,233,.55)" }}>
              {t("drop.note")}
            </p>

            {available > 0 && (
              <p style={{ marginTop: "12px", fontSize: "11.5px", letterSpacing: ".18em", textTransform: "uppercase", color: "rgba(72,214,194,.85)" }}>
                {t("drop.available", { count: available })}
              </p>
            )}
          </div>

          <Link
            href="/shop"
            className="bl-sweep"
            style={{
              display: "inline-flex", alignItems: "center", gap: "10px",
              borderRadius: "99px",
              border: "1px solid rgba(201,166,107,.5)",
              color: "#f4f0e9",
              padding: "14px 28px",
              fontSize: "11.5px", letterSpacing: ".2em", textTransform: "uppercase",
              textDecoration: "none", transition: "all .4s",
            }}
          >
            {t("drop.viewAll")}
            <span>{isAr ? "←" : "→"}</span>
          </Link>
        </div>

        <div
          className="bl-drop-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3,1fr)",
            gap: "22px",
          }}
        >
          {products.map((product) => (
            <HomeProductCard key={product.id} product={product} />
          ))}
        </div>

      </div>
    </section>
  );
}
