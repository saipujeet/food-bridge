import React, { useState } from 'react';
import { useNGOProfile } from '../../hooks/useNGOProfile';
import { useToast } from '../../context/ToastContext';
import { FoodPreferenceSelector } from '../../components/ngo/FoodPreferenceSelector';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import type { FoodCategory, FoodType } from '../../types';

export const FoodPreferences: React.FC = () => {
  const { profile, isLoading, updatePreferences } = useNGOProfile();
  const { showToast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (categories: FoodCategory[], types: FoodType[]) => {
    setIsSaving(true);
    try {
      await updatePreferences(categories, types);
      showToast('Preferences Saved', 'Food categories and dietary preferences updated.', 'success');
    } catch {
      showToast('Error', 'Unable to save preferences.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-12">
        <LoadingSpinner size="lg" text="Loading food preferences..." />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* HEADER */}
      <div className="space-y-1">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Food Preferences</h1>
        <p className="text-xs text-slate-600">
          Tell FoodBridge what types of surplus food your organization can receive.
        </p>
      </div>

      {/* SELECTOR COMPONENT */}
      <FoodPreferenceSelector
        initialCategories={profile?.acceptedCategories || []}
        initialFoodTypes={profile?.acceptedFoodTypes || []}
        onSubmit={handleSubmit}
        isLoading={isSaving}
      />
    </div>
  );
};
