import React from 'react';
import { MapPin } from 'lucide-react';

interface DistanceBadgeProps {
  distanceKm: number;
  className?: string;
}

export const DistanceBadge: React.FC<DistanceBadgeProps> = ({ distanceKm, className = '' }) => {
  return (
    <span
      className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200 ${className}`}
    >
      <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
      <span>{distanceKm} km away</span>
    </span>
  );
};
