"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Reveal } from "@/components/motion/Reveal";
import { BrandEmblem } from "@/components/brand/BrandEmblem";

export function StoryScroll() {
  const t = useTranslations("story");
  const root = useRef<HTMLDivElement>(null);

  const chapters = [
    { title: t("chapter1Title"), body: t("chapter1Body") },
    { title: t("chapter2Title"), body: t("chapter2Body") },
    { title: t("chapter3Title"), body: t("chapter3Body") },
  ];

  const values = [
    { title: t("value1"), body: t("value1Body") },
    { title: t("value2"), body: t("value2Body") },
    { title: t("value3"), body: t("value3Body") },
    { title: t("value4"), body: t("value4Body") },
  ];

  useGSAP(
    () => {
      gsap.registerPlugin(ScrollTrigger);
      const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      gsap.fromTo(
        ".story-title-word",
        { opacity: 0, y: reduce ? 0 : 40 },
        {
          opacity: 1,
          y: 0,
          duration: 1.2,
          stagger: 0.1,
          ease: "power3.out",
        },
      );

      gsap.fromTo(
        ".story-intro-fade",
        { opacity: 0, y: reduce ? 0 : 20 },
        {
          opacity: 1,
          y: 0,
          duration: 1.1,
          delay: 0.5,
          stagger: 0.2,
          ease: "power3.out",
        },
      );

      if (reduce) return;

      // gentle parallax + fade on the backdrop emblem as the intro scrolls away
      const emblem = root.current?.querySelector(".story-emblem-bg");
      if (emblem) {
        gsap.to(emblem, {
          yPercent: -18,
          scale: 1.15,
          opacity: 0.4,
          ease: "none",
          scrollTrigger: {
            trigger: emblem,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });
      }

      // animated vertical timeline line draws as you scroll the chapters
      const line = root.current?.querySelector(".story-line-fill");
      if (line) {
        gsap.fromTo(
          line,
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: "none",
            scrollTrigger: {
              trigger: ".story-chapters",
              start: "top 60%",
              end: "bottom 70%",
              scrub: true,
            },
          },
        );
      }

      gsap.utils.toArray<HTMLElement>(".story-chapter").forEach((ch) => {
        const glow = ch.querySelector(".story-chapter-glow");
        gsap.fromTo(
          ch.querySelectorAll(".story-chapter-fade"),
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            duration: 1.1,
            stagger: 0.15,
            ease: "power3.out",
            scrollTrigger: { trigger: ch, start: "top 70%" },
          },
        );
        if (glow) {
          gsap.fromTo(
            glow,
            { y: 80 },
            {
              y: -80,
              ease: "none",
              scrollTrigger: {
                trigger: ch,
                start: "top bottom",
                end: "bottom top",
                scrub: true,
              },
            },
          );
        }
      });

      gsap.fromTo(
        ".story-quote-fade",
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 1.3,
          stagger: 0.12,
          ease: "power3.out",
          scrollTrigger: { trigger: ".story-quote", start: "top 70%" },
        },
      );

      gsap.fromTo(
        ".story-closing-fade",
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 1.2,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: { trigger: ".story-closing", start: "top 75%" },
        },
      );
    },
    { scope: root },
  );

  const titleWords = t("title").split(" ");
  const introLines = t("body").split("\n");

  return (
    <div ref={root} className="relative overflow-hidden">
      {/* ───────── Intro ───────── */}
      <section className="relative flex min-h-[92vh] items-center justify-center overflow-hidden px-6">
        <div
          className="pointer-events-none absolute left-1/2 top-[42%] -z-10 h-[60vh] w-[60vh] max-w-[90vw] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-60"
          style={{
            background:
              "radial-gradient(circle, rgba(72,214,194,0.16), transparent 70%)",
            filter: "blur(70px)",
          }}
        />
        {/* faint rotating brand emblem behind the title */}
        <div
          className="story-emblem-bg pointer-events-none absolute left-1/2 top-[42%] -z-10 -translate-x-1/2 -translate-y-1/2"
          aria-hidden
        >
          <BrandEmblem
            decorative
            showWordmark={false}
            style={{
              width: "min(118vw, 46rem)",
              height: "auto",
              opacity: 0.22,
            }}
          />
        </div>
        <div className="mx-auto max-w-2xl text-center">
          <p className="story-intro-fade font-body mb-7 text-[10.5px] uppercase tracking-[0.4em] text-champagne sm:text-[11px]">
            {t("kicker")}
          </p>
          <h1 className="fluid-hero font-display leading-[1.04] text-ivory">
            {titleWords.map((w, i) => (
              <span key={i} className="story-title-word inline-block">
                {w}
                {i < titleWords.length - 1 ? "\u00A0" : ""}
              </span>
            ))}
          </h1>
          <div className="story-intro-fade mx-auto mt-8 max-w-md space-y-1">
            {introLines.map((line, i) => (
              <p
                key={i}
                className="font-body text-[15px] leading-relaxed text-ivory/65 sm:text-base"
              >
                {line}
              </p>
            ))}
          </div>
        </div>

        {/* Scroll cue */}
        <div className="story-intro-fade absolute bottom-9 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3">
          <span className="font-body text-[10px] uppercase tracking-[0.3em] text-ivory/40">
            {t("scrollCue")}
          </span>
          <span className="relative block h-9 w-px overflow-hidden bg-ivory/15">
            <span className="story-scroll-dot absolute inset-x-0 top-0 h-3 bg-champagne" />
          </span>
        </div>
      </section>

      {/* ───────── Chapters (timeline) ───────── */}
      <div className="story-chapters relative mx-auto max-w-3xl px-6 py-10">
        {/* vertical timeline track */}
        <div
          className="pointer-events-none absolute top-0 bottom-0 hidden w-px bg-ivory/10 sm:block"
          style={{ insetInlineStart: "1.5rem" }}
          aria-hidden
        >
          <div className="story-line-fill h-full w-full origin-top bg-gradient-to-b from-champagne/70 via-champagne/40 to-aqua/40" />
        </div>

        {chapters.map((ch, i) => (
          <section
            key={i}
            className="story-chapter relative overflow-hidden py-16 sm:py-20 sm:ps-16"
          >
            <div
              className="story-chapter-glow pointer-events-none absolute -z-10 h-[36vh] w-[36vh] rounded-full opacity-40"
              style={{
                top: "20%",
                [i % 2 === 0 ? "right" : "left"]: "0%",
                background:
                  i % 2 === 0
                    ? "radial-gradient(circle, rgba(201,166,107,0.16), transparent 70%)"
                    : "radial-gradient(circle, rgba(72,214,194,0.14), transparent 70%)",
                filter: "blur(55px)",
              }}
            />

            {/* timeline node */}
            <span
              className="absolute top-[4.6rem] hidden h-3 w-3 -translate-x-1/2 rounded-full border border-champagne bg-obsidian sm:block rtl:translate-x-1/2"
              style={{ insetInlineStart: "1.5rem" }}
              aria-hidden
            >
              <span className="absolute inset-0 rounded-full bg-champagne/40 blur-[3px]" />
            </span>

            <div className="story-chapter-fade flex items-center gap-3">
              <span className="font-display text-2xl text-champagne/40">
                0{i + 1}
              </span>
              <span className="font-body text-[10px] uppercase tracking-[0.3em] text-champagne/60">
                {t("chapterLabel")}
              </span>
            </div>
            <h2 className="story-chapter-fade fluid-h2 font-display mt-4 leading-tight text-ivory">
              {ch.title}
            </h2>
            <p className="story-chapter-fade fluid-lead font-body mt-5 max-w-xl text-ivory/70">
              {ch.body}
            </p>
          </section>
        ))}
      </div>

      {/* ───────── Pull quote ───────── */}
      <section className="story-quote relative overflow-hidden px-6 py-28 sm:py-36">
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[50vh] w-[80vh] max-w-[95vw] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-50"
          style={{
            background:
              "radial-gradient(circle, rgba(201,166,107,0.12), transparent 70%)",
            filter: "blur(80px)",
          }}
        />
        <div className="mx-auto max-w-3xl text-center">
          <span className="story-quote-fade font-display block text-5xl leading-none text-champagne/30 sm:text-6xl">
            &ldquo;
          </span>
          <p className="story-quote-fade font-display mt-2 text-[clamp(1.6rem,4.4vw,2.9rem)] leading-[1.25] text-ivory">
            {t("quote")}
          </p>
          <div className="story-quote-fade bl-divider mx-auto mt-10 w-24" />
        </div>
      </section>

      {/* ───────── Values ───────── */}
      <section className="relative px-6 pb-28 pt-4 sm:pb-32">
        <div className="mx-auto max-w-5xl">
          <Reveal>
            <h2 className="font-display mb-14 text-center text-3xl text-ivory sm:text-4xl">
              {t("valuesTitle")}
            </h2>
          </Reveal>
          <div className="grid gap-px overflow-hidden rounded-sm border border-ivory/10 bg-ivory/10 sm:grid-cols-2">
            {values.map((v, i) => (
              <Reveal key={i} delay={(i % 2) * 0.1}>
                <div className="group h-full bg-obsidian p-8 transition-colors duration-500 hover:bg-obsidian-soft/40 sm:p-10">
                  <span className="font-body text-[11px] uppercase tracking-[0.28em] text-champagne/50">
                    0{i + 1}
                  </span>
                  <h3 className="font-display mt-3 text-2xl text-champagne">
                    {v.title}
                  </h3>
                  <p className="font-body mt-3 text-sm leading-relaxed text-ivory/60">
                    {v.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── Closing ───────── */}
      <section className="story-closing relative flex min-h-[70vh] items-center justify-center overflow-hidden px-6 py-24 text-center">
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[55vh] w-[55vh] max-w-[90vw] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-60"
          style={{
            background:
              "radial-gradient(circle, rgba(72,214,194,0.14), transparent 70%)",
            filter: "blur(70px)",
          }}
        />
        <div className="mx-auto max-w-xl">
          <div className="story-closing-fade mx-auto mb-10 w-[min(60vw,11rem)]">
            <BrandEmblem
              decorative
              showWordmark={false}
              style={{ width: "100%", height: "auto" }}
            />
          </div>
          <p className="story-closing-fade font-body text-[11px] uppercase tracking-[0.35em] text-champagne">
            {t("closingKicker")}
          </p>
          <h2 className="story-closing-fade font-display mt-5 text-[clamp(2rem,5vw,3.4rem)] leading-tight text-ivory">
            {t("closingTitle")}
          </h2>
          <p className="story-closing-fade font-body mx-auto mt-6 max-w-md text-[15px] leading-relaxed text-ivory/65 sm:text-base">
            {t("closingBody")}
          </p>

          <div className="story-closing-fade mt-10">
            <Link
              href="/shop"
              className="font-body group relative inline-flex items-center gap-3 rounded-full bg-champagne px-10 py-4 text-xs uppercase tracking-[0.25em] text-obsidian transition-all duration-500 hover:opacity-90"
            >
              {t("closingCta")}
              <span className="transition-transform duration-500 group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1">
                →
              </span>
            </Link>
          </div>

          <p className="story-closing-fade font-body mt-12 text-[11px] uppercase tracking-[0.28em] text-ivory/40">
            {t("signature")}
          </p>
        </div>
      </section>
    </div>
  );
}
