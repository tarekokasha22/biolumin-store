"use client";

import { useTranslations } from "next-intl";
import { TrustPill } from "@/components/shop/TrustPill";

const ICONS = [
  <path key="cod" d="M2 6h20v13H2zM2 10h20" />,
  <g key="exchange">
    <path d="M3 12a9 9 0 0115-6.7L21 8" />
    <path d="M21 3v5h-5" />
    <path d="M21 12a9 9 0 01-15 6.7L3 16" />
    <path d="M3 21v-5h5" />
  </g>,
  <g key="ship">
    <path d="M3 7h11v8H3z" />
    <path d="M14 10h4l3 3v2h-7z" />
    <circle cx="7" cy="17" r="2" />
    <circle cx="17" cy="17" r="2" />
  </g>,
  <g key="secure">
    <rect x="3" y="11" width="18" height="10" rx="2" />
    <path d="M7 11V7a5 5 0 0110 0v4" />
  </g>,
];

export function HomeTrustStrip() {
  const t = useTranslations("trust");
  const items = [
    { title: t("codTitle"), sub: t("codSub") },
    { title: t("exchangeTitle"), sub: t("exchangeSub") },
    { title: t("shipTitle"), sub: t("shipSub") },
    { title: t("secureTitle"), sub: t("secureSub") },
  ];

  return (
    <div className="no-scrollbar flex gap-2.5 overflow-x-auto border-b border-greige/12 px-4 py-3.5">
      {items.map((it, i) => (
        <TrustPill
          key={i}
          title={it.title}
          sub={it.sub}
          icon={
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
              {ICONS[i]}
            </svg>
          }
        />
      ))}
    </div>
  );
}
