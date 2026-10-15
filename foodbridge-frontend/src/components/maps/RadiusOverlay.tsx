import React from 'react';

interface RadiusOverlayProps {
  currentRadiusKm: number;
  maxRadiusKm?: number;
}

export const RadiusOverlay: React.FC<RadiusOverlayProps> = ({ currentRadiusKm, maxRadiusKm = 20 }) => {
  const stages = [5, 10, 15, 20];

  return (
    <div className="p-3 bg-white/90 backdrop-blur-xs rounded-xl border border-slate-200 shadow-xs space-y-2 text-xs">
      <div className="flex items-center justify-between font-bold text-slate-800">
        <span>Dynamic Matching Search Radius</span>
        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black">
          {currentRadiusKm} KM ACTIVE
        </span>
      </div>

      {/* Visual Radius Progress Bar */}
      <div className="flex items-center space-x-1 pt-1">
        {stages.map((r) => {
          const isCurrent = r === currentRadiusKm;
          const isPassed = r <= currentRadiusKm;
          return (
            <div key={r} className="flex-1 space-y-1">
              <div
                className={`h-2 rounded-full transition-all ${
                  isCurrent
                    ? 'bg-emerald-600 ring-2 ring-emerald-300 animate-pulse'
                    : isPassed
                    ? 'bg-emerald-400'
                    : 'bg-slate-200'
                }`}
              />
              <p
                className={`text-[9px] text-center font-extrabold ${
                  isCurrent ? 'text-emerald-700' : isPassed ? 'text-slate-600' : 'text-slate-400'
                }`}
              >
                {r}km
              </p>
            </div>
          );
        })}
      </div>

      <p className="text-[10px] text-slate-500 italic">
        Module 5 Time-Aware Escalation automatically expands matching radius every 30 minutes up to {maxRadiusKm}km.
      </p>
    </div>
  );
};
