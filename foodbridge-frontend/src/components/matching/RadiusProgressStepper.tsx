import React from 'react';
import type { MatchingStateStatus } from '../../types';
import { CONFIGURABLE_RADIUS_STAGES } from '../../utils/escalationEngine';
import { Check, MapPin, Clock, Lock, AlertTriangle } from 'lucide-react';

interface RadiusProgressStepperProps {
  currentRadiusKm: number;
  status: MatchingStateStatus;
  remainingMinutes: number;
  nextExpansionAt?: string | null;
}

export const RadiusProgressStepper: React.FC<RadiusProgressStepperProps> = ({
  currentRadiusKm,
  status,
  remainingMinutes,
  nextExpansionAt,
}) => {
  const formatRemainingTime = (mins: number) => {
    if (mins <= 0) return 'Expired';
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h > 0) return `${h}h ${m}m remaining`;
    return `${m}m remaining`;
  };

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
      {/* HEADER: Current Radius Badge & Time Countdown */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="space-y-0.5">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
            Time-Aware Radius Expansion (Module 5)
          </span>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-black text-slate-900">
              Active Radius: <span className="text-blue-700">{currentRadiusKm} KM</span>
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-blue-100 text-blue-900 border border-blue-200">
              {status}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs font-bold text-amber-900 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
          <Clock className="w-4 h-4 text-amber-700 shrink-0" />
          <span>{formatRemainingTime(remainingMinutes)}</span>
        </div>
      </div>

      {/* STEPPER VISUALIZATION BAR */}
      <div className="py-2">
        <div className="relative flex items-center justify-between max-w-xl mx-auto">
          {/* Connecting Track Line */}
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-200 -translate-y-1/2 z-0" />

          {CONFIGURABLE_RADIUS_STAGES.map((radius) => {
            const isCompleted = currentRadiusKm > radius || status === 'ACCEPTED';
            const isCurrent = currentRadiusKm === radius && status !== 'ACCEPTED';

            return (
              <div key={radius} className="relative z-10 flex flex-col items-center group">
                {/* Node Circle */}
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all border-2 ${
                    isCompleted
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : isCurrent
                      ? 'bg-blue-600 text-white border-blue-700 ring-4 ring-blue-100 shadow-md'
                      : 'bg-white text-slate-400 border-slate-300'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4" />
                  ) : isCurrent ? (
                    <MapPin className="w-4 h-4 animate-bounce" />
                  ) : (
                    <Lock className="w-3.5 h-3.5 text-slate-300" />
                  )}
                </div>

                {/* Node Label */}
                <span
                  className={`mt-2 text-xs font-extrabold tracking-tight ${
                    isCurrent
                      ? 'text-blue-900 font-black'
                      : isCompleted
                      ? 'text-emerald-900'
                      : 'text-slate-400'
                  }`}
                >
                  {radius} km
                </span>

                <span className="text-[10px] text-slate-500 font-semibold">
                  {isCompleted ? 'Completed' : isCurrent ? 'Active' : 'Upcoming'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* FOOTER NOTICE / NEXT EXPANSION BANNER */}
      {status === 'MAX_RADIUS_REACHED' ? (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center space-x-2 font-medium">
          <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
          <span>Maximum search radius (20 km) has been reached. System continues to monitor active matches.</span>
        </div>
      ) : nextExpansionAt && status === 'ACTIVE' ? (
        <p className="text-[11px] text-slate-500 text-center italic font-medium pt-1">
          Automated escalation scheduler will expand search radius if donation remains uncollected.
        </p>
      ) : null}
    </div>
  );
};
