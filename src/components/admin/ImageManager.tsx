"use client";

import { useRef, useState, useTransition } from "react";
import { deleteProductImage, reorderImages } from "@/lib/admin-actions";

type Img = { id: string; url: string; order: number };

export function ImageManager({
  productId,
  images: initial,
}: {
  productId: string;
  images: Img[];
}) {
  const [images, setImages] = useState<Img[]>(
    [...initial].sort((a, b) => a.order - b.order),
  );
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragSrc, setDragSrc] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);
  const [, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  /* ── upload ─────────────────────────────────────────────── */
  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError(null);
    for (const file of Array.from(files)) {
      const fd = new FormData();
      fd.append("productId", productId);
      fd.append("file", file);
      try {
        const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
        const data = await res.json();
        if (!res.ok) { setError(`Upload failed: ${data.error ?? res.statusText}`); break; }
        setImages((prev) => [...prev, { id: data.id, url: data.url, order: prev.length }]);
      } catch {
        setError("Upload failed — check your connection.");
        break;
      }
    }
    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  /* ── persist order ───────────────────────────────────────── */
  function persistOrder(next: Img[]) {
    const fd = new FormData();
    fd.append("productId", productId);
    fd.append("ids", next.map((i) => i.id).join(","));
    startTransition(async () => { await reorderImages(fd); });
  }

  /* ── drag handlers ───────────────────────────────────────── */
  function onDragStart(i: number) { setDragSrc(i); }
  function onDragOver(e: React.DragEvent, i: number) { e.preventDefault(); setDragOver(i); }
  function onDragEnd() { setDragSrc(null); setDragOver(null); }
  function onDrop(targetIdx: number) {
    if (dragSrc === null || dragSrc === targetIdx) { onDragEnd(); return; }
    const next = [...images];
    const [moved] = next.splice(dragSrc, 1);
    next.splice(targetIdx, 0, moved);
    setImages(next);
    onDragEnd();
    persistOrder(next);
  }

  /* ── arrow move ──────────────────────────────────────────── */
  function move(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= images.length) return;
    const next = [...images];
    [next[i], next[j]] = [next[j], next[i]];
    setImages(next);
    persistOrder(next);
  }

  /* ── set as cover ────────────────────────────────────────── */
  function setCover(i: number) {
    if (i === 0) return;
    const next = [...images];
    const [cover] = next.splice(i, 1);
    next.unshift(cover);
    setImages(next);
    persistOrder(next);
  }

  /* ── delete ──────────────────────────────────────────────── */
  function handleDelete(id: string) {
    const fd = new FormData();
    fd.append("id", id);
    fd.append("productId", productId);
    startTransition(async () => {
      await deleteProductImage(fd);
      setImages((prev) => prev.filter((img) => img.id !== id));
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="font-body text-xs uppercase tracking-[0.15em] text-ivory/40">
          Product Images
        </p>
        {images.length > 1 && (
          <p className="font-body text-[10px] text-ivory/25">Drag to reorder · first = cover</p>
        )}
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
          {images.map((img, i) => (
            <div
              key={img.id}
              draggable
              onDragStart={() => onDragStart(i)}
              onDragOver={(e) => onDragOver(e, i)}
              onDragEnd={onDragEnd}
              onDrop={() => onDrop(i)}
              className={`group relative cursor-grab select-none rounded-sm transition-all active:cursor-grabbing ${
                dragSrc === i ? "opacity-40 scale-95" : ""
              } ${dragOver === i && dragSrc !== i ? "ring-2 ring-champagne" : ""}`}
            >
              {/* Thumbnail */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.url}
                alt=""
                className="h-28 w-full rounded-sm object-cover"
                draggable={false}
              />

              {/* Position badge */}
              <span className="font-body absolute bottom-1 left-1 rounded-sm bg-obsidian/70 px-1.5 py-0.5 text-[9px] text-ivory/60">
                {i + 1}
              </span>

              {/* Cover badge */}
              {i === 0 && (
                <span className="font-body absolute left-1 top-1 rounded-sm bg-champagne px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-obsidian">
                  Cover
                </span>
              )}

              {/* Hover overlay */}
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 rounded-sm bg-obsidian/70 opacity-0 transition-opacity group-hover:opacity-100">
                {/* Set as cover */}
                {i !== 0 && (
                  <button
                    type="button"
                    onClick={() => setCover(i)}
                    className="font-body rounded-full bg-champagne px-2.5 py-1 text-[9px] uppercase tracking-wider text-obsidian transition-opacity hover:opacity-80"
                    title="Set as cover"
                  >
                    Set cover
                  </button>
                )}

                {/* Left / Right arrows */}
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => move(i, -1)}
                    disabled={i === 0}
                    className="flex h-6 w-6 items-center justify-center rounded-full bg-ivory/10 text-xs text-ivory disabled:opacity-20 hover:bg-ivory/25"
                    title="Move left"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    onClick={() => move(i, 1)}
                    disabled={i === images.length - 1}
                    className="flex h-6 w-6 items-center justify-center rounded-full bg-ivory/10 text-xs text-ivory disabled:opacity-20 hover:bg-ivory/25"
                    title="Move right"
                  >
                    →
                  </button>
                </div>

                {/* Delete */}
                <button
                  type="button"
                  onClick={() => handleDelete(img.id)}
                  className="font-body rounded-full border border-red-300/50 px-2.5 py-1 text-[9px] uppercase tracking-wider text-red-300 hover:bg-red-300/10"
                  title="Remove"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload zone */}
      <label
        className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-sm border-2 border-dashed py-8 transition-colors ${
          uploading ? "border-champagne/50 bg-champagne/5" : "border-ivory/15 hover:border-ivory/30"
        }`}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
          disabled={uploading}
        />
        {uploading ? (
          <p className="font-body text-sm text-champagne">Uploading…</p>
        ) : (
          <>
            <p className="font-body text-sm text-ivory/50">Drop images here or click to browse</p>
            <p className="font-body text-[11px] text-ivory/30">JPG · PNG · WEBP · max 10 MB each</p>
          </>
        )}
      </label>

      {error && <p className="font-body text-sm text-red-300">{error}</p>}
    </div>
  );
}
