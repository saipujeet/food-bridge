import React from 'react';
import { Card, CardBody } from '../common/Card';
import { TrendingUp, TrendingDown } from 'lucide-react';

export interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  variant?: 'emerald' | 'blue' | 'amber' | 'rose' | 'slate' | 'indigo';
  trend?: {
    value: string | number;
    isPositive?: boolean;
    label?: string;
  };
  isLoading?: boolean;
  className?: string;
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  subtitle,
  icon,
  variant = 'emerald',
  trend,
  isLoading = false,
  className = '',
}) => {
  const variantStyles = {
    emerald: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-100',
    },
    blue: {
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      border: 'border-blue-100',
    },
    amber: {
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      border: 'border-amber-100',
    },
    rose: {
      bg: 'bg-rose-50',
      text: 'text-rose-700',
      border: 'border-rose-100',
    },
    slate: {
      bg: 'bg-slate-100',
      text: 'text-slate-700',
      border: 'border-slate-200',
    },
    indigo: {
      bg: 'bg-indigo-50',
      text: 'text-indigo-700',
      border: 'border-indigo-100',
    },
  };

  const style = variantStyles[variant];

  return (
    <Card className={`border-slate-200 hover:shadow-md transition-shadow ${className}`}>
      <CardBody className="p-5 flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
            {title}
          </p>
          {isLoading ? (
            <div className="h-8 w-24 bg-slate-100 animate-pulse rounded-md my-1" />
          ) : (
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">
              {value}
            </h3>
          )}

          {subtitle && (
            <p className="text-xs text-slate-500 font-medium">
              {subtitle}
            </p>
          )}

          {trend && !isLoading && (
            <div className="flex items-center space-x-1 pt-1">
              <span
                className={`inline-flex items-center text-xs font-bold px-1.5 py-0.5 rounded-md ${
                  trend.isPositive
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-rose-50 text-rose-700'
                }`}
              >
                {trend.isPositive ? (
                  <TrendingUp className="w-3 h-3 mr-0.5" />
                ) : (
                  <TrendingDown className="w-3 h-3 mr-0.5" />
                )}
                {trend.value}
              </span>
              {trend.label && (
                <span className="text-[11px] text-slate-400 font-medium">
                  {trend.label}
                </span>
              )}
            </div>
          )}
        </div>

        <div
          className={`p-3 rounded-2xl ${style.bg} ${style.text} border ${style.border} shrink-0`}
        >
          {icon}
        </div>
      </CardBody>
    </Card>
  );
};
