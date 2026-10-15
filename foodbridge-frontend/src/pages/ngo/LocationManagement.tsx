import React, { useState } from 'react';
import { useNGOProfile } from '../../hooks/useNGOProfile';
import { useToast } from '../../context/ToastContext';
import { LocationForm } from '../../components/ngo/LocationForm';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const LocationManagement: React.FC = () => {
  const { profile, isLoading, updateLocation } = useNGOProfile();
  const { showToast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (address: string, city: string, lat: number, lng: number) => {
    setIsSaving(true);
    try {
      await updateLocation(address, city, lat, lng);
      showToast('Location Saved', 'NGO address and GPS coordinates updated for matching engine.', 'success');
    } catch {
      showToast('Error', 'Unable to save location settings.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !profile) {
    return (
      <div className="py-12">
        <LoadingSpinner size="lg" text="Loading location settings..." />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* HEADER */}
      <div className="space-y-1">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">NGO Location</h1>
        <p className="text-xs text-slate-600">
          Your location helps FoodBridge identify nearby donation opportunities.
        </p>
      </div>

      {/* LOCATION FORM */}
      <LocationForm
        initialAddress={profile.address}
        initialCity={profile.city}
        initialLat={profile.latitude}
        initialLng={profile.longitude}
        onSubmit={handleSubmit}
        isLoading={isSaving}
      />
    </div>
  );
};
