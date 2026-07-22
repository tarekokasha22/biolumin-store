"use client";

type DataPoint = { date: string; revenue: number };

interface BarChartProps {
  data: DataPoint[];
  height?: number;
}

export function BarChart({ data, height = 160 }: BarChartProps) {
  if (!data.length) return null;

  const max = Math.max(...data.map((d) => d.revenue), 1);
  const barWidth = 100 / data.length;
  const gap = 0.4;

  // Show only every Nth label to avoid crowding
  const labelStep = data.length <= 7 ? 1 : data.length <= 14 ? 2 : 7;

  return (
    <div className="w-full" style={{ height }}>
      <svg
        viewBox={`0 0 100 ${height}`}
        preserveAspectRatio="none"
        className="w-full h-full overflow-visible"
      >
        <defs>
          <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#c9a66b" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#c9a66b" stopOpacity="0.2" />
          </linearGradient>
          <linearGradient id="barGradHover" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#e3c895" stopOpacity="1" />
            <stop offset="100%" stopColor="#c9a66b" stopOpacity="0.4" />
          </linearGradient>
        </defs>

        {/* Horizontal grid lines */}
        {[0.25, 0.5, 0.75, 1].map((ratio) => (
          <line
            key={ratio}
            x1="0"
            y1={height - ratio * (height - 20)}
            x2="100"
            y2={height - ratio * (height - 20)}
            stroke="rgba(244,240,233,0.06)"
            strokeWidth="0.3"
            vectorEffect="non-scaling-stroke"
          />
        ))}

        {/* Bars */}
        {data.map((d, i) => {
          const barH = max > 0 ? ((d.revenue / max) * (height - 24)) : 0;
          const x = i * barWidth + gap / 2;
          const w = barWidth - gap;
          const y = height - 20 - barH;

          return (
            <g key={d.date} className="group">
              {/* Invisible full-height hover zone */}
              <rect x={x} y={0} width={w} height={height - 20} fill="transparent" />
              {/* Visible bar */}
              {barH > 0 && (
                <rect
                  x={x}
                  y={y}
                  width={w}
                  height={barH}
                  fill="url(#barGrad)"
                  rx="0.4"
                  className="transition-all duration-150 group-hover:fill-[url(#barGradHover)]"
                  style={{ transformOrigin: `${x + w / 2}px ${height - 20}px` }}
                />
              )}
              {/* Tooltip on hover */}
              {d.revenue > 0 && (
                <g className="opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                  <rect
                    x={Math.min(x - 8, 68)}
                    y={Math.max(y - 20, 2)}
                    width="22"
                    height="10"
                    rx="1.5"
                    fill="#1d1d21"
                    stroke="rgba(201,166,107,0.3)"
                    strokeWidth="0.3"
                  />
                  <text
                    x={Math.min(x + w / 2 - 8, 79)}
                    y={Math.max(y - 12, 10)}
                    textAnchor="middle"
                    fill="#c9a66b"
                    style={{ fontSize: "2.8px", fontFamily: "system-ui" }}
                  >
                    {d.revenue >= 1000
                      ? `${(d.revenue / 1000).toFixed(1)}k`
                      : String(d.revenue)}
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {/* X-axis labels */}
        {data.map((d, i) => {
          if (i % labelStep !== 0) return null;
          const x = i * barWidth + barWidth / 2;
          const label = d.date.slice(5); // MM-DD
          return (
            <text
              key={d.date}
              x={x}
              y={height - 4}
              textAnchor="middle"
              fill="rgba(244,240,233,0.3)"
              style={{ fontSize: "2.8px", fontFamily: "system-ui" }}
            >
              {label}
            </text>
          );
        })}
      </svg>
    </div>
  );
}
