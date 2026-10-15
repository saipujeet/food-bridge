import React, { useState } from 'react';
import { useNGOProfile } from '../../hooks/useNGOProfile';
import { useToast } from '../../context/ToastContext';
import { AvailabilitySchedule } from '../../components/ngo/AvailabilitySchedule';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import type { DaySchedule } from '../../types';

export const Availability: React.FC = () => {
  const { profile, isLoading, updateAvailability } = useNGOProfile();
  const { showToast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (isMasterAvailable: boolean, schedule: DaySchedule[]) => {
    setIsSaving(true);
    try {
      await updateAvailability(isMasterAvailable, schedule);
      showToast('Availability Schedule Saved', 'Master status and 7-day operating hours updated.', 'success');
    } catch {
      showToast('Error', 'Unable to save availability settings.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !profile) {
    return (
      <div className="py-12">
        <LoadingSpinner size="lg" text="Loading operating schedule..." />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* HEADER */}
      <div className="space-y-1">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Availability & Operating Hours</h1>
        <p className="text-xs text-slate-600">
          Configure master receiving availability and set specific operating hours for each day of the week.
        </p>
      </div>

      {/* SCHEDULE FORM */}
      <AvailabilitySchedule
        initialMasterAvailable={profile.isCurrentlyAvailable}
        initialSchedule={profile.operatingSchedule}
        onSubmit={handleSubmit}
        isLoading={isSaving}
      />
    </div>
  );
};
