import React, { useState, useEffect } from 'react';
import { useVolunteer } from '../../hooks/useVolunteer';
import type { VehicleType } from '../../types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const VolunteerProfile: React.FC = () => {
  const { profile, isLoading, error, updateProfile } = useVolunteer();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [vehicleType, setVehicleType] = useState<VehicleType>('SCOOTER');
  const [serviceArea, setServiceArea] = useState('');
  const [profileImageUrl, setProfileImageUrl] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.fullName || '');
      setPhone(profile.phone || '');
      setVehicleType(profile.vehicleType || 'SCOOTER');
      setServiceArea(profile.serviceArea || '');
      setProfileImageUrl(profile.profileImageUrl || '');
    }
  }, [profile]);

  if (isLoading && !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner text="Loading profile..." />
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile({
        fullName,
        phone,
        vehicleType,
        serviceArea,
        profileImageUrl,
      });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch {
      /* handled in hook */
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md p-6 sm:p-8 border border-gray-200">
        <div className="flex items-center space-x-3 pb-6 border-b border-gray-100">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-xl font-bold">
            👤
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Volunteer Operational Profile</h1>
            <p className="text-xs text-gray-500">Manage vehicle details, service zone, and verification status</p>
          </div>
        </div>

        {error && (
          <div className="my-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">{error}</div>
        )}

        {isSaved && (
          <div className="my-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg font-bold">
            ✅ Volunteer profile updated successfully!
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Contact Phone</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Vehicle Type</label>
              <select
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value as VehicleType)}
                className="w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="WALK">WALK (On Foot)</option>
                <option value="BIKE">BIKE (Bicycle)</option>
                <option value="SCOOTER">SCOOTER (Motorbike / Scooter)</option>
                <option value="CAR">CAR (Hatchback / Sedan)</option>
                <option value="VAN">VAN (Cargo / Transport Van)</option>
                <option value="OTHER">OTHER</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Service Area / City District</label>
              <input
                type="text"
                value={serviceArea}
                onChange={(e) => setServiceArea(e.target.value)}
                required
                placeholder="e.g. Ongole Central"
                className="w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Profile Photo URL</label>
            <input
              type="url"
              value={profileImageUrl}
              onChange={(e) => setProfileImageUrl(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 flex justify-between items-center text-xs">
            <div>
              <span className="font-semibold text-gray-700">Verification Status:</span>
              <span className="ml-2 font-bold text-emerald-700 uppercase bg-emerald-100 px-2 py-0.5 rounded">
                {profile?.verificationStatus}
              </span>
            </div>
            <div>
              <span className="font-semibold text-gray-700">Current Availability:</span>
              <span className="ml-2 font-bold text-blue-700 uppercase bg-blue-100 px-2 py-0.5 rounded">
                {profile?.availabilityStatus}
              </span>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 shadow-md transition-all text-sm"
            >
              {isLoading ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
