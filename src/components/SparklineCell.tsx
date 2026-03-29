interface SparklineCellProps {
  data: number[];
  isPositive: boolean;
  width?: number;
  height?: number;
}

export function SparklineCell({
  data,
  isPositive,
  width = 72,
  height = 28,
}: SparklineCellProps) {
  if (!data || data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const polyline = pts.join(" ");
  const color = isPositive ? "oklch(0.72 0.18 155)" : "oklch(0.65 0.22 25)";

  // Build a closed fill path
  const fillPts = [`0,${height}`, ...pts, `${width},${height}`].join(" ");

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      role="img"
      aria-label={`Price trend ${isPositive ? "up" : "down"}`}
    >
      <defs>
        <linearGradient
          id={`sg-${isPositive ? "g" : "r"}`}
          x1="0"
          y1="0"
          x2="0"
          y2="1"
        >
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={fillPts} fill={`url(#sg-${isPositive ? "g" : "r"})`} />
      <polyline
        points={polyline}
        stroke={color}
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
