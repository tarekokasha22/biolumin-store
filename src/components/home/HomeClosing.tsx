"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

export function HomeClosing() {
  const t = useTranslations("home");
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.registerPlugin(ScrollTrigger);
      const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      gsap.fromTo(
        ".closing-line",
        { opacity: 0, y: reduce ? 0 : 40 },
        {
          opacity: 1,
          y: 0,
          duration: 1.4,
          ease: "power3.out",
          scrollTrigger: { trigger: root.current, start: "top 70%" },
        },
      );

      gsap.to(".closing-glow", {
        opacity: 0.7,
        scale: 1.15,
        duration: 5,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      });
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      className="relative flex min-h-[80vh] items-center justify-center overflow-hidden px-6"
    >
      <div
        className="closing-glow pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[55vh] w-[55vh] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-40"
        style={{
          background:
            "radial-gradient(circle, rgba(201,166,107,0.18), rgba(72,214,194,0.08) 45%, transparent 72%)",
          filter: "blur(50px)",
        }}
      />
      <div className="text-center">
        <h2 className="closing-line font-display glow-gold text-5xl text-champagne sm:text-7xl md:text-8xl">
          {t("closingLine")}
        </h2>
        <div className="closing-line mt-12">
          <Link
            href="/shop"
            className="font-body group relative inline-flex items-center gap-3 rounded-full border border-champagne/50 px-10 py-4 text-xs uppercase tracking-[0.25em] text-ivory transition-all duration-500 hover:border-champagne hover:bg-champagne hover:text-obsidian"
          >
            {t("closingCta")}
            <span className="transition-transform duration-500 group-hover:translate-x-1 rtl:group-hover:-translate-x-1">
              →
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
