"use client";

import { useRef, useState } from "react";

type Img = { url: string; alt: string };

type Props = {
  images: Img[];
  sold: boolean;
  soldLabel: string;
  badge?: React.ReactNode;
  wishlistSlot?: React.ReactNode;
};

/**
 * Horizontal scroll-snap swipe gallery — replaces the old click-thumbnail
 * version. Scroll direction is forced LTR regardless of page locale: swipe
 * order for photos shouldn't mirror in Arabic.
 */
export function ProductGallery({ images, sold, soldLabel, badge, wishlistSlot }: Props) {
  const [active, setActive] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);

  const onScroll = () => {
    const el = trackRef.current;
    if (!el) return;
    const i = Math.round(el.scrollLeft / el.clientWidth);
    if (i !== active && i >= 0 && i < images.length) setActive(i);
  };

  const scrollTo = (i: number) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
    setActive(i);
  };

  return (
    <div>
      {/* Main image — dots overlay THIS, not the thumbnails below it. */}
      <div className="relative">
        <div
          ref={trackRef}
          dir="ltr"
          onScroll={onScroll}
          className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto bg-[#0c0c0e]"
        >
          {images.map((img, i) => (
            <div key={i} className="aspect-4/5 w-full flex-none snap-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.url}
                alt={img.alt}
                className={`h-full w-full object-cover ${sold ? "opacity-80 grayscale-[.3]" : ""}`}
              />
            </div>
          ))}
        </div>

        {sold && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <span className="font-display text-3xl tracking-[0.2em] text-ivory/85">{soldLabel}</span>
          </div>
        )}

        {badge && <div className="absolute top-3 start-3">{badge}</div>}
        {wishlistSlot && <div className="absolute top-2.5 end-3">{wishlistSlot}</div>}

        {images.length > 1 && (
          <div className="pointer-events-none absolute inset-x-0 bottom-3 flex items-center justify-center gap-1.5">
            {images.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === active ? "w-[18px] bg-champagne" : "w-1.5 bg-ivory/45"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnail strip under the main image — tap a frame to jump to it,
          the active one is ringed in champagne. Forced LTR so the order of
          shots never mirrors in Arabic. The 4/5 ratio matches the hero so the
          crop looks identical, just smaller. */}
      {images.length > 1 && (
        <div dir="ltr" className="no-scrollbar mt-2.5 flex gap-2 overflow-x-auto px-3.5 pb-0.5">
          {images.map((img, i) => (
            <button
              key={i}
              type="button"
              aria-label={`View image ${i + 1}`}
              onClick={() => scrollTo(i)}
              className={`aspect-4/5 w-[54px] flex-none overflow-hidden rounded-[9px] transition-all duration-200 ${
                i === active
                  ? "ring-2 ring-champagne ring-offset-2 ring-offset-obsidian opacity-100"
                  : "opacity-55 hover:opacity-80"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt={img.alt} className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
