import { useState, useEffect, useMemo, useCallback } from 'react';
import type { FoodDonation, DonationStatus, FoodCategory } from '../types';
import { donationService } from '../services/donationService';

export interface DonationFiltersState {
  search: string;
  status: DonationStatus | 'ALL';
  category: FoodCategory | 'ALL';
  sortBy: 'newest' | 'oldest' | 'expiry';
}

export const useDonations = () => {
  const [donations, setDonations] = useState<FoodDonation[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<DonationFiltersState>({
    search: '',
    status: 'ALL',
    category: 'ALL',
    sortBy: 'newest',
  });

  const fetchDonations = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await donationService.getDonorDonations();
      setDonations(data);
    } catch (err: unknown) {
      setError((err as Error).message || "We couldn't load your donations. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDonations();
  }, [fetchDonations]);

  // Client-side filtering & sorting
  const filteredDonations = useMemo(() => {
    return donations
      .filter((d) => {
        // Search query matching food name, category, or ID
        if (filters.search) {
          const q = filters.search.toLowerCase();
          const matchName = d.foodName?.toLowerCase().includes(q);
          const matchCategory = d.foodCategory?.toLowerCase().includes(q);
          const matchId = d.id.toLowerCase().includes(q);
          if (!matchName && !matchCategory && !matchId) return false;
        }

        // Status Filter
        if (filters.status !== 'ALL' && d.status !== filters.status) {
          return false;
        }

        // Category Filter
        if (filters.category !== 'ALL' && d.foodCategory !== filters.category) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (filters.sortBy === 'newest') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        if (filters.sortBy === 'oldest') {
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        }
        if (filters.sortBy === 'expiry') {
          return new Date(a.availableUntil).getTime() - new Date(b.availableUntil).getTime();
        }
        return 0;
      });
  }, [donations, filters]);

  const createDonation = async (data: Partial<FoodDonation>) => {
    const created = await donationService.createDonation(data);
    setDonations((prev) => [created, ...prev]);
    return created;
  };

  const updateDonation = async (id: string, data: Partial<FoodDonation>) => {
    const updated = await donationService.updateDonation(id, data);
    setDonations((prev) => prev.map((d) => (d.id === id ? updated : d)));
    return updated;
  };

  const cancelDonation = async (id: string) => {
    const cancelled = await donationService.cancelDonation(id);
    setDonations((prev) => prev.map((d) => (d.id === id ? cancelled : d)));
    return cancelled;
  };

  return {
    donations,
    filteredDonations,
    isLoading,
    error,
    filters,
    setFilters,
    fetchDonations,
    createDonation,
    updateDonation,
    cancelDonation,
  };
};
