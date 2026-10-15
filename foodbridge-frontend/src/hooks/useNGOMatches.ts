import { useState, useCallback, useEffect } from 'react';
import type { DonationMatch, MatchStatus } from '../types';
import { matchingService } from '../services/matchingService';

export function useNGOMatches() {
  const [matches, setMatches] = useState<DonationMatch[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<MatchStatus | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const fetchNGOMatches = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await matchingService.getNGOMatches();
      setMatches(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unable to retrieve matched donations.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNGOMatches();
  }, [fetchNGOMatches]);

  // Filtered list
  const filteredMatches = matches.filter((match) => {
    const matchesStatus = statusFilter === 'ALL' || match.matchStatus === statusFilter;
    const matchesSearch =
      searchQuery.trim() === '' ||
      match.foodName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      match.foodCategory.toLowerCase().includes(searchQuery.toLowerCase()) ||
      match.donorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      match.pickupAddress.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  return {
    matches: filteredMatches,
    allMatchesCount: matches.length,
    isLoading,
    error,
    statusFilter,
    setStatusFilter,
    searchQuery,
    setSearchQuery,
    refetchMatches: fetchNGOMatches,
  };
}
