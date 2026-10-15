import React, { useState } from 'react';
import { useNGOProfile } from '../../hooks/useNGOProfile';
import { useToast } from '../../context/ToastContext';
import { CapacityCard } from '../../components/ngo/CapacityCard';
import { CapacityForm } from '../../components/ngo/CapacityForm';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import type { CapacityUnit } from '../../types';

export const CapacityManagement: React.FC = () => {
  const { profile, isLoading, updateCapacity } = useNGOProfile();
  const { showToast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (max: number, current: number, unit: CapacityUnit) => {
    setIsSaving(true);
    try {
      await updateCapacity(max, current, unit);
      showToast('Capacity Settings Saved', 'Maximum and current receiving capacities updated.', 'success');
    } catch {
      showToast('Error', 'Unable to save capacity settings.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !profile) {
    return (
      <div className="py-12">
        <LoadingSpinner size="lg" text="Loading capacity information..." />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* HEADER */}
      <div className="space-y-1">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Food Receiving Capacity</h1>
        <p className="text-xs text-slate-600">
          Manage maximum and current storage capacity for matching engine calculations.
        </p>
      </div>

      {/* CAPACITY VISUAL GAUGE CARD */}
      <CapacityCard
        maxCapacity={profile.maxCapacity}
        currentCapacity={profile.currentCapacity}
        capacityUnit={profile.capacityUnit}
      />

      {/* CAPACITY EDIT FORM */}
      <CapacityForm
        initialMax={profile.maxCapacity}
        initialCurrent={profile.currentCapacity}
        initialUnit={profile.capacityUnit}
        onSubmit={handleSubmit}
        isLoading={isSaving}
      />
    </div>
  );
};
