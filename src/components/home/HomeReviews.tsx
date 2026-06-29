"use client";

import { useTranslations, useLocale } from "next-intl";

const REVIEWS = {
  ar: [
    { name: "مريم عادل",  city: "القاهرة",     text: "الخامة تحفة والفستان طلع أحلى من الصور. حسّيت إني لابسة حاجة غالية فعلاً." },
    { name: "سلمى رمزي",  city: "الإسكندرية", text: "وصل في يومين والتغليف شيك جداً. فكرة إن القطعة واحدة بس خلّتني أحس إني مميزة." },
    { name: "نور حسن",   city: "المنصورة",   text: "دفعت عند الاستلام بكل أريحية. المندوب كان لطيف والمقاس مظبوط بالظبط زي الجدول." },
  ],
  en: [
    { name: "Mariam Adel", city: "Cairo",       text: "The fabric is gorgeous and it looked even better than the photos. I felt truly luxe." },
    { name: "Salma Ramzy", city: "Alexandria", text: "Arrived in two days, beautifully packaged. Knowing it is one-of-one made me feel so special." },
    { name: "Nour Hassan", city: "Mansoura",   text: "Paid cash on delivery with total ease. The courier was kind and the size matched the guide exactly." },
  ],
};

export default function HomeReviews() {
  const t      = useTranslations("reviews");
  const locale = useLocale();
  const isAr   = locale === "ar";
  const reviews = REVIEWS[isAr ? "ar" : "en"];

  return (
    <section
      id="reviews"
      style={{
        position: "relative",
        padding: "80px 24px",
        borderTop: "1px solid rgba(138,129,117,.14)",
        background: "rgba(22,22,25,.35)",
        scrollMarginTop: "80px",
      }}
    >
      <div style={{ maxWidth: "1280px", margin: "0 auto" }}>

        <div style={{ textAlign: "center", marginBottom: "46px" }}>
          <p style={{ fontSize: "11px", letterSpacing: ".32em", textTransform: "uppercase", color: "#c9a66b" }}>
            {t("kicker")}
          </p>
          <h2
            style={{
              fontFamily: "var(--font-display-active, Georgia, serif)",
              fontWeight: 500,
              fontSize: "clamp(1.9rem,4vw,3.2rem)",
              color: "#f4f0e9",
              marginTop: "12px",
              lineHeight: isAr ? 1.18 : 0.98,
            }}
          >
            {t("title")}
          </h2>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "10px", marginTop: "14px" }}>
            <span style={{ color: "#c9a66b", letterSpacing: ".1em" }}>★★★★★</span>
            <span style={{ fontSize: "12.5px", color: "rgba(244,240,233,.6)" }}>{t("rating")}</span>
          </div>
        </div>

        <div
          className="bl-rev-grid"
          style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "22px" }}
        >
          {reviews.map((rv) => (
            <div
              key={rv.name}
              style={{
                borderRadius: "4px",
                border: "1px solid rgba(244,240,233,.1)",
                background: "#0e0e10",
                padding: "30px",
                display: "flex",
                flexDirection: "column",
                gap: "16px",
              }}
            >
              <span style={{ color: "#c9a66b", fontSize: "14px", letterSpacing: ".1em" }}>★★★★★</span>

              <p style={{ fontSize: "14px", lineHeight: 1.8, color: "rgba(244,240,233,.82)", flex: 1 }}>
                &ldquo;{rv.text}&rdquo;
              </p>

              <div
                style={{
                  display: "flex", alignItems: "center", gap: "12px",
                  paddingTop: "6px",
                  borderTop: "1px solid rgba(138,129,117,.16)",
                }}
              >
                <div
                  style={{
                    height: "38px", width: "38px", borderRadius: "99px",
                    background: "linear-gradient(135deg,#1d1d21,#161619)",
                    border: "1px solid rgba(201,166,107,.3)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: "var(--font-display-active, Georgia, serif)",
                    fontSize: "15px", color: "#c9a66b",
                    flexShrink: 0,
                  }}
                >
                  {rv.name.charAt(0)}
                </div>
                <div>
                  <p style={{ fontSize: "13px", color: "#f4f0e9" }}>
                    {rv.name}
                  </p>
                  <p style={{ fontSize: "11px", color: "rgba(244,240,233,.45)", marginTop: "2px" }}>
                    {rv.city}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
