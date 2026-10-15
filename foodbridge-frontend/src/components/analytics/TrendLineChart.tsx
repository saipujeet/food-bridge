import React, { useState } from 'react';
import { Card, CardHeader, CardBody } from '../common/Card';

export interface TrendDataPoint {
  label: string;
  value: number;
  secondaryValue?: number;
}

export interface TrendLineChartProps {
  title: string;
  description?: string;
  data: TrendDataPoint[];
  primaryLabel?: string;
  secondaryLabel?: string;
  primaryColor?: string;
  secondaryColor?: string;
  unit?: string;
  height?: number;
  className?: string;
}

export const TrendLineChart: React.FC<TrendLineChartProps> = ({
  title,
  description,
  data,
  primaryLabel = 'Primary Metric',
  secondaryLabel,
  primaryColor = '#059669', // emerald-600
  secondaryColor = '#2563eb', // blue-600
  unit = '',
  className = '',
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <h3 className="text-base font-extrabold text-slate-900">{title}</h3>
          {description && <p className="text-xs text-slate-500">{description}</p>}
        </CardHeader>
        <CardBody className="py-12 text-center text-xs text-slate-400">
          No trend data recorded for this period.
        </CardBody>
      </Card>
    );
  }

  // Calculate scales
  const maxValue = Math.max(
    ...data.map((d) => Math.max(d.value, d.secondaryValue || 0)),
    10
  );
  const ceiling = Math.ceil(maxValue * 1.15);

  const width = 600;
  const height = 220;
  const paddingX = 40;
  const paddingY = 25;
  const chartW = width - paddingX * 2;
  const chartH = height - paddingY * 2;

  const getX = (idx: number) => {
    if (data.length <= 1) return paddingX + chartW / 2;
    return paddingX + (idx / (data.length - 1)) * chartW;
  };

  const getY = (val: number) => {
    return height - paddingY - (val / ceiling) * chartH;
  };

  // Primary path points
  const pointsPrimary = data.map((d, i) => `${getX(i)},${getY(d.value)}`).join(' ');
  const areaPointsPrimary = `${getX(0)},${height - paddingY} ${pointsPrimary} ${getX(data.length - 1)},${height - paddingY}`;

  // Secondary path points
  const hasSecondary = secondaryLabel && data.some((d) => d.secondaryValue !== undefined);
  const pointsSecondary = hasSecondary
    ? data.map((d, i) => `${getX(i)},${getY(d.secondaryValue || 0)}`).join(' ')
    : '';

  return (
    <Card className={className}>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2">
        <div>
          <h3 className="text-base font-extrabold text-slate-900">{title}</h3>
          {description && <p className="text-xs text-slate-500">{description}</p>}
        </div>

        {/* Legend */}
        <div className="flex items-center space-x-4 text-xs font-bold">
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: primaryColor }} />
            <span className="text-slate-700">{primaryLabel}</span>
          </div>
          {hasSecondary && (
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: secondaryColor }} />
              <span className="text-slate-700">{secondaryLabel}</span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardBody className="p-4 pt-2">
        <div className="relative w-full overflow-hidden">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-auto overflow-visible select-none"
          >
            <defs>
              <linearGradient id="primaryAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={primaryColor} stopOpacity="0.25" />
                <stop offset="100%" stopColor={primaryColor} stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Horizontal Gridlines */}
            {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
              const yVal = height - paddingY - pct * chartH;
              const valLabel = Math.round(pct * ceiling);
              return (
                <g key={idx}>
                  <line
                    x1={paddingX}
                    y1={yVal}
                    x2={width - paddingX}
                    y2={yVal}
                    stroke="#f1f5f9"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                  />
                  <text
                    x={paddingX - 8}
                    y={yVal + 3}
                    textAnchor="end"
                    className="text-[9px] fill-slate-400 font-medium"
                  >
                    {valLabel}
                  </text>
                </g>
              );
            })}

            {/* Area Fill */}
            <polygon points={areaPointsPrimary} fill="url(#primaryAreaGrad)" />

            {/* Secondary Line */}
            {hasSecondary && (
              <polyline
                fill="none"
                stroke={secondaryColor}
                strokeWidth="2.5"
                strokeDasharray="5 3"
                points={pointsSecondary}
              />
            )}

            {/* Primary Line */}
            <polyline
              fill="none"
              stroke={primaryColor}
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={pointsPrimary}
            />

            {/* Interactive Data Dots & X-Labels */}
            {data.map((d, i) => {
              const cx = getX(i);
              const cyPrimary = getY(d.value);
              const isHovered = hoveredIdx === i;

              return (
                <g key={i}>
                  {/* Vertical Guide when hovered */}
                  {isHovered && (
                    <line
                      x1={cx}
                      y1={paddingY}
                      x2={cx}
                      y2={height - paddingY}
                      stroke="#94a3b8"
                      strokeWidth="1"
                      strokeDasharray="3 3"
                    />
                  )}

                  {/* Primary Dot */}
                  <circle
                    cx={cx}
                    cy={cyPrimary}
                    r={isHovered ? 5.5 : 3.5}
                    fill="#ffffff"
                    stroke={primaryColor}
                    strokeWidth="2.5"
                    className="transition-all cursor-pointer"
                    onMouseEnter={() => setHoveredIdx(i)}
                    onMouseLeave={() => setHoveredIdx(null)}
                  />

                  {/* Secondary Dot */}
                  {hasSecondary && d.secondaryValue !== undefined && (
                    <circle
                      cx={cx}
                      cy={getY(d.secondaryValue)}
                      r={isHovered ? 5.5 : 3.5}
                      fill="#ffffff"
                      stroke={secondaryColor}
                      strokeWidth="2.5"
                      className="transition-all cursor-pointer"
                      onMouseEnter={() => setHoveredIdx(i)}
                      onMouseLeave={() => setHoveredIdx(null)}
                    />
                  )}

                  {/* X-axis Label */}
                  <text
                    x={cx}
                    y={height - 6}
                    textAnchor="middle"
                    className={`text-[9px] font-semibold transition-colors ${
                      isHovered ? 'fill-slate-900 font-extrabold' : 'fill-slate-400'
                    }`}
                  >
                    {d.label.length > 5 ? d.label.slice(-5) : d.label}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Hover Tooltip Box */}
          {hoveredIdx !== null && (
            <div
              className="absolute pointer-events-none bg-slate-900 text-white rounded-xl shadow-xl px-3 py-2 text-xs border border-slate-700 -translate-x-1/2 -translate-y-full mb-2 z-20 space-y-0.5"
              style={{
                left: `${(getX(hoveredIdx) / width) * 100}%`,
                top: `${(getY(data[hoveredIdx].value) / height) * 100}%`,
              }}
            >
              <p className="text-[10px] text-slate-400 font-bold uppercase">
                {data[hoveredIdx].label}
              </p>
              <p className="font-extrabold text-emerald-400 flex items-center justify-between space-x-2">
                <span>{primaryLabel}:</span>
                <span>
                  {data[hoveredIdx].value} {unit}
                </span>
              </p>
              {hasSecondary && data[hoveredIdx].secondaryValue !== undefined && (
                <p className="font-extrabold text-blue-400 flex items-center justify-between space-x-2">
                  <span>{secondaryLabel}:</span>
                  <span>
                    {data[hoveredIdx].secondaryValue} {unit}
                  </span>
                </p>
              )}
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
};
