import React from 'react';
import { Loader2 } from 'lucide-react';

interface MapLoadingProps {
  message?: string;
  height?: string;
}

export const MapLoading: React.FC<MapLoadingProps> = ({
  message = 'Loading OpenStreetMap tiles & delivery route...',
  height = '420px',
}) => {
  return (
    <div
      style={{ height }}
      className="w-full rounded-2xl border border-slate-200 bg-slate-50 flex flex-col items-center justify-center p-6 text-center shadow-xs"
    >
      <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
      <h4 className="text-sm font-bold text-slate-800">Initializing Delivery Map</h4>
      <p className="text-xs text-slate-500 max-w-xs mt-1 font-medium">{message}</p>
    </div>
  );
};
