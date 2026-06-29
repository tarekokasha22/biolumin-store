"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Img = { url: string; alt: string };

export function ProductGallery({
  images,
  sold,
  soldLabel,
}: {
  images: Img[];
  sold: boolean;
  soldLabel: string;
}) {
  const [active, setActive] = useState(0);
  const current = images[active] ?? images[0];

  return (
    <div className="flex flex-col gap-4">
      <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-obsidian-soft">
        <AnimatePresence mode="wait">
          <motion.img
            key={active}
            src={current?.url}
            alt={current?.alt}
            initial={{ opacity: 0, scale: 1.03 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className={`h-full w-full object-cover ${
              sold ? "opacity-40 grayscale" : ""
            }`}
          />
        </AnimatePresence>
        {sold && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-display text-3xl tracking-[0.2em] text-ivory/85">
              {soldLabel}
            </span>
          </div>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex gap-3">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`relative aspect-square w-20 overflow-hidden rounded-sm border transition-colors ${
                i === active ? "border-champagne" : "border-ivory/15"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.url}
                alt={img.alt}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
