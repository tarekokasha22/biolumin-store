"use client";

import { useTranslations } from "next-intl";
import { Reveal } from "@/components/motion/Reveal";

export function HomePillars() {
  const t = useTranslations("home");

  const pillars = [
    { title: t("pillar1Title"), body: t("pillar1Body"), n: "01" },
    { title: t("pillar2Title"), body: t("pillar2Body"), n: "02" },
    { title: t("pillar3Title"), body: t("pillar3Body"), n: "03" },
  ];

  return (
    <section className="px-4 py-[34px]">
      <Reveal>
        <p className="font-body mb-4 text-center text-[10.5px] tracking-[0.3em] text-champagne uppercase">
          {t("pillarsKicker")}
        </p>
      </Reveal>

      <div className="flex flex-col gap-2.5">
        {pillars.map((p, i) => (
          <Reveal key={p.n} delay={i * 0.1}>
            <div className="flex items-start gap-3.5 rounded-[15px] border border-greige/14 bg-linear-to-b from-panel/80 to-panel/50 p-4.5">
              <span className="font-display w-[34px] flex-none text-[26px] leading-none text-champagne">
                {p.n}
              </span>
              <div>
                <div className="font-display mb-1 text-xl text-white">{p.title}</div>
                <div className="font-body text-[13px] leading-[1.65] text-ivory/62">{p.body}</div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
