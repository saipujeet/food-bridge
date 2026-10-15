import { useState, useEffect, useCallback } from 'react';
import type { VolunteerProfile, UpdateVolunteerProfileRequest, VolunteerAvailability } from '../types';
import { volunteerService } from '../services/volunteerService';

export const useVolunteer = () => {
  const [profile, setProfile] = useState<VolunteerProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await volunteerService.getVolunteerProfile();
      setProfile(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load volunteer profile';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateProfile = async (data: UpdateVolunteerProfileRequest): Promise<VolunteerProfile | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const updated = await volunteerService.updateVolunteerProfile(data);
      setProfile(updated);
      return updated;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update volunteer profile';
      setError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateAvailability = async (availabilityStatus: VolunteerAvailability): Promise<VolunteerProfile | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const updated = await volunteerService.updateAvailability(availabilityStatus);
      setProfile(updated);
      return updated;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update availability status';
      setError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    profile,
    isLoading,
    error,
    fetchProfile,
    updateProfile,
    updateAvailability,
  };
};
