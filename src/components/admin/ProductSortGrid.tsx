"use client";

import { useRef, useState } from "react";
import { reorderProducts, pinProductToTop, resetProductSort } from "@/lib/admin-actions";

type SortProduct = {
  id: string;
  nameEn: string;
  nameAr: string;
  category: string;
  status: string;
  sortOrder: number;
  images: { url: string }[];
};

const STATUS_DOT: Record<string, string> = {
  AVAILABLE: "bg-aqua",
  RESERVED: "bg-champagne",
  SOLD: "bg-ivory/20",
};

export function ProductSortGrid({ initialProducts }: { initialProducts: SortProduct[] }) {
  const [products, setProducts] = useState(initialProducts);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  function handleDragStart(id: string) {
    setDragId(id);
  }

  function handleDragOver(e: React.DragEvent, id: string) {
    e.preventDefault();
    setOverId(id);
  }

  function handleDrop(e: React.DragEvent, targetId: string) {
    e.preventDefault();
    if (!dragId || dragId === targetId) {
      setDragId(null);
      setOverId(null);
      return;
    }
    const from = products.findIndex((p) => p.id === dragId);
    const to = products.findIndex((p) => p.id === targetId);
    const next = [...products];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setProducts(next);
    setDragId(null);
    setOverId(null);
    setSaved(false);
  }

  function handleDragEnd() {
    setDragId(null);
    setOverId(null);
  }

  async function handleSave() {
    setSaving(true);
    const fd = new FormData();
    fd.set("ids", products.map((p) => p.id).join(","));
    await reorderProducts(fd);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="font-body text-[11px] text-ivory/40 max-w-md">
            Drag items to reorder. Products with higher position appear first on the store.
            Click <span className="text-champagne">⬆ Pin</span> to instantly move an item to the top.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {saved && (
            <span className="font-body text-[11px] text-aqua rounded-full bg-aqua/10 px-3 py-1.5">
              Saved ✓
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="font-body rounded-full bg-champagne px-6 py-2.5 text-[11px] uppercase tracking-[0.2em] text-obsidian transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save Order"}
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {products.map((p, i) => (
          <div
            key={p.id}
            draggable
            onDragStart={() => handleDragStart(p.id)}
            onDragOver={(e) => handleDragOver(e, p.id)}
            onDrop={(e) => handleDrop(e, p.id)}
            onDragEnd={handleDragEnd}
            className={`group relative flex flex-col rounded-xl border transition-all duration-150 cursor-grab active:cursor-grabbing select-none ${
              dragId === p.id
                ? "opacity-40 scale-95 border-champagne/40"
                : overId === p.id
                  ? "border-champagne/60 bg-champagne/5 scale-[1.02]"
                  : "border-ivory/10 bg-obsidian-soft/40 hover:border-ivory/20"
            }`}
          >
            {/* Position badge */}
            <div className="absolute top-2 left-2 z-10 flex items-center gap-1.5">
              <span className="font-body text-[10px] rounded-md bg-obsidian/80 backdrop-blur px-1.5 py-0.5 text-ivory/50 border border-ivory/10">
                #{i + 1}
              </span>
              {p.sortOrder > 0 && (
                <span className="font-body text-[9px] rounded-md bg-champagne/20 px-1.5 py-0.5 text-champagne border border-champagne/20">
                  pinned
                </span>
              )}
            </div>

            {/* Status dot */}
            <span
              className={`absolute top-2 right-2 z-10 h-2 w-2 rounded-full border border-obsidian/60 ${STATUS_DOT[p.status] ?? "bg-ivory/20"}`}
            />

            {/* Drag handle */}
            <div className="absolute inset-x-0 top-0 flex justify-center pt-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
              <svg width="16" height="10" viewBox="0 0 16 10" fill="none">
                <rect y="0" width="16" height="1.5" rx="1" fill="rgba(244,240,233,0.3)" />
                <rect y="4" width="16" height="1.5" rx="1" fill="rgba(244,240,233,0.3)" />
                <rect y="8" width="16" height="1.5" rx="1" fill="rgba(244,240,233,0.3)" />
              </svg>
            </div>

            {/* Thumbnail */}
            <div className="aspect-[3/4] w-full overflow-hidden rounded-t-xl bg-obsidian-raised">
              {p.images[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={p.images[0].url}
                  alt=""
                  className="h-full w-full object-cover"
                  draggable={false}
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <span className="font-body text-[9px] text-ivory/20">No image</span>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="p-2 flex-1 flex flex-col gap-1">
              <p className="font-body text-[11px] text-ivory leading-snug line-clamp-2">{p.nameEn}</p>
              <p className="font-body text-[9px] text-ivory/30 capitalize">{p.category}</p>
            </div>

            {/* Actions (visible on hover) */}
            <div className="px-2 pb-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <form action={pinProductToTop}>
                <input type="hidden" name="id" value={p.id} />
                <button
                  type="submit"
                  title="Pin to top"
                  onClick={() => setSaved(false)}
                  className="font-body rounded-md border border-champagne/30 px-2 py-1 text-[9px] uppercase tracking-[0.1em] text-champagne hover:bg-champagne/10 transition-colors"
                >
                  ⬆ Pin
                </button>
              </form>
              {p.sortOrder > 0 && (
                <form action={resetProductSort}>
                  <input type="hidden" name="id" value={p.id} />
                  <button
                    type="submit"
                    title="Remove pin"
                    onClick={() => setSaved(false)}
                    className="font-body rounded-md border border-ivory/15 px-2 py-1 text-[9px] uppercase tracking-[0.1em] text-ivory/40 hover:text-ivory hover:border-ivory/30 transition-colors"
                  >
                    Unpin
                  </button>
                </form>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Hidden form for server action */}
      <form ref={formRef} action={reorderProducts} className="hidden">
        <input name="ids" defaultValue={products.map((p) => p.id).join(",")} />
      </form>
    </div>
  );
}
