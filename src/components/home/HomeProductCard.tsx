"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import type { DropProduct } from "@/components/home/HomeDrop";

export default function HomeProductCard({ product }: { product: DropProduct }) {
  const locale  = useLocale();
  const t       = useTranslations();
  const isAr    = locale === "ar";
  const [hovered, setHovered] = useState(false);

  const sold     = product.status === "SOLD";
  const reserved = product.status === "RESERVED";
  const available = !sold && !reserved;

  const name = isAr ? product.nameAr : product.nameEn;
  const cat  = isAr ? (product.catAr ?? "") : (product.catEn ?? "");
  const fmt  = (n: number) =>
    isAr ? n.toLocaleString("ar-EG") + " ج" : "EGP " + n.toLocaleString("en-US");

  const badge = sold     ? t("drop.statusSold")
              : reserved ? t("drop.statusReserved")
              :             t("drop.statusAvailable");

  return (
    <div
      className="bl-card"
      style={{ display: "flex", flexDirection: "column", height: "100%", gap: "14px" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Link href={`/shop/${product.slug}`} style={{ display: "block", textDecoration: "none" }}>
        <div
          className="bl-sweep"
          style={{
            position: "relative",
            aspectRatio: "4/5",
            overflow: "hidden",
            borderRadius: "5px",
            background: "#161619",
            border: `1px solid ${hovered && available ? "rgba(201,166,107,.3)" : "rgba(244,240,233,.06)"}`,
            transition: "border-color .5s, box-shadow .5s",
            boxShadow: hovered && available ? "0 0 60px -20px rgba(72,214,194,.25)" : "none",
          }}
        >
          {product.images[0] && (
            <Image
              src={product.images[0]}
              alt={name}
              fill
              style={{
                objectFit: "cover",
                opacity: sold ? 0.4 : reserved ? 0.7 : 1,
                transition: "transform .9s cubic-bezier(.22,1,.36,1), opacity .4s",
                transform: hovered ? "scale(1.04)" : "scale(1)",
              }}
            />
          )}

          <div
            style={{
              position: "absolute", inset: 0,
              background: "linear-gradient(to top,rgba(14,14,16,.55),transparent 42%)",
              pointerEvents: "none",
            }}
          />

          {available && (
            <span
              className="bl-badge"
              style={{ position: "absolute", top: "12px", insetInlineEnd: "12px" }}
            >
              {t("drop.oneOfOne")}
            </span>
          )}

          {sold && (
            <div
              style={{
                position: "absolute", inset: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: "rgba(14,14,16,.45)",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-display-active, Georgia, serif)",
                  fontSize: "28px",
                  letterSpacing: ".16em",
                  color: "rgba(244,240,233,.85)",
                }}
              >
                {t("drop.statusSold")}
              </span>
            </div>
          )}

          {reserved && (
            <span
              style={{
                position: "absolute", top: "12px", insetInlineStart: "12px",
                borderRadius: "99px",
                background: "#c9a66b", color: "#0e0e10",
                padding: "5px 12px",
                fontSize: "9.5px", fontWeight: 600,
                letterSpacing: ".16em", textTransform: "uppercase",
              }}
            >
              {t("drop.statusReserved")}
            </span>
          )}
        </div>
      </Link>

      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3
            style={{
              fontFamily: "var(--font-display-active, Georgia, serif)",
              fontSize: "20px",
              lineHeight: 1.2,
              color: "#f4f0e9",
              margin: 0,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical" as const,
              overflow: "hidden",
              minHeight: "2.4em",
            }}
          >
            {name}
          </h3>
          <p
            style={{
              fontSize: "11px", letterSpacing: ".16em",
              textTransform: "uppercase",
              color: "rgba(244,240,233,.45)",
              marginTop: "3px",
            }}
          >
            {badge}{cat && ` · ${cat}`}
          </p>
        </div>
        <p style={{ fontFamily: "var(--font-display-active, Georgia, serif)", fontSize: "21px", color: "#e3c895", whiteSpace: "nowrap" }}>
          {fmt(product.price)}
        </p>
      </div>

      <Link
        href={available ? `/shop/${product.slug}` : "#"}
        style={{
          display: "block",
          marginTop: "auto",
          width: "100%",
          borderRadius: "99px",
          border: `1px solid ${available ? "rgba(201,166,107,.55)" : "rgba(138,129,117,.25)"}`,
          background: hovered && available ? "#c9a66b" : "none",
          color: hovered && available ? "#0e0e10" : available ? "#e3c895" : "rgba(244,240,233,.4)",
          padding: "12px",
          fontSize: "11px",
          letterSpacing: ".2em",
          textTransform: "uppercase",
          textDecoration: "none",
          textAlign: "center",
          cursor: available ? "pointer" : "not-allowed",
          pointerEvents: available ? "auto" : "none",
          transition: "all .35s",
        }}
      >
        {available ? t("drop.cta") : badge}
      </Link>
    </div>
  );
}
