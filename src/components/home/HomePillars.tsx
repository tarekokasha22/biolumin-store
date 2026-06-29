"use client";

import { useTranslations, useLocale } from "next-intl";

const PILLARS = [
  { num: "01", titleKey: "p1Title", bodyKey: "p1Body" },
  { num: "02", titleKey: "p2Title", bodyKey: "p2Body" },
  { num: "03", titleKey: "p3Title", bodyKey: "p3Body" },
] as const;

export function HomePillars() {
  const t    = useTranslations("pillars");
  const locale = useLocale();
  const isAr = locale === "ar";

  return (
    <section style={{ position: "relative", padding: "80px 24px" }}>
      <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
        <p
          style={{
            textAlign: "center",
            fontSize: "11px",
            letterSpacing: ".32em",
            textTransform: "uppercase",
            color: "#c9a66b",
            marginBottom: "46px",
          }}
        >
          {t("kicker")}
        </p>

        <div
          className="bl-pillar-grid"
          style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "22px" }}
        >
          {PILLARS.map(({ num, titleKey, bodyKey }, i) => (
            <div
              key={num}
              className="bl-card bl-sweep"
              style={{
                position: "relative",
                borderRadius: "4px",
                border: "1px solid rgba(244,240,233,.1)",
                background: "rgba(22,22,25,.4)",
                padding: "34px",
                overflow: "hidden",
                transition: "border-color .5s, box-shadow .5s",
                animationDelay: `${i * 0.1}s`,
              }}
              onMouseOver={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(201,166,107,.4)";
                (e.currentTarget as HTMLElement).style.boxShadow   = "0 0 60px -20px rgba(72,214,194,.3)";
              }}
              onMouseOut={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(244,240,233,.1)";
                (e.currentTarget as HTMLElement).style.boxShadow   = "none";
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-display-active, Georgia, serif)",
                  fontSize: "46px",
                  color: "rgba(201,166,107,.35)",
                }}
              >
                {num}
              </span>

              <h3
                style={{
                  fontFamily: "var(--font-display-active, Georgia, serif)",
                  fontSize: "25px",
                  color: "#f4f0e9",
                  marginTop: "18px",
                }}
              >
                {t(titleKey)}
              </h3>

              <p
                style={{
                  fontSize: "13.5px",
                  lineHeight: 1.75,
                  color: "rgba(244,240,233,.6)",
                  marginTop: "14px",
                }}
              >
                {t(bodyKey)}
              </p>

              <div
                style={{
                  marginTop: "22px",
                  height: "1px",
                  width: "48px",
                  background: isAr
                    ? "linear-gradient(270deg,rgba(201,166,107,.7),transparent)"
                    : "linear-gradient(90deg,rgba(201,166,107,.7),transparent)",
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default HomePillars;
