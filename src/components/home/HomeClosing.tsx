"use client";

import { useTranslations, useLocale } from "next-intl";
import Image from "next/image";

const STORY_IMAGE = "/uploads/products/8150fe5f-2a9f-42a4-a6b0-60d950e7898c.png";

export function HomeClosing() {
  const t    = useTranslations("story");
  const locale = useLocale();
  const isAr = locale === "ar";

  const lines = t("body").split("\n");

  return (
    <section
      id="story"
      style={{
        position: "relative",
        minHeight: "78vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        padding: "90px 24px",
        scrollMarginTop: "70px",
      }}
    >
      <Image
        src={STORY_IMAGE}
        alt=""
        fill
        style={{ objectFit: "cover", objectPosition: "center 25%", opacity: 0.28 }}
        priority={false}
      />

      <div
        style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(ellipse at 50% 45%,rgba(14,14,16,.7),#0e0e10 78%)",
        }}
      />

      <div style={{ position: "relative", textAlign: "center", maxWidth: "46rem" }}>
        <p style={{ fontSize: "11px", letterSpacing: ".32em", textTransform: "uppercase", color: "#c9a66b" }}>
          {t("kicker")}
        </p>

        <h2
          style={{
            fontFamily: "var(--font-display-active, Georgia, serif)",
            fontWeight: 400,
            fontSize: "clamp(1.7rem,3.6vw,3rem)",
            lineHeight: 1.45,
            color: "#f4f0e9",
            marginTop: "22px",
            textShadow: "0 0 40px rgba(0,0,0,.6)",
          }}
        >
          {lines.map((line, i) => (
            <span key={i} style={{ display: "block" }}>{line}</span>
          ))}
        </h2>

        <a
          href={isAr ? "/ar/story" : "/en/story"}
          className="bl-sweep"
          style={{
            display: "inline-flex", alignItems: "center", gap: "10px",
            marginTop: "34px",
            borderRadius: "99px",
            border: "1px solid rgba(201,166,107,.5)",
            color: "#f4f0e9",
            padding: "14px 30px",
            fontSize: "11.5px", letterSpacing: ".2em", textTransform: "uppercase",
            textDecoration: "none", transition: "all .4s",
          }}
        >
          {t("cta")}
          <span>{isAr ? "←" : "→"}</span>
        </a>
      </div>
    </section>
  );
}

export default HomeClosing;
