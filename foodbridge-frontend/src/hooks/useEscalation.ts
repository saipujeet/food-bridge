import { useState, useCallback, useEffect } from 'react';
import type { DonationMatchingState, MatchingHistoryRecord } from '../types';
import { escalationService } from '../services/escalationService';
import { donationService } from '../services/donationService';
import { calculateRemainingTimeMinutes } from '../utils/escalationEngine';

export function useEscalation(donationId?: string) {
  const [matchingState, setMatchingState] = useState<DonationMatchingState | null>(null);
  const [history, setHistory] = useState<MatchingHistoryRecord[]>([]);
  const [remainingMinutes, setRemainingMinutes] = useState<number>(0);
  const [availableUntil, setAvailableUntil] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isExpanding, setIsExpanding] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStateAndHistory = useCallback(async () => {
    if (!donationId) return;
    setIsLoading(true);
    setError(null);
    try {
      const [stateData, histData, donationData] = await Promise.all([
        escalationService.getMatchingState(donationId),
        escalationService.getMatchingHistory(donationId),
        donationService.getDonationById(donationId),
      ]);

      setMatchingState(stateData);
      setHistory(histData);

      if (donationData) {
        setAvailableUntil(donationData.availableUntil);
        setRemainingMinutes(calculateRemainingTimeMinutes(donationData.availableUntil));
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unable to retrieve matching escalation state.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [donationId]);

  const expandRadius = useCallback(async () => {
    if (!donationId) return;
    setIsExpanding(true);
    setError(null);
    try {
      const updatedState = await escalationService.expandMatchingRadius(donationId);
      setMatchingState(updatedState);
      const updatedHist = await escalationService.getMatchingHistory(donationId);
      setHistory(updatedHist);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to expand matching search radius.';
      setError(message);
    } finally {
      setIsExpanding(false);
    }
  }, [donationId]);

  const startMatching = useCallback(async () => {
    if (!donationId) return;
    setIsLoading(true);
    setError(null);
    try {
      const newState = await escalationService.startMatchingState(donationId);
      setMatchingState(newState);
      const histData = await escalationService.getMatchingHistory(donationId);
      setHistory(histData);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to initialize matching state.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [donationId]);

  useEffect(() => {
    fetchStateAndHistory();
  }, [fetchStateAndHistory]);

  // Live timer tick for remaining minutes display
  useEffect(() => {
    if (!availableUntil) return;
    const interval = setInterval(() => {
      setRemainingMinutes(calculateRemainingTimeMinutes(availableUntil));
    }, 30000); // refresh every 30 seconds
    return () => clearInterval(interval);
  }, [availableUntil]);

  return {
    matchingState,
    history,
    remainingMinutes,
    isLoading,
    isExpanding,
    error,
    expandRadius,
    startMatching,
    refetchState: fetchStateAndHistory,
  };
}
