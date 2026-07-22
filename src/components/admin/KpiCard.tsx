import { SparkLine } from "@/components/admin/charts/SparkLine";

interface KpiCardProps {
  label: string;
  value: string;
  sub?: string;
  change?: number; // percent change, positive = good
  sparkData?: number[];
  sparkColor?: string;
  accent?: "champagne" | "aqua" | "ivory";
}

const ACCENT = {
  champagne: "text-champagne",
  aqua: "text-aqua",
  ivory: "text-ivory",
};

export function KpiCard({
  label,
  value,
  sub,
  change,
  sparkData,
  sparkColor,
  accent = "champagne",
}: KpiCardProps) {
  const isUp = change !== undefined && change >= 0;
  const hasChange = change !== undefined;

  return (
    <div className="relative rounded-xl border border-ivory/8 bg-obsidian-soft/60 backdrop-blur p-5 overflow-hidden group hover:border-ivory/15 transition-colors duration-200">
      {/* Subtle glow in top-right corner */}
      <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-champagne/5 blur-2xl pointer-events-none" />

      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="font-body text-[10px] uppercase tracking-[0.25em] text-ivory/40 mb-2">
            {label}
          </p>
          <p className={`font-display text-3xl leading-none ${ACCENT[accent]}`}>
            {value}
          </p>
          {sub && (
            <p className="font-body mt-2 text-[11px] text-ivory/35">{sub}</p>
          )}
          {hasChange && (
            <div className="mt-2 flex items-center gap-1">
              <span
                className={`font-body text-[10px] font-semibold ${isUp ? "text-aqua" : "text-red-400"}`}
              >
                {isUp ? "▲" : "▼"} {Math.abs(change).toFixed(1)}%
              </span>
              <span className="font-body text-[10px] text-ivory/25">vs last 30d</span>
            </div>
          )}
        </div>

        {sparkData && (
          <div className="shrink-0 mt-1">
            <SparkLine
              data={sparkData}
              color={sparkColor ?? "#c9a66b"}
              width={72}
              height={36}
            />
          </div>
        )}
      </div>
    </div>
  );
}
