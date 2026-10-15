import React from 'react';
import type { MatchStatus } from '../../types';
import { Tag, CheckCircle2, XCircle, Clock, Ban } from 'lucide-react';

interface MatchStatusBadgeProps {
  status: MatchStatus;
  size?: 'sm' | 'md' | 'lg';
}

export const MatchStatusBadge: React.FC<MatchStatusBadgeProps> = ({ status, size = 'md' }) => {
  const getConfig = () => {
    switch (status) {
      case 'OFFERED':
        return {
          label: 'OFFERED',
          bg: 'bg-blue-50 text-blue-800 border-blue-200',
          icon: Tag,
        };
      case 'ACCEPTED':
        return {
          label: 'ACCEPTED',
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          icon: CheckCircle2,
        };
      case 'REJECTED':
        return {
          label: 'REJECTED',
          bg: 'bg-rose-50 text-rose-800 border-rose-200',
          icon: XCircle,
        };
      case 'EXPIRED':
        return {
          label: 'EXPIRED',
          bg: 'bg-amber-50 text-amber-800 border-amber-200',
          icon: Clock,
        };
      case 'CANCELLED':
        return {
          label: 'CANCELLED',
          bg: 'bg-slate-100 text-slate-700 border-slate-300',
          icon: Ban,
        };
      default:
        return {
          label: status,
          bg: 'bg-slate-100 text-slate-700 border-slate-200',
          icon: Tag,
        };
    }
  };

  const config = getConfig();
  const Icon = config.icon;

  const sizeClasses =
    size === 'sm'
      ? 'px-2 py-0.5 text-[10px] space-x-1'
      : size === 'lg'
      ? 'px-3 py-1.5 text-xs font-bold space-x-2'
      : 'px-2.5 py-1 text-xs space-x-1.5';

  return (
    <span
      className={`inline-flex items-center font-extrabold uppercase tracking-wider rounded-md border ${config.bg} ${sizeClasses}`}
    >
      <Icon className={size === 'sm' ? 'w-3 h-3 shrink-0' : 'w-3.5 h-3.5 shrink-0'} />
      <span>{config.label}</span>
    </span>
  );
};
