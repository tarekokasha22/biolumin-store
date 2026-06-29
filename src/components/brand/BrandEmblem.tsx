"use client";

import { useId } from "react";

type Props = {
  /** show the BIOLUMIN wordmark + tagline in the core */
  showWordmark?: boolean;
  /** tagline language ("ar" renders the Arabic tagline) */
  locale?: string;
  className?: string;
  style?: React.CSSProperties;
  /** decorative-only (no a11y label) */
  decorative?: boolean;
};

/**
 * The Biolumin brand-identity emblem — concentric counter-rotating orbits
 * around a breathing luminous core. Animation classes live in globals.css
 * (.bl-spin-cw / .bl-spin-ccw / .bl-spin-cw-fast / .bl-emblem-breathe) and
 * are disabled under prefers-reduced-motion.
 */
export function BrandEmblem({
  showWordmark = true,
  locale = "en",
  className,
  style,
  decorative = false,
}: Props) {
  const isAr = locale === "ar";
  // unique gradient/filter ids so multiple emblems can coexist on one page
  const uid = useId().replace(/:/g, "");
  const core = `core-${uid}`;
  const gold = `gold-${uid}`;
  const aqua = `aqua-${uid}`;
  const soft = `soft-${uid}`;

  return (
    <svg
      viewBox="0 0 400 400"
      role={decorative ? "presentation" : "img"}
      aria-hidden={decorative || undefined}
      aria-label={
        decorative
          ? undefined
          : isAr
            ? "BIOLUMIN — نورك يبان"
            : "BIOLUMIN — Wear your light"
      }
      className={className}
      style={{ overflow: "visible", ...style }}
    >
      <defs>
        <radialGradient id={core} cx="50%" cy="44%" r="56%">
          <stop offset="0%" stopColor="#bdf6ec" stopOpacity="0.95" />
          <stop offset="36%" stopColor="#48d6c2" stopOpacity="0.5" />
          <stop offset="70%" stopColor="#c9a66b" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#c9a66b" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={gold} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#e3c895" />
          <stop offset="100%" stopColor="rgba(201,166,107,0.12)" />
        </linearGradient>
        <linearGradient id={aqua} x1="1" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#48d6c2" />
          <stop offset="100%" stopColor="rgba(72,214,194,0.08)" />
        </linearGradient>
        <filter id={soft} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.6" />
        </filter>
      </defs>

      {/* outer dashed orbit — clockwise */}
      <g className="bl-spin-cw">
        <circle
          cx="200"
          cy="200"
          r="170"
          fill="none"
          stroke={`url(#${gold})`}
          strokeWidth="1"
          strokeDasharray="2 11"
          opacity="0.7"
        />
        <circle cx="200" cy="30" r="4.5" fill="#e3c895" filter={`url(#${soft})`} />
        <circle cx="200" cy="370" r="2.5" fill="#c9a66b" />
      </g>

      {/* mid orbit — counter-clockwise */}
      <g className="bl-spin-ccw">
        <circle
          cx="200"
          cy="200"
          r="134"
          fill="none"
          stroke={`url(#${aqua})`}
          strokeWidth="1.2"
          opacity="0.55"
        />
        <circle cx="334" cy="200" r="3.6" fill="#48d6c2" filter={`url(#${soft})`} />
        <circle cx="66" cy="200" r="2" fill="#48d6c2" />
      </g>

      {/* inner orbit — fast clockwise */}
      <g className="bl-spin-cw-fast">
        <circle
          cx="200"
          cy="200"
          r="100"
          fill="none"
          stroke="rgba(244,240,233,0.12)"
          strokeWidth="1"
        />
        <circle cx="200" cy="100" r="2.6" fill="#f4f0e9" opacity="0.85" />
      </g>

      {/* breathing luminous core */}
      <g className="bl-emblem-breathe">
        <circle cx="200" cy="200" r="94" fill={`url(#${core})`} />
        <circle
          cx="200"
          cy="200"
          r="60"
          fill="none"
          stroke="rgba(201,166,107,0.38)"
          strokeWidth="1"
        />
      </g>

      {showWordmark && (
        <>
          <text
            x="200"
            y="196"
            textAnchor="middle"
            fontFamily="var(--font-display-active, Georgia, serif)"
            fontSize="29"
            letterSpacing="5.5"
            fill="#f4f0e9"
          >
            BIOLUMIN
          </text>
          <text
            x="200"
            y="224"
            textAnchor="middle"
            fontFamily="var(--font-display-active, Georgia, serif)"
            fontSize="14"
            letterSpacing="3"
            fill="#c9a66b"
          >
            {isAr ? "نورِك يبان" : "Wear your light"}
          </text>
        </>
      )}
    </svg>
  );
}

export default BrandEmblem;
