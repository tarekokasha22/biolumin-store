"use client";

import { useMemo } from "react";
import { useHydrated } from "@/lib/use-hydrated";

type Spore = {
  left: number;
  size: number;
  delay: number;
  rise: number;
  flicker: number;
  drift: number;
};

/**
 * Drifting bioluminescent spores — tiny living lights rising through
 * the dark like plankton in the deep. A fixed, hand-varied set keeps
 * the field deterministic (SSR-safe, pure) while still feeling
 * organic. Animated GPU-only; rendered only after hydration so the
 * server markup stays clean.
 */
const FIELD: Spore[] = [
  { left: 6, size: 3, delay: -2, rise: 21, flicker: 3.2, drift: 40 },
  { left: 13, size: 5, delay: -14, rise: 28, flicker: 4.6, drift: -64 },
  { left: 19, size: 2, delay: -7, rise: 18, flicker: 2.8, drift: 22 },
  { left: 24, size: 4, delay: -22, rise: 33, flicker: 5.1, drift: 90 },
  { left: 30, size: 3, delay: -4, rise: 24, flicker: 3.7, drift: -38 },
  { left: 36, size: 6, delay: -18, rise: 30, flicker: 4.2, drift: 58 },
  { left: 41, size: 2, delay: -11, rise: 19, flicker: 2.6, drift: -18 },
  { left: 47, size: 4, delay: -25, rise: 36, flicker: 5.4, drift: 120 },
  { left: 52, size: 3, delay: -6, rise: 22, flicker: 3.1, drift: -52 },
  { left: 58, size: 5, delay: -16, rise: 27, flicker: 4.8, drift: 70 },
  { left: 63, size: 2, delay: -9, rise: 20, flicker: 2.9, drift: 30 },
  { left: 69, size: 4, delay: -21, rise: 32, flicker: 5.0, drift: -84 },
  { left: 74, size: 3, delay: -3, rise: 23, flicker: 3.5, drift: 46 },
  { left: 80, size: 6, delay: -19, rise: 29, flicker: 4.4, drift: -66 },
  { left: 85, size: 2, delay: -12, rise: 17, flicker: 2.7, drift: 14 },
  { left: 90, size: 4, delay: -24, rise: 35, flicker: 5.3, drift: 100 },
  { left: 95, size: 3, delay: -5, rise: 25, flicker: 3.9, drift: -34 },
  { left: 9, size: 5, delay: -17, rise: 31, flicker: 4.7, drift: 62 },
  { left: 33, size: 2, delay: -10, rise: 18, flicker: 2.5, drift: -24 },
  { left: 55, size: 4, delay: -23, rise: 34, flicker: 5.2, drift: 78 },
  { left: 77, size: 3, delay: -8, rise: 26, flicker: 3.4, drift: -48 },
  { left: 88, size: 5, delay: -15, rise: 28, flicker: 4.9, drift: 54 },
];

export function Spores() {
  const hydrated = useHydrated();

  // On small screens, render roughly half the field for performance.
  const spores = useMemo<Spore[]>(() => {
    if (!hydrated) return [];
    const compact =
      typeof window !== "undefined" && window.innerWidth < 640;
    return compact ? FIELD.filter((_, i) => i % 2 === 0) : FIELD;
  }, [hydrated]);

  return (
    <div
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      aria-hidden="true"
    >
      {spores.map((s, i) => (
        <span
          key={i}
          className="spore"
          style={
            {
              left: `${s.left}%`,
              bottom: "-8vh",
              width: `${s.size}px`,
              height: `${s.size}px`,
              "--drift": `${s.drift}px`,
              animationDuration: `${s.rise}s, ${s.flicker}s`,
              animationDelay: `${s.delay}s, ${s.delay}s`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
