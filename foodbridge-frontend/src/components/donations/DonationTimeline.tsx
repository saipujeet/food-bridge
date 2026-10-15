import React from 'react';
import type { FoodDonation } from '../../types';
import { getTimelineStages } from '../../utils/donationStatus';
import { CheckCircle2, Circle, Clock } from 'lucide-react';

interface DonationTimelineProps {
  donation: FoodDonation;
}

export const DonationTimeline: React.FC<DonationTimelineProps> = ({ donation }) => {
  const stages = getTimelineStages(donation);

  return (
    <div className="space-y-4">
      <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-2">
        Donation Status Timeline
      </h4>

      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
        {stages.map((stage, idx) => {
          const isCompleted = stage.status === 'completed';
          const isCurrent = stage.status === 'current';

          return (
            <div key={stage.id || idx} className="relative flex items-start space-x-3 group">
              {/* Timeline Indicator Icon */}
              <div
                className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center ring-4 ring-white ${
                  isCompleted
                    ? 'bg-emerald-600 text-white'
                    : isCurrent
                    ? 'bg-amber-500 text-white animate-pulse'
                    : 'bg-slate-100 text-slate-400 border border-slate-300'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : isCurrent ? (
                  <Clock className="w-3.5 h-3.5" />
                ) : (
                  <Circle className="w-2.5 h-2.5 fill-slate-300" />
                )}
              </div>

              {/* Stage Info */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <h5
                    className={`text-xs font-bold ${
                      isCompleted || isCurrent ? 'text-slate-900' : 'text-slate-400'
                    }`}
                  >
                    {stage.name}
                  </h5>
                  {stage.timestamp && (
                    <span className="text-[10px] font-mono text-slate-400">
                      {new Date(stage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>
                <p className={`text-[11px] mt-0.5 ${isCompleted || isCurrent ? 'text-slate-600' : 'text-slate-400'}`}>
                  {stage.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
