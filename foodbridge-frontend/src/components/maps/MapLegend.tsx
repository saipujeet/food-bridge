import React from 'react';

export const MapLegend: React.FC = () => {
  return (
    <div className="bg-white/95 backdrop-blur-md border border-slate-200/80 rounded-xl p-3 shadow-md text-xs space-y-1.5 min-w-[160px]">
      <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1 border-b border-slate-100 pb-1">
        Map Legend
      </div>

      <div className="flex items-center space-x-2 text-slate-700 font-medium">
        <span className="w-3 h-3 rounded-full bg-emerald-600 ring-2 ring-emerald-200 shrink-0"></span>
        <span className="truncate">Donor Pickup</span>
      </div>

      <div className="flex items-center space-x-2 text-slate-700 font-medium">
        <span className="w-3 h-3 rounded-full bg-amber-500 ring-2 ring-amber-200 shrink-0"></span>
        <span className="truncate">Volunteer</span>
      </div>

      <div className="flex items-center space-x-2 text-slate-700 font-medium">
        <span className="w-3 h-3 rounded-full bg-blue-600 ring-2 ring-blue-200 shrink-0"></span>
        <span className="truncate">NGO Destination</span>
      </div>

      <div className="flex items-center space-x-2 text-slate-700 font-medium pt-1 border-t border-slate-100">
        <span className="w-5 h-1 rounded-full bg-red-600 shrink-0"></span>
        <span className="truncate">Delivery Route</span>
      </div>
    </div>
  );
};
