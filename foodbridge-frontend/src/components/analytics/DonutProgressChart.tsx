import React from 'react';
import { Card, CardHeader, CardBody } from '../common/Card';

export interface DonutProgressChartProps {
  title: string;
  subtitle?: string;
  current: number;
  max: number;
  unit?: string;
  metricLabel?: string;
  color?: string;
  trackColor?: string;
  remainingLabel?: string;
  className?: string;
}

export const DonutProgressChart: React.FC<DonutProgressChartProps> = ({
  title,
  subtitle,
  current,
  max,
  unit = 'kg',
  metricLabel = 'Used Capacity',
  color = '#059669', // emerald-600
  trackColor = '#e2e8f0', // slate-200
  remainingLabel = 'Remaining Capacity',
  className = '',
}) => {
  const percentage = max > 0 ? Math.min(100, Math.round((current / max) * 100)) : 0;
  const remaining = Math.max(0, max - current);

  const radius = 64;
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <Card className={className}>
      <CardHeader>
        <h3 className="text-base font-extrabold text-slate-900">{title}</h3>
        {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
      </CardHeader>
      <CardBody className="p-6 flex flex-col items-center justify-center">
        {/* SVG Circular Gauge */}
        <div className="relative w-44 h-44 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 160 160">
            {/* Background Track Circle */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              stroke={trackColor}
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            {/* Animated Progress Circle */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              stroke={color}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-1000 ease-out"
            />
          </svg>

          {/* Centered Percentage */}
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-black text-slate-900 tracking-tight">
              {percentage}%
            </span>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              {metricLabel}
            </span>
          </div>
        </div>

        {/* Legend Numbers Breakdown */}
        <div className="w-full grid grid-cols-2 gap-3 pt-6 mt-4 border-t border-slate-100 text-center">
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              Used Today
            </p>
            <p className="text-base font-black text-slate-900 mt-0.5">
              {current} <span className="text-xs font-semibold text-slate-500">{unit}</span>
            </p>
          </div>

          <div className="bg-emerald-50 p-2.5 rounded-xl border border-emerald-100">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700">
              {remainingLabel}
            </p>
            <p className="text-base font-black text-emerald-800 mt-0.5">
              {remaining} <span className="text-xs font-semibold text-emerald-600">{unit}</span>
            </p>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};
