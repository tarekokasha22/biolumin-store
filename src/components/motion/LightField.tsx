"use client";

import { useEffect, useRef } from "react";

/**
 * Carried light — a soft bioluminescent glow that trails the pointer
 * across the whole site, sitting behind page content. This is the
 * brand made interactive: light that lives and responds to you.
 *
 * Disabled for reduced-motion and coarse (touch) pointers, where a
 * trailing cursor glow has no meaning and costs battery.
 */
export function LightField() {
  const root = useRef<HTMLDivElement>(null);
  const orb = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    if (reduce || coarse) return;

    const container = root.current;
    const el = orb.current;
    if (!container || !el) return;

    let tx = window.innerWidth / 2;
    let ty = window.innerHeight / 2;
    let x = tx;
    let y = ty;
    let raf = 0;
    let live = false;

    const onMove = (e: PointerEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      if (!live) {
        live = true;
        container.classList.add("is-live");
      }
    };

    const tick = () => {
      // ease toward the target — slow, luxurious trailing motion
      x += (tx - x) * 0.075;
      y += (ty - y) * 0.075;
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return (
    <div ref={root} className="lumina" aria-hidden="true">
      <div ref={orb} className="lumina__orb" />
    </div>
  );
}
