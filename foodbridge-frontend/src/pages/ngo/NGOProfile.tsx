import React from 'react';
import { useNGOProfile } from '../../hooks/useNGOProfile';
import { NGOProfileCard } from '../../components/ngo/NGOProfileCard';
import { VerificationStatusCard } from '../../components/ngo/VerificationStatusCard';
import { CapacityCard } from '../../components/ngo/CapacityCard';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const NGOProfile: React.FC = () => {
  const { profile, isLoading, error } = useNGOProfile();

  if (isLoading) {
    return (
      <div className="py-12">
        <LoadingSpinner size="lg" text="Loading NGO profile details..." />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs font-bold text-center">
        {error || 'Unable to load your NGO profile. Please try again.'}
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* HEADER */}
      <div className="space-y-1">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">NGO Profile</h1>
        <p className="text-xs text-slate-600">
          Official organization credentials, contact information, and verification status.
        </p>
      </div>

      {/* NGO PROFILE CARD */}
      <NGOProfileCard profile={profile} />

      {/* VERIFICATION & CAPACITY SUMMARY GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6">
          <VerificationStatusCard status={profile.verificationStatus} notes={profile.verificationNotes} />
        </div>
        <div className="lg:col-span-6">
          <CapacityCard
            maxCapacity={profile.maxCapacity}
            currentCapacity={profile.currentCapacity}
            capacityUnit={profile.capacityUnit}
          />
        </div>
      </div>
    </div>
  );
};
