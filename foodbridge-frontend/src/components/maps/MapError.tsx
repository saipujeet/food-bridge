import React from 'react';
import { AlertTriangle } from 'lucide-react';
import type { DeliveryMapData } from '../../types';

interface MapErrorProps {
  mapData?: DeliveryMapData;
  errorMsg?: string;
  onRetry?: () => void;
}

export const MapError: React.FC<MapErrorProps> = ({
  mapData,
  errorMsg = 'Map tile rendering is temporarily unavailable.',
  onRetry,
}) => {
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5 space-y-4 shadow-xs">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start space-x-3">
          <div className="p-2 rounded-xl bg-amber-100 text-amber-700 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-black text-amber-950">Map Unavailable</h4>
            <p className="text-xs text-amber-800 mt-0.5">{errorMsg}</p>
          </div>
        </div>

        {onRetry && (
          <button
            onClick={onRetry}
            className="px-3 py-1.5 rounded-xl bg-white border border-amber-300 text-amber-900 text-xs font-extrabold hover:bg-amber-100 transition-colors shrink-0"
          >
            Retry Map
          </button>
        )}
      </div>

      {/* Structured Fallback Breakdown showing essential logistics despite tile error */}
      {mapData && (
        <div className="bg-white rounded-xl p-4 border border-amber-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div>
            <span className="block text-[10px] font-black uppercase text-slate-400">Pickup Address</span>
            <span className="font-bold text-slate-800 line-clamp-2">{mapData.pickup.address || 'Donor Location'}</span>
          </div>

          <div>
            <span className="block text-[10px] font-black uppercase text-slate-400">NGO Destination</span>
            <span className="font-bold text-slate-800 line-clamp-2">{mapData.destination.address || 'NGO Shelter'}</span>
          </div>

          <div>
            <span className="block text-[10px] font-black uppercase text-slate-400">Volunteer Status</span>
            <span className="font-bold text-slate-800">{mapData.volunteerName ? `${mapData.volunteerName} (Active)` : 'Pending Assignment'}</span>
          </div>

          <div>
            <span className="block text-[10px] font-black uppercase text-slate-400">Delivery Status</span>
            <span className="font-extrabold text-emerald-700 uppercase">{mapData.status.replace(/_/g, ' ')}</span>
          </div>
        </div>
      )}
    </div>
  );
};
