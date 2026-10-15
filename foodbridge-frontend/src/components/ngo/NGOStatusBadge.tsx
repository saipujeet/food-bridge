import React from 'react';
import type { NGOVerificationStatus } from '../../types';
import { ShieldCheck, Clock, AlertTriangle, XCircle, ShieldAlert } from 'lucide-react';

interface NGOStatusBadgeProps {
  status: NGOVerificationStatus;
  size?: 'sm' | 'md';
}

export const NGOStatusBadge: React.FC<NGOStatusBadgeProps> = ({ status, size = 'sm' }) => {
  const getConfig = () => {
    switch (status) {
      case 'VERIFIED':
        return {
          label: 'VERIFIED',
          icon: <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />,
          classes: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          title: 'Verified organization ready for matching.',
        };
      case 'PENDING':
        return {
          label: 'PENDING',
          icon: <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />,
          classes: 'bg-amber-50 text-amber-800 border-amber-200',
          title: 'Organization profile awaiting initial verification.',
        };
      case 'UNDER_REVIEW':
        return {
          label: 'UNDER REVIEW',
          icon: <AlertTriangle className="w-3.5 h-3.5 text-blue-600 shrink-0" />,
          classes: 'bg-blue-50 text-blue-800 border-blue-200',
          title: 'Documentation being reviewed by system administrator.',
        };
      case 'REJECTED':
        return {
          label: 'REJECTED',
          icon: <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />,
          classes: 'bg-rose-50 text-rose-800 border-rose-200',
          title: 'Verification requires attention.',
        };
      case 'SUSPENDED':
        return {
          label: 'SUSPENDED',
          icon: <ShieldAlert className="w-3.5 h-3.5 text-slate-600 shrink-0" />,
          classes: 'bg-slate-100 text-slate-700 border-slate-300',
          title: 'Organization matching suspended by administrator.',
        };
      default:
        return {
          label: status,
          icon: null,
          classes: 'bg-slate-100 text-slate-700 border-slate-200',
          title: '',
        };
    }
  };

  const config = getConfig();
  const sizeClasses = size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-xs font-extrabold';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-bold rounded-md border ${config.classes} ${sizeClasses}`}
      title={config.title}
    >
      {config.icon}
      <span>{config.label}</span>
    </span>
  );
};
