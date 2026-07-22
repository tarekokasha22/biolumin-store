"use client";

interface Segment {
  label: string;
  value: number;
  color: string;
}

export function DonutChart({ segments, total }: { segments: Segment[]; total: number }) {
  const size = 120;
  const cx = size / 2;
  const cy = size / 2;
  const r = 44;
  const innerR = 28;
  const gap = 0.02; // radians between segments

  if (total === 0) {
    return (
      <div className="flex flex-col items-center gap-4">
        <div
          className="rounded-full border-[6px] border-ivory/8 flex items-center justify-center"
          style={{ width: size, height: size }}
        >
          <span className="font-body text-xs text-ivory/30">No data</span>
        </div>
      </div>
    );
  }

  // Build arc paths
  let currentAngle = -Math.PI / 2;
  const paths: { d: string; color: string; label: string; value: number }[] = [];

  for (const seg of segments) {
    if (seg.value === 0) continue;
    const fraction = seg.value / total;
    const angle = fraction * 2 * Math.PI - gap;

    const x1 = cx + r * Math.cos(currentAngle + gap / 2);
    const y1 = cy + r * Math.sin(currentAngle + gap / 2);
    const x2 = cx + r * Math.cos(currentAngle + angle + gap / 2);
    const y2 = cy + r * Math.sin(currentAngle + angle + gap / 2);
    const x3 = cx + innerR * Math.cos(currentAngle + angle + gap / 2);
    const y3 = cy + innerR * Math.sin(currentAngle + angle + gap / 2);
    const x4 = cx + innerR * Math.cos(currentAngle + gap / 2);
    const y4 = cy + innerR * Math.sin(currentAngle + gap / 2);

    const largeArc = angle > Math.PI ? 1 : 0;

    const d = [
      `M ${x1} ${y1}`,
      `A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`,
      `L ${x3} ${y3}`,
      `A ${innerR} ${innerR} 0 ${largeArc} 0 ${x4} ${y4}`,
      "Z",
    ].join(" ");

    paths.push({ d, color: seg.color, label: seg.label, value: seg.value });
    currentAngle += fraction * 2 * Math.PI;
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {paths.map((p, i) => (
          <path
            key={i}
            d={p.d}
            fill={p.color}
            opacity="0.85"
            className="transition-opacity hover:opacity-100 cursor-default"
          />
        ))}
        {/* Center text */}
        <text
          x={cx}
          y={cy - 5}
          textAnchor="middle"
          fill="#f4f0e9"
          style={{ fontSize: "9px", fontFamily: "system-ui", fontWeight: 600 }}
        >
          {total}
        </text>
        <text
          x={cx}
          y={cy + 7}
          textAnchor="middle"
          fill="rgba(244,240,233,0.4)"
          style={{ fontSize: "5px", fontFamily: "system-ui" }}
        >
          orders
        </text>
      </svg>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5">
        {segments
          .filter((s) => s.value > 0)
          .map((s) => (
            <div key={s.label} className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full shrink-0" style={{ background: s.color }} />
              <span className="font-body text-[10px] text-ivory/50">
                {s.label} <span className="text-ivory/30">({s.value})</span>
              </span>
            </div>
          ))}
      </div>
    </div>
  );
}
