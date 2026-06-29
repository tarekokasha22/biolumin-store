"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";

export default function HomeNewsletter() {
  const t      = useTranslations("newsletter");
  const locale = useLocale();
  const isAr   = locale === "ar";

  const [done,  setDone]  = useState(false);
  const [email, setEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
    } catch {
      // silently continue — show success regardless
    }
    setDone(true);
  };

  return (
    <section style={{ position: "relative", padding: "84px 24px" }}>
      <div style={{ maxWidth: "42rem", margin: "0 auto", textAlign: "center" }}>

        <p style={{ fontSize: "11px", letterSpacing: ".32em", textTransform: "uppercase", color: "#c9a66b" }}>
          {t("kicker")}
        </p>

        <h2
          style={{
            fontFamily: "var(--font-display-active, Georgia, serif)",
            fontWeight: 500,
            fontSize: "clamp(1.8rem,3.6vw,2.8rem)",
            color: "#f4f0e9",
            marginTop: "12px",
            lineHeight: isAr ? 1.18 : 0.98,
          }}
        >
          {t("title")}
        </h2>

        <p style={{ fontSize: "13.5px", lineHeight: 1.7, color: "rgba(244,240,233,.6)", marginTop: "14px" }}>
          {t("note")}
        </p>

        {done ? (
          <p
            style={{
              marginTop: "26px",
              fontFamily: "var(--font-display-active, Georgia, serif)",
              fontSize: "22px",
              color: "#48d6c2",
            }}
          >
            {t("done")}
          </p>
        ) : (
          <form
            onSubmit={handleSubmit}
            style={{
              marginTop: "26px",
              display: "flex",
              gap: "10px",
              maxWidth: "30rem",
              margin: "26px auto 0",
              flexWrap: "wrap",
            }}
          >
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("placeholder")}
              style={{
                flex: 1,
                minWidth: "200px",
                background: "rgba(22,22,25,.7)",
                border: "1px solid rgba(138,129,117,.4)",
                borderRadius: "99px",
                padding: "14px 22px",
                fontSize: "16px",
                color: "#f4f0e9",
                outline: "none",
              }}
            />
            <button
              type="submit"
              className="bl-sweep"
              style={{
                borderRadius: "99px",
                background: "#c9a66b",
                color: "#0e0e10",
                padding: "14px 30px",
                fontSize: "11.5px",
                letterSpacing: ".2em",
                textTransform: "uppercase",
                fontWeight: 600,
                border: "none",
                cursor: "pointer",
              }}
            >
              {t("cta")}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
