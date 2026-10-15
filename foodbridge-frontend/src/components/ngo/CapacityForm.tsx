import React, { useState } from 'react';
import type { CapacityUnit } from '../../types';
import { calculateAvailableCapacity, validateCapacityInput } from '../../utils/capacityUtils';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Button } from '../common/Button';
import { Scale, Save, AlertCircle, Info } from 'lucide-react';

interface CapacityFormProps {
  initialMax: number;
  initialCurrent: number;
  initialUnit: CapacityUnit;
  onSubmit: (max: number, current: number, unit: CapacityUnit) => Promise<void>;
  isLoading?: boolean;
}

export const CapacityForm: React.FC<CapacityFormProps> = ({
  initialMax,
  initialCurrent,
  initialUnit,
  onSubmit,
  isLoading = false,
}) => {
  const [maxCapacity, setMaxCapacity] = useState(String(initialMax));
  const [currentCapacity, setCurrentCapacity] = useState(String(initialCurrent));
  const [capacityUnit, setCapacityUnit] = useState<CapacityUnit>(initialUnit);
  const [error, setError] = useState<string | null>(null);

  const available = calculateAvailableCapacity(Number(maxCapacity) || 0, Number(currentCapacity) || 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const maxNum = Number(maxCapacity);
    const currNum = Number(currentCapacity);

    const valResult = validateCapacityInput(maxNum, currNum);
    if (!valResult.isValid && valResult.error) {
      setError(valResult.error);
      return;
    }

    await onSubmit(maxNum, currNum, capacityUnit);
  };

  const unitOptions = [
    { value: 'meals', label: 'Meals / Servings' },
    { value: 'kg', label: 'Kilograms (kg)' },
    { value: 'litres', label: 'Litres' },
    { value: 'boxes', label: 'Boxes' },
    { value: 'packets', label: 'Packets' },
  ];

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6" noValidate>
      <div className="flex items-center space-x-2 text-xs font-extrabold uppercase tracking-wider text-slate-900 pb-3 border-b border-slate-200">
        <Scale className="w-4 h-4 text-emerald-700" />
        <span>Manage Organization Food Receiving Capacity</span>
      </div>

      {error && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-900 text-xs rounded-xl font-bold flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Input
          label="Maximum Capacity"
          type="number"
          min="0"
          value={maxCapacity}
          onChange={(e) => setMaxCapacity(e.target.value)}
          leftIcon={<Scale className="w-4 h-4 text-slate-500" />}
          helperText="Max food your center can accept"
          required
        />

        <Input
          label="Current Capacity"
          type="number"
          min="0"
          value={currentCapacity}
          onChange={(e) => setCurrentCapacity(e.target.value)}
          leftIcon={<Scale className="w-4 h-4 text-slate-500" />}
          helperText="Food currently stored/committed"
          required
        />

        <Select
          label="Capacity Unit"
          value={capacityUnit}
          onChange={(e) => setCapacityUnit(e.target.value as CapacityUnit)}
          options={unitOptions}
          required
        />
      </div>

      {/* Real-time Calculated Available Capacity Display */}
      <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between text-xs text-emerald-900">
        <div className="flex items-center space-x-2">
          <Info className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>Calculated Available Capacity for Matching:</span>
        </div>
        <span className="font-extrabold text-sm text-emerald-900">
          {available} {capacityUnit}
        </span>
      </div>

      <div className="pt-2 flex justify-end">
        <Button
          type="submit"
          variant="primary"
          isLoading={isLoading}
          leftIcon={<Save className="w-4 h-4" />}
          className="px-8 py-2.5 font-extrabold shadow-md bg-emerald-700 hover:bg-emerald-800 text-white"
        >
          Save Capacity Settings
        </Button>
      </div>
    </form>
  );
};
