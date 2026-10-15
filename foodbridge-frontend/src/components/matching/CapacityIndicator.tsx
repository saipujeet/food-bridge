import React from 'react';
import type { CapacityUnit } from '../../types';
import { Scale, Check } from 'lucide-react';

interface CapacityIndicatorProps {
  requiredQuantity: number;
  availableCapacity: number;
  capacityUnit: CapacityUnit;
}

export const CapacityIndicator: React.FC<CapacityIndicatorProps> = ({
  requiredQuantity,
  availableCapacity,
  capacityUnit,
}) => {
  const isSufficient = availableCapacity >= requiredQuantity;

  return (
    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-1.5 text-slate-700 font-bold">
          <Scale className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span>Capacity Check</span>
        </div>
        {isSufficient && (
          <span className="flex items-center space-x-1 text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            <Check className="w-3 h-3" />
            <span>Capacity Met</span>
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 text-[11px] font-medium pt-1">
        <div>
          <span className="text-slate-400 block text-[10px] uppercase font-bold">Donation Req.</span>
          <span className="font-extrabold text-slate-900">{requiredQuantity} {capacityUnit}</span>
        </div>
        <div>
          <span className="text-slate-400 block text-[10px] uppercase font-bold">NGO Available</span>
          <span className="font-extrabold text-emerald-800">{availableCapacity} {capacityUnit}</span>
        </div>
      </div>
    </div>
  );
};
