"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Pulse = {
  total: number;
  pending: number;
  latest: { id: string; customerName: string; total: number; governorate: string } | null;
};

type Toast = { id: string; name: string; total: number; governorate: string };

const POLL_MS = 60000;

// Shopify-style "cha-ching" cash-register bell, synthesized with Web Audio —
// no asset to load. A short noise transient (the drawer) leads two bright,
// slightly-inharmonic bell strikes: a quick "cha" then a longer ringing "ching".
function playChime(ctx: AudioContext) {
  const now = ctx.currentTime;
  const master = ctx.createGain();
  master.gain.value = 0.55;
  master.connect(ctx.destination);

  // Bell strike: additive inharmonic partials with a fast attack + metallic decay.
  const strike = (start: number, dur: number, gain: number, base: number) => {
    const partials = [1, 2.01, 2.99, 4.16, 5.43];
    partials.forEach((ratio, i) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = base * ratio;
      const peak = gain * (i === 0 ? 1 : 0.55 / (i + 1));
      g.gain.setValueAtTime(0.0001, start);
      g.gain.exponentialRampToValueAtTime(peak, start + 0.004);
      g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
      osc.connect(g);
      g.connect(master);
      osc.start(start);
      osc.stop(start + dur + 0.03);
    });
  };

  // Drawer "chh" — a short high-passed noise burst before the ring.
  const noiseBuf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.05), ctx.sampleRate);
  const data = noiseBuf.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
  }
  const noise = ctx.createBufferSource();
  noise.buffer = noiseBuf;
  const hp = ctx.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.value = 3200;
  const ng = ctx.createGain();
  ng.gain.value = 0.22;
  noise.connect(hp);
  hp.connect(ng);
  ng.connect(master);
  noise.start(now);

  strike(now + 0.0, 0.18, 0.5, 1050); // "cha" — short
  strike(now + 0.11, 0.75, 0.7, 1180); // "ching" — brighter, rings out
}

export function OrderNotifier({ initialTotal }: { initialTotal: number }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [soundOn, setSoundOn] = useState(true);
  const lastTotal = useRef(initialTotal);
  const ctxRef = useRef<AudioContext | null>(null);

  // Browsers block audio until a user gesture — unlock the context on first tap.
  useEffect(() => {
    const unlock = () => {
      if (!ctxRef.current) {
        const Ctx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (Ctx) ctxRef.current = new Ctx();
      }
      ctxRef.current?.resume();
    };
    window.addEventListener("pointerdown", unlock, { once: true });
    return () => window.removeEventListener("pointerdown", unlock);
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    let alive = true;

    const check = async () => {
      try {
        const res = await fetch("/api/admin/order-pulse", { cache: "no-store" });
        if (!res.ok) return;
        const data: Pulse = await res.json();
        if (!alive) return;
        if (data.total > lastTotal.current && data.latest) {
          lastTotal.current = data.total;
          const t: Toast = {
            id: data.latest.id,
            name: data.latest.customerName,
            total: data.latest.total,
            governorate: data.latest.governorate,
          };
          setToasts((prev) => [t, ...prev].slice(0, 4));
          if (soundOn && ctxRef.current) {
            ctxRef.current.resume().then(() => playChime(ctxRef.current!));
          }
          setTimeout(() => dismiss(t.id), 12000);
        } else if (data.total > lastTotal.current) {
          lastTotal.current = data.total;
        }
      } catch {
        /* transient network / DB blip — next tick retries */
      }
    };

    const iv = setInterval(check, POLL_MS);
    const onVisible = () => document.visibilityState === "visible" && check();
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      alive = false;
      clearInterval(iv);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [soundOn, dismiss]);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-3 z-[80] flex flex-col items-center gap-2 px-3">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="pointer-events-auto flex w-full max-w-md items-center gap-3 rounded-lg border border-champagne/30 bg-obsidian-soft/95 p-3 shadow-[0_16px_40px_-12px_rgba(0,0,0,.75)] backdrop-blur"
        >
          <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-champagne/15 text-champagne">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 7h12l-1 13H7L6 7z" />
              <path d="M9 7a3 3 0 016 0" />
            </svg>
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-body text-[13px] text-ivory">
              New order · <span className="text-champagne">{t.total} EGP</span>
            </p>
            <p className="font-body truncate text-[11px] text-ivory/50">
              {t.name} — {t.governorate}
            </p>
          </div>
          <button
            onClick={() => dismiss(t.id)}
            className="font-body flex-none rounded-full px-2 py-1 text-[11px] text-ivory/40 hover:text-ivory"
            aria-label="Dismiss"
          >
            ✕
          </button>
        </div>
      ))}

      <button
        onClick={() => setSoundOn((s) => !s)}
        className="pointer-events-auto fixed right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border border-ivory/15 bg-obsidian-soft/80 text-ivory/60 backdrop-blur hover:text-champagne"
        aria-label={soundOn ? "Mute order sound" : "Unmute order sound"}
        title={soundOn ? "Order sound: on" : "Order sound: off"}
      >
        {soundOn ? (
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 9v6h4l5 4V5L8 9H4z" />
            <path d="M16 9a3 3 0 010 6M18.5 7a6 6 0 010 10" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 9v6h4l5 4V5L8 9H4z" />
            <path d="M17 9l4 6M21 9l-4 6" />
          </svg>
        )}
      </button>
    </div>
  );
}
