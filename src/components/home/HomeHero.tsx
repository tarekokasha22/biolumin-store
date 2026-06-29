"use client";

import { useRef } from "react";
import { useTranslations, useLocale } from "next-intl";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Link } from "@/i18n/navigation";
import { BrandEmblem } from "@/components/brand/BrandEmblem";

export function HomeHero() {
  const t      = useTranslations();
  const locale = useLocale();
  const isAr   = locale === "ar";

  const rootRef      = useRef<HTMLElement>(null);
  const emblemWrapRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.registerPlugin(ScrollTrigger);
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      // Refined entrance — copy rises in a soft stagger, emblem unfurls with light
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.from(".bl-hero-copy > *", {
        opacity: 0,
        y: reduce ? 0 : 26,
        duration: 1,
        stagger: 0.12,
      });
      tl.from(
        ".bl-hero-emblem",
        {
          opacity: 0,
          scale: reduce ? 1 : 0.82,
          rotate: reduce ? 0 : -7,
          duration: 1.5,
        },
        reduce ? "<" : "-=0.9",
      );
      tl.from(
        ".bl-aurora",
        { opacity: 0, duration: 1.6 },
        "<",
      );

      if (reduce) return;

      // Scroll parallax — the emblem drifts up and the aurora deepens as you scroll
      gsap.to(emblemWrapRef.current, {
        yPercent: -16,
        scrollTrigger: {
          trigger: rootRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 1,
        },
      });
      gsap.to(".bl-aurora", {
        scale: 1.18,
        rotate: 40,
        scrollTrigger: {
          trigger: rootRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 1.4,
        },
      });
      gsap.to(".bl-hero-copy", {
        yPercent: -8,
        opacity: 0.55,
        scrollTrigger: {
          trigger: rootRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 1,
        },
      });
    },
    { scope: rootRef },
  );

  return (
    <section
      ref={rootRef}
      style={{
        position: "relative",
        minHeight: "100svh",
        display: "flex",
        alignItems: "center",
        overflow: "hidden",
        padding: "118px 24px 60px",
      }}
    >
      <div
        style={{
          position: "absolute", inset: 0, zIndex: -1,
          background: "radial-gradient(ellipse at 62% 38%, rgba(29,29,33,.95), #0e0e10 72%)",
        }}
      />

      <div
        style={{
          position: "absolute", left: "62%", top: "42%",
          width: "min(58vh,40rem)", height: "min(58vh,40rem)",
          transform: "translate(-50%,-50%)",
          borderRadius: "50%",
          background: "radial-gradient(circle,rgba(72,214,194,.20),rgba(201,166,107,.09) 42%,transparent 70%)",
          filter: "blur(46px)",
          zIndex: 0,
          animation: "bl-breathe 7s ease-in-out infinite",
          pointerEvents: "none",
          transition: "margin .1s linear",
        }}
      />

      <div
        style={{
          position: "relative", zIndex: 10,
          maxWidth: "1280px", margin: "0 auto", width: "100%",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "54px",
          alignItems: "center",
        }}
        className="bl-hero-grid"
      >
        {/* Copy */}
        <div className="bl-hero-copy">
          <div style={{ display: "flex", alignItems: "center", gap: "11px", marginBottom: "26px" }}>
            <span style={{ position: "relative", display: "flex", height: "7px", width: "7px" }}>
              <span
                style={{
                  position: "absolute", inset: 0, borderRadius: "99px",
                  background: "rgba(72,214,194,.7)",
                  animation: "bl-pulse 2.4s ease-in-out infinite",
                }}
              />
              <span style={{ position: "relative", height: "7px", width: "7px", borderRadius: "99px", background: "#48d6c2" }} />
            </span>
            <span style={{ fontSize: "11px", letterSpacing: ".34em", textTransform: "uppercase", color: "#c9a66b" }}>
              {t("hero.kicker")}
            </span>
          </div>

          <h1
            style={{
              fontFamily: "var(--font-display-active, Georgia, serif)",
              fontWeight: 500,
              lineHeight: isAr ? 1.18 : 0.98,
              fontSize: "clamp(2.7rem,6vw,5.2rem)",
              letterSpacing: isAr ? 0 : "-.02em",
            }}
          >
            <span style={{ display: "block", color: "#f4f0e9" }}>{t("hero.line1")}</span>
            <span
              style={{
                display: "block", color: "#c9a66b",
                textShadow: "0 0 26px rgba(201,166,107,.32),0 0 60px rgba(201,166,107,.14)",
                marginTop: "4px",
              }}
            >
              {t("hero.line2")}
            </span>
          </h1>

          <p
            style={{
              marginTop: "26px", maxWidth: "30rem",
              fontSize: "15px", lineHeight: 1.75,
              color: "rgba(244,240,233,.66)",
            }}
          >
            {t("hero.sub")}
          </p>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "14px", marginTop: "34px" }}>
            <Link
              href="/#drop"
              className="bl-sweep"
              style={{
                display: "inline-flex", alignItems: "center",
                gap: "10px", borderRadius: "99px",
                background: "#c9a66b", color: "#0e0e10",
                padding: "15px 30px",
                fontSize: "11.5px", letterSpacing: ".22em", textTransform: "uppercase",
                fontWeight: 600, textDecoration: "none",
                transition: "all .4s",
                boxShadow: "0 0 0 1px rgba(201,166,107,.5)",
              }}
            >
              {t("hero.cta")}
              <span>{isAr ? "←" : "→"}</span>
            </Link>

            <a
              href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "201131701911"}?text=${encodeURIComponent(t("hero.waMessage"))}`}
              target="_blank"
              rel="noreferrer"
              style={{
                display: "inline-flex", alignItems: "center", gap: "9px",
                borderRadius: "99px", border: "1px solid rgba(138,129,117,.5)",
                color: "#f4f0e9", padding: "15px 26px",
                fontSize: "11.5px", letterSpacing: ".18em", textTransform: "uppercase",
                textDecoration: "none", transition: "all .4s",
              }}
            >
              <svg viewBox="0 0 24 24" width="15" height="15" fill="#48d6c2">
                <path d="M12 2a10 10 0 00-8.6 15l-1.3 4.7 4.8-1.3A10 10 0 1012 2zm0 18a8 8 0 01-4.1-1.1l-.3-.2-2.8.7.7-2.8-.2-.3A8 8 0 1112 20zm4.4-6c-.2-.1-1.4-.7-1.6-.8s-.4-.1-.5.1-.6.8-.8 1-.3.2-.5.1a6.5 6.5 0 01-1.9-1.2 7.2 7.2 0 01-1.3-1.7c-.1-.2 0-.4.1-.5l.4-.4.2-.4v-.4l-.8-1.8c-.2-.5-.4-.4-.5-.4h-.5a.9.9 0 00-.7.3 2.8 2.8 0 00-.9 2.1 4.9 4.9 0 001 2.6 11.2 11.2 0 004.3 3.8c.6.3 1.1.4 1.5.5a3.6 3.6 0 001.6.1c.5-.1 1.4-.6 1.6-1.1s.2-1 .1-1.1z"/>
              </svg>
              {t("hero.wa")}
            </a>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "22px", marginTop: "32px", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
              <span style={{ color: "#c9a66b", fontSize: "13px", letterSpacing: ".1em" }}>★★★★★</span>
              <span style={{ fontSize: "12px", color: "rgba(244,240,233,.6)" }}>{t("hero.rating")}</span>
            </div>
            <span style={{ width: "1px", height: "14px", background: "rgba(138,129,117,.4)" }} />
            <span style={{ fontSize: "12px", color: "rgba(244,240,233,.6)" }}>{t("hero.shipping")}</span>
          </div>
        </div>

        {/* Animated brand-identity emblem */}
        <div
          ref={emblemWrapRef}
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "min(84vw, 30rem)",
          }}
        >
          {/* rotating conic aurora — living ring of light */}
          <div className="bl-aurora" />

          <div
            className="bl-emblem-glow"
            style={{
              position: "absolute",
              inset: "-6%",
              background:
                "radial-gradient(circle at center,rgba(72,214,194,.20),rgba(201,166,107,.08) 45%,transparent 68%)",
              filter: "blur(34px)",
              pointerEvents: "none",
            }}
          />

          <BrandEmblem
            locale={locale}
            className="bl-hero-emblem"
            style={{
              width: "min(84vw, 30rem)",
              height: "auto",
              position: "relative",
              zIndex: 1,
            }}
          />
        </div>
      </div>

      <div style={{ position: "absolute", bottom: "26px", left: "50%", transform: "translateX(-50%)", textAlign: "center" }}>
        <p style={{ fontSize: "10px", letterSpacing: ".3em", textTransform: "uppercase", color: "rgba(244,240,233,.4)" }}>
          {t("hero.scroll")}
        </p>
        <div
          style={{
            margin: "10px auto 0", height: "34px", width: "1px",
            background: "linear-gradient(to bottom,rgba(201,166,107,.6),transparent)",
            animation: "bl-pulse 3s ease-in-out infinite",
          }}
        />
      </div>
    </section>
  );
}

export default HomeHero;
