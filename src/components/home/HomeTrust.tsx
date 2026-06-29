"use client";

import { useTranslations } from "next-intl";

const ICON_PATHS: Record<string, string> = {
  cod:      '<rect x="2" y="6" width="20" height="13" rx="2"/><path d="M2 10h20"/>',
  exchange: '<path d="M3 12a9 9 0 0115-6.7L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 01-15 6.7L3 16"/><path d="M3 21v-5h5"/>',
  shipping: '<path d="M3 7h11v8H3z"/><path d="M14 10h4l3 3v2h-7z"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/>',
  authentic:'<path d="M12 2l8 4v6c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6z"/><path d="M9 12l2 2 4-4"/>',
  secure:   '<rect x="3" y="11" width="18" height="10" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>',
};

function Icon({ paths }: { paths: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="22"
      height="22"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      dangerouslySetInnerHTML={{ __html: paths }}
    />
  );
}

const ITEMS = [
  { key: "cod",       icon: "cod"       },
  { key: "exchange",  icon: "exchange"  },
  { key: "shipping",  icon: "shipping"  },
  { key: "secure",    icon: "secure"    },
] as const;

export default function HomeTrust() {
  const t = useTranslations("trust");

  return (
    <div
      style={{
        borderBlock: "1px solid rgba(138,129,117,.16)",
        background: "rgba(22,22,25,.5)",
      }}
    >
      <div
        className="bl-trust-grid"
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "22px 24px",
          display: "grid",
          gridTemplateColumns: "repeat(4,1fr)",
          gap: "18px",
        }}
      >
        {ITEMS.map(({ key, icon }) => (
          <div
            key={key}
            style={{ display: "flex", alignItems: "center", gap: "12px", justifyContent: "center" }}
          >
            <div style={{ flexShrink: 0, color: "#c9a66b" }}>
              <Icon paths={ICON_PATHS[icon]} />
            </div>
            <div>
              <p style={{ fontSize: "12.5px", color: "#f4f0e9", lineHeight: 1.3 }}>
                {t(key)}
              </p>
              <p style={{ fontSize: "10.5px", color: "rgba(244,240,233,.5)", lineHeight: 1.3, marginTop: "2px" }}>
                {t(`${key}Sub`)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
