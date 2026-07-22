"use client";

interface SparkLineProps {
  data: number[];
  color?: string;
  height?: number;
  width?: number;
}

export function SparkLine({
  data,
  color = "#c9a66b",
  height = 32,
  width = 80,
}: SparkLineProps) {
  if (!data.length || data.every((v) => v === 0)) {
    return (
      <svg width={width} height={height}>
        <line
          x1="0"
          y1={height / 2}
          x2={width}
          y2={height / 2}
          stroke="rgba(244,240,233,0.1)"
          strokeWidth="1"
        />
      </svg>
    );
  }

  const max = Math.max(...data, 1);
  const min = Math.min(...data);
  const range = max - min || 1;
  const pad = 3;
  const usableH = height - pad * 2;
  const step = (width - pad * 2) / Math.max(data.length - 1, 1);

  const points = data.map((v, i) => ({
    x: pad + i * step,
    y: pad + usableH - ((v - min) / range) * usableH,
  }));

  const pathD = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ");

  // Area fill
  const areaD =
    pathD +
    ` L ${points[points.length - 1].x.toFixed(1)} ${height}` +
    ` L ${points[0].x.toFixed(1)} ${height} Z`;

  const gradId = `spark-${color.replace("#", "")}`;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#${gradId})`} />
      <path d={pathD} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* Last point dot */}
      <circle
        cx={points[points.length - 1].x}
        cy={points[points.length - 1].y}
        r="2"
        fill={color}
      />
    </svg>
  );
}
