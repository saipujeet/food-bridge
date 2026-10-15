import { useState, useCallback } from 'react';
import type { DonationAcceptanceRecord, AcceptanceResponse } from '../types';
import { acceptanceService } from '../services/acceptanceService';

export function useAcceptance() {
  const [acceptanceRecord, setAcceptanceRecord] = useState<DonationAcceptanceRecord | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [conflictMessage, setConflictMessage] = useState<string | null>(null);

  const fetchAcceptanceRecord = useCallback(async (donationId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const record = await acceptanceService.getDonationAcceptance(donationId);
      setAcceptanceRecord(record);
      return record;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch acceptance record.';
      setError(msg);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const acceptDonation = useCallback(async (matchId: string, notes?: string): Promise<AcceptanceResponse | null> => {
    setIsLoading(true);
    setError(null);
    setConflictMessage(null);
    try {
      const res = await acceptanceService.acceptDonation(matchId, notes);
      if (res.acceptanceRecord) {
        setAcceptanceRecord(res.acceptanceRecord);
      }
      return res;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Acceptance failed.';
      if (msg.includes('CONFLICT') || msg.includes('accepted by another NGO')) {
        setConflictMessage(msg.replace('CONFLICT:', '').trim());
      } else {
        setError(msg);
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const rejectDonation = useCallback(async (matchId: string, reason?: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      await acceptanceService.rejectDonation(matchId, reason);
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Rejection failed.';
      setError(msg);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    acceptanceRecord,
    isLoading,
    error,
    conflictMessage,
    clearConflict: () => setConflictMessage(null),
    acceptDonation,
    rejectDonation,
    fetchAcceptanceRecord,
  };
}
