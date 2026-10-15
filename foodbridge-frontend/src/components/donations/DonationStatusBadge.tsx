import React from 'react';
import type { DonationStatus } from '../../types';
import { DONATION_STATUS_CONFIG } from '../../utils/donationStatus';
import {
  CheckCircle2,
  Clock,
  Building2,
  Truck,
  XCircle,
  AlertTriangle,
  Radio,
} from 'lucide-react';

interface DonationStatusBadgeProps {
  status: DonationStatus;
  size?: 'sm' | 'md';
}

export const DonationStatusBadge: React.FC<DonationStatusBadgeProps> = ({ status, size = 'sm' }) => {
  const config = DONATION_STATUS_CONFIG[status] || DONATION_STATUS_CONFIG.AVAILABLE;

  const renderStatusIcon = () => {
    switch (status) {
      case 'AVAILABLE':
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />;
      case 'MATCHING':
        return <Radio className="w-3.5 h-3.5 text-blue-600 shrink-0 animate-pulse" />;
      case 'ACCEPTED':
        return <Building2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />;
      case 'PICKUP_PENDING':
        return <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />;
      case 'PICKED_UP':
        return <Truck className="w-3.5 h-3.5 text-orange-600 shrink-0" />;
      case 'DELIVERED':
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />;
      case 'CANCELLED':
        return <XCircle className="w-3.5 h-3.5 text-slate-500 shrink-0" />;
      case 'EXPIRED':
        return <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />;
      default:
        return null;
    }
  };

  const sizeClasses = size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-xs font-bold';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-bold rounded-md border ${config.badgeBg} ${config.badgeText} ${config.badgeBorder} ${sizeClasses}`}
      title={config.description}
    >
      {renderStatusIcon()}
      <span>{config.label}</span>
    </span>
  );
};
