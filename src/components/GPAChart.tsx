import { useState } from 'react';

type GPAChartProps = {
  data: { label: string; value: number; date: string }[];
  interval: 'month' | 'semester' | 'year';
};

export default function GPAChart({ data, interval }: GPAChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [animationProgress, setAnimationProgress] = useState(0);

  useState(() => {
    setAnimationProgress(0);
    const timer = setTimeout(() => setAnimationProgress(100), 50);
    return () => clearTimeout(timer);
  });

  const maxValue = 10;
  const minValue = 8.5;
  const chartHeight = 280;
  const chartWidth = 600;
  const padding = { top: 20, right: 20, bottom: 40, left: 50 };

  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;

  const xStep = innerWidth / (data.length - 1);

  const getY = (value: number) => {
    const normalizedValue = (value - minValue) / (maxValue - minValue);
    return padding.top + innerHeight - normalizedValue * innerHeight;
  };

  const points = data.map((item, index) => ({
    x: padding.left + index * xStep,
    y: getY(item.value),
    label: item.label,
    value: item.value,
    date: item.date,
  }));

  const pathData = points.map((point, index) => {
    if (index === 0) {
      return `M ${point.x} ${point.y}`;
    }
    const prevPoint = points[index - 1];
    const controlX1 = prevPoint.x + (point.x - prevPoint.x) / 3;
    const controlX2 = prevPoint.x + ((point.x - prevPoint.x) * 2) / 3;
    return `C ${controlX1} ${prevPoint.y}, ${controlX2} ${point.y}, ${point.x} ${point.y}`;
  }).join(' ');

  const areaPathData = `${pathData} L ${padding.left + innerWidth} ${padding.top + innerHeight} L ${padding.left} ${padding.top + innerHeight} Z`;

  return (
    <div className="relative">
      <svg width={chartWidth} height={chartHeight} className="overflow-visible">
        <defs>
          <linearGradient id="areaGradient" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#164B2E" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#164B2E" stopOpacity="0.05" />
          </linearGradient>
        </defs>

        <path
          d={areaPathData}
          fill="url(#areaGradient)"
          style={{
            transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />

        <path
          d={pathData}
          fill="none"
          stroke="#164B2E"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            strokeDasharray: 1000,
            strokeDashoffset: 1000 - (1000 * animationProgress / 100),
            transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />

        {points.map((point, index) => (
          <g key={index}>
            <circle
              cx={point.x}
              cy={point.y}
              r={hoveredIndex === index ? 8 : 5}
              fill="#164B2E"
              stroke="white"
              strokeWidth="3"
              className="cursor-pointer transition-all"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            />
            {hoveredIndex === index && (
              <>
                <rect
                  x={point.x - 40}
                  y={point.y - 55}
                  width="80"
                  height="45"
                  rx="8"
                  fill="#164B2E"
                  className="animate-scale-in"
                />
                <text
                  x={point.x}
                  y={point.y - 38}
                  textAnchor="middle"
                  fill="white"
                  fontSize="12"
                  fontWeight="500"
                >
                  {point.date}
                </text>
                <text
                  x={point.x}
                  y={point.y - 20}
                  textAnchor="middle"
                  fill="white"
                  fontSize="16"
                  fontWeight="bold"
                >
                  {point.value.toFixed(2)}
                </text>
              </>
            )}
            <text
              x={point.x}
              y={chartHeight - 10}
              textAnchor="middle"
              fill="#6B7280"
              fontSize="12"
              fontWeight="500"
            >
              {point.label}
            </text>
          </g>
        ))}

        <line
          x1={padding.left}
          y1={padding.top}
          x2={padding.left}
          y2={padding.top + innerHeight}
          stroke="#E5E7EB"
          strokeWidth="2"
        />
        <line
          x1={padding.left}
          y1={padding.top + innerHeight}
          x2={padding.left + innerWidth}
          y2={padding.top + innerHeight}
          stroke="#E5E7EB"
          strokeWidth="2"
        />

        {[8.5, 9.0, 9.5, 10.0].map((tick) => (
          <g key={tick}>
            <line
              x1={padding.left - 5}
              y1={getY(tick)}
              x2={padding.left}
              y2={getY(tick)}
              stroke="#9CA3AF"
              strokeWidth="1"
            />
            <text
              x={padding.left - 10}
              y={getY(tick) + 4}
              textAnchor="end"
              fill="#6B7280"
              fontSize="12"
            >
              {tick.toFixed(1)}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
