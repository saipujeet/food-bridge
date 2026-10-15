import React from 'react';
import { Card, CardHeader, CardBody } from '../common/Card';

export interface DistributionItem {
  label: string;
  count: number;
  percentage: number;
  secondaryText?: string;
  color?: string;
}

export interface DistributionBarChartProps {
  title: string;
  description?: string;
  items: DistributionItem[];
  className?: string;
}

export const DistributionBarChart: React.FC<DistributionBarChartProps> = ({
  title,
  description,
  items,
  className = '',
}) => {
  const defaultColors = [
    'bg-emerald-500',
    'bg-blue-500',
    'bg-amber-500',
    'bg-rose-500',
    'bg-indigo-500',
    'bg-teal-500',
    'bg-purple-500',
  ];

  return (
    <Card className={className}>
      <CardHeader>
        <h3 className="text-base font-extrabold text-slate-900">{title}</h3>
        {description && <p className="text-xs text-slate-500">{description}</p>}
      </CardHeader>
      <CardBody className="p-6 space-y-4">
        {items.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">
            No distribution records available.
          </p>
        ) : (
          items.map((item, idx) => {
            const barColor = item.color || defaultColors[idx % defaultColors.length];
            return (
              <div key={item.label} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                  <div className="flex items-center space-x-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${barColor}`} />
                    <span>{item.label}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-slate-500">
                    {item.secondaryText && (
                      <span className="text-[11px] font-medium text-slate-400">
                        {item.secondaryText}
                      </span>
                    )}
                    <span className="font-extrabold text-slate-900">
                      {item.percentage}%
                    </span>
                    <span className="text-[11px] font-medium">({item.count})</span>
                  </div>
                </div>

                <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${barColor} transition-all duration-500`}
                    style={{ width: `${Math.min(100, Math.max(0, item.percentage))}%` }}
                  />
                </div>
              </div>
            );
          })
        )}
      </CardBody>
    </Card>
  );
};
