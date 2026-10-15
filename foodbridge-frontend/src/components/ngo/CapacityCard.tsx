import React from 'react';
import type { CapacityUnit } from '../../types';
import { calculateAvailableCapacity } from '../../utils/capacityUtils';
import { Card, CardBody } from '../common/Card';
import { Scale } from 'lucide-react';

interface CapacityCardProps {
  maxCapacity: number;
  currentCapacity: number;
  capacityUnit: CapacityUnit;
}

export const CapacityCard: React.FC<CapacityCardProps> = ({
  maxCapacity,
  currentCapacity,
  capacityUnit,
}) => {
  const available = calculateAvailableCapacity(maxCapacity, currentCapacity);
  const fillPercentage = maxCapacity > 0 ? Math.min(100, Math.round((currentCapacity / maxCapacity) * 100)) : 0;

  return (
    <Card className="border-slate-200 shadow-xs">
      <CardBody className="p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">Food Receiving Capacity</h3>
              <p className="text-[11px] text-slate-500">Unit: {capacityUnit}</p>
            </div>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded-md border border-emerald-200">
            {fillPercentage}% Utilized
          </span>
        </div>

        {/* 3 Metric Columns */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
              Maximum
            </span>
            <span className="text-lg sm:text-xl font-black text-slate-900 mt-0.5 block">
              {maxCapacity} <span className="text-xs font-normal text-slate-500">{capacityUnit}</span>
            </span>
          </div>

          <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block">
              Current
            </span>
            <span className="text-lg sm:text-xl font-black text-amber-900 mt-0.5 block">
              {currentCapacity} <span className="text-xs font-normal text-amber-700">{capacityUnit}</span>
            </span>
          </div>

          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
              Available
            </span>
            <span className="text-lg sm:text-xl font-black text-emerald-900 mt-0.5 block">
              {available} <span className="text-xs font-normal text-emerald-700">{capacityUnit}</span>
            </span>
          </div>
        </div>

        {/* Visual Gauge Bar */}
        <div className="space-y-1 pt-1">
          <div className="flex justify-between text-[11px] font-semibold text-slate-600">
            <span>Capacity Fill Status</span>
            <span>{available} {capacityUnit} available for matching</span>
          </div>
          <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden flex">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                fillPercentage >= 90
                  ? 'bg-rose-600'
                  : fillPercentage >= 70
                  ? 'bg-amber-500'
                  : 'bg-emerald-600'
              }`}
              style={{ width: `${fillPercentage}%` }}
            />
          </div>
        </div>
      </CardBody>
    </Card>
  );
};
