// Route-level loading fallback. Deliberately minimal — a single slow champagne
// pulse on obsidian, the brand's "breathing light." No layout shift, no spinner
// chrome. motion-reduce users get a static dot.
export default function Loading() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <span className="sr-only">Loading…</span>
      <span className="h-2.5 w-2.5 rounded-full bg-champagne/80 motion-safe:animate-pulse" />
    </div>
  );
}
