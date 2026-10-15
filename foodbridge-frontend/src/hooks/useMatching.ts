import { useState, useCallback, useEffect } from 'react';
import type { DonationMatch } from '../types';
import { matchingService } from '../services/matchingService';
import { INITIAL_MATCHING_RADIUS_KM } from '../utils/matchingEngine';

export function useMatching(donationId?: string, autoRun: boolean = false) {
  const [matches, setMatches] = useState<DonationMatch[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [radiusKm, setRadiusKm] = useState<number>(INITIAL_MATCHING_RADIUS_KM);

  const fetchMatches = useCallback(async () => {
    if (!donationId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await matchingService.getDonationMatches(donationId);
      setMatches(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch donation matches.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [donationId]);

  const runMatching = useCallback(
    async (customRadius?: number) => {
      if (!donationId) return;
      setIsLoading(true);
      setError(null);
      const searchRadius = customRadius !== undefined ? customRadius : radiusKm;
      try {
        const results = await matchingService.runMatching(donationId, searchRadius);
        setMatches(results);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Matching process failed.';
        setError(message);
      } finally {
        setIsLoading(false);
      }
    },
    [donationId, radiusKm]
  );

  useEffect(() => {
    if (donationId) {
      if (autoRun) {
        runMatching();
      } else {
        fetchMatches();
      }
    }
  }, [donationId, autoRun, runMatching, fetchMatches]);

  return {
    matches,
    isLoading,
    error,
    radiusKm,
    setRadiusKm,
    runMatching,
    refetchMatches: fetchMatches,
  };
}
