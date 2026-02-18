"use client";

interface DonutProgressProps {
  pct: number;
  size?: number;
  strokeWidth?: number;
  donutColor?: string;
}

export default function DonutProgress({
  pct,
  size = 44,
  strokeWidth = 3.5,
  donutColor = "#10b981",
}: DonutProgressProps) {
  const color = donutColor;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(pct, 100) / 100) * circumference;
  const center = size / 2;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="flex-shrink-0">
      {/* Track */}
      <circle
        cx={center} cy={center} r={radius}
        fill="none" stroke="#e5e7eb" strokeWidth={strokeWidth}
      />
      {/* Progress */}
      <circle
        cx={center} cy={center} r={radius}
        fill="none" stroke={color} strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${center} ${center})`}
        style={{ transition: "stroke-dashoffset 0.4s ease" }}
      />
      {/* Label */}
      <text
        x={center} y={center}
        textAnchor="middle" dominantBaseline="middle"
        fontSize={size * 0.22} fontWeight="700"
        fill={pct === 100 ? color : "#374151"}
      >
        {Math.round(pct)}%
      </text>
    </svg>
  );
}
