import { useState, useEffect, useCallback, useMemo } from 'react';
import type { NGOProfileData, FoodCategory, FoodType, CapacityUnit, DaySchedule } from '../types';
import { ngoService } from '../services/ngoService';
import { calculateAvailableCapacity } from '../utils/capacityUtils';

export const useNGOProfile = () => {
  const [profile, setProfile] = useState<NGOProfileData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await ngoService.getNGOProfile();
      setProfile(data);
    } catch (err: unknown) {
      setError((err as Error).message || 'Unable to load your NGO profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const availableCapacity = useMemo(() => {
    if (!profile) return 0;
    return calculateAvailableCapacity(profile.maxCapacity, profile.currentCapacity);
  }, [profile]);

  // Check if mandatory matching details are configured
  const profileCompletion = useMemo(() => {
    if (!profile) return { isComplete: false, missingFields: [] };

    const missingFields: string[] = [];
    if (!profile.address || !profile.city) missingFields.push('Location');
    if (!profile.acceptedCategories || profile.acceptedCategories.length === 0) missingFields.push('Food preferences');
    if (!profile.maxCapacity || profile.maxCapacity <= 0) missingFields.push('Capacity');
    if (!profile.operatingSchedule || profile.operatingSchedule.length === 0) missingFields.push('Availability');

    return {
      isComplete: missingFields.length === 0,
      missingFields,
    };
  }, [profile]);

  const updateProfile = async (partial: Partial<NGOProfileData>) => {
    const updated = await ngoService.updateNGOProfile(partial);
    setProfile(updated);
    return updated;
  };

  const updatePreferences = async (acceptedCategories: FoodCategory[], acceptedFoodTypes: FoodType[]) => {
    const updated = await ngoService.updateFoodPreferences({ acceptedCategories, acceptedFoodTypes });
    setProfile(updated);
    return updated;
  };

  const updateCapacity = async (maxCapacity: number, currentCapacity: number, capacityUnit: CapacityUnit) => {
    const updated = await ngoService.updateCapacity({ maxCapacity, currentCapacity, capacityUnit });
    setProfile(updated);
    return updated;
  };

  const updateAvailability = async (isCurrentlyAvailable: boolean, operatingSchedule: DaySchedule[]) => {
    const updated = await ngoService.updateAvailability({ isCurrentlyAvailable, operatingSchedule });
    setProfile(updated);
    return updated;
  };

  const updateLocation = async (address: string, city: string, latitude: number, longitude: number) => {
    const updated = await ngoService.updateLocation({ address, city, latitude, longitude });
    setProfile(updated);
    return updated;
  };

  return {
    profile,
    isLoading,
    error,
    availableCapacity,
    profileCompletion,
    fetchProfile,
    updateProfile,
    updatePreferences,
    updateCapacity,
    updateAvailability,
    updateLocation,
  };
};
