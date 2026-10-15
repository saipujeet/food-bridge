import React from 'react';
import { MapPinOff } from 'lucide-react';

interface MapEmptyStateProps {
  title?: string;
  description?: string;
  height?: string;
}

export const MapEmptyState: React.FC<MapEmptyStateProps> = ({
  title = 'No Geographic Data Available',
  description = 'Location coordinates for donor pickup or NGO destination have not been established yet.',
  height = '360px',
}) => {
  return (
    <div
      style={{ height }}
      className="w-full rounded-2xl border border-dashed border-slate-300 bg-slate-50 flex flex-col items-center justify-center p-6 text-center"
    >
      <div className="w-12 h-12 rounded-2xl bg-slate-200 text-slate-500 flex items-center justify-center mb-3">
        <MapPinOff className="w-6 h-6" />
      </div>
      <h4 className="text-sm font-bold text-slate-700">{title}</h4>
      <p className="text-xs text-slate-500 max-w-sm mt-1">{description}</p>
    </div>
  );
};
