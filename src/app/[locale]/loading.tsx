// Route-level loading fallback. A thin champagne progress shimmer pinned to the
// top plus a soft centered breathing dot — the brand's "breathing light." Keeps
// a stable min-height so navigation never jumps. motion-reduce users get statics.
export default function Loading() {
  return (
    <div className="relative flex min-h-[70vh] items-center justify-center">
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[2px] overflow-hidden bg-champagne/10"
      >
        <span className="block h-full w-1/3 rounded-full bg-champagne/80 shadow-[0_0_10px_rgba(201,166,107,.7)] motion-safe:animate-[loading-sweep_1.1s_ease-in-out_infinite]" />
      </span>
      <span className="sr-only">Loading…</span>
      <span className="h-2.5 w-2.5 rounded-full bg-champagne/80 motion-safe:animate-pulse" />
    </div>
  );
}
