import api from './api';
import type { DonationMatch, ApiResponse, NGOProfileData, FoodDonation } from '../types';
import { runMatchingEngine, INITIAL_MATCHING_RADIUS_KM } from '../utils/matchingEngine';
import { donationService } from './donationService';
import { ngoService } from './ngoService';

const MATCHES_STORAGE_KEY = 'foodbridge_mock_donation_matches';

/**
 * Gets mock persisted match records from local storage.
 */
const getStoredMatches = (): DonationMatch[] => {
  const raw = localStorage.getItem(MATCHES_STORAGE_KEY);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {
      /* ignore */
    }
  }
  return [];
};

/**
 * Saves match records to local storage.
 */
const saveStoredMatches = (matches: DonationMatch[]) => {
  localStorage.setItem(MATCHES_STORAGE_KEY, JSON.stringify(matches));
};

/**
 * Secondary mock NGOs for rich testing of matching conditions (e.g. distance, capacity, verification, category)
 */
const getMockRegisteredNGOs = async (): Promise<NGOProfileData[]> => {
  const currentNGO = await ngoService.getNGOProfile();

  const additionalNGOs: NGOProfileData[] = [
    {
      id: 'usr_ngo_2',
      organizationName: 'St. Jude Community Kitchen',
      registrationNumber: 'NGO-METRO-2023-1102',
      contactPerson: 'David Miller',
      email: 'stjude@community.org',
      phone: '+1 555-0812',
      address: '420 Unity St, Sector 5',
      city: 'Metropolis',
      latitude: 40.7300, // ~2.1 km away
      longitude: -73.9950,
      acceptedCategories: ['Cooked Meals', 'Biryani', 'Bakery'],
      acceptedFoodTypes: ['Vegetarian', 'Non-Vegetarian'],
      maxCapacity: 300,
      currentCapacity: 100,
      capacityUnit: 'kg',
      isCurrentlyAvailable: true,
      operatingSchedule: [],
      verificationStatus: 'VERIFIED',
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'usr_ngo_3',
      organizationName: 'Metro Packaged Food Relief',
      registrationNumber: 'NGO-METRO-2024-9912',
      contactPerson: 'Anita Roy',
      email: 'anita@metropackaged.org',
      phone: '+1 555-0999',
      address: '12 Logistics Way, Sector 8',
      city: 'Metropolis',
      latitude: 40.7200, // ~1.5 km away
      longitude: -73.9900,
      acceptedCategories: ['Packaged Food', 'Dairy'], // Category mismatch for biryani
      acceptedFoodTypes: ['Vegetarian'],
      maxCapacity: 500,
      currentCapacity: 50,
      capacityUnit: 'boxes',
      isCurrentlyAvailable: true,
      operatingSchedule: [],
      verificationStatus: 'VERIFIED',
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'usr_ngo_4',
      organizationName: 'Suburban Relief Center (Out of 5km Radius)',
      registrationNumber: 'NGO-METRO-2024-7711',
      contactPerson: 'Robert Vance',
      email: 'robert@suburbanrelief.org',
      phone: '+1 555-0771',
      address: '900 Outer Ring Road, Zone 12',
      city: 'Metropolis',
      latitude: 40.8500, // ~15.8 km away (Out of 5km radius!)
      longitude: -73.8500,
      acceptedCategories: ['Cooked Meals', 'Biryani', 'Bakery'],
      acceptedFoodTypes: ['Vegetarian', 'Non-Vegetarian'],
      maxCapacity: 400,
      currentCapacity: 20,
      capacityUnit: 'kg',
      isCurrentlyAvailable: true,
      operatingSchedule: [],
      verificationStatus: 'VERIFIED',
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'usr_ngo_5',
      organizationName: 'Unverified Community Shelter',
      registrationNumber: 'NGO-METRO-2024-0011',
      contactPerson: 'Mark Allen',
      email: 'mark@unverifiedshelter.org',
      phone: '+1 555-0011',
      address: '55 Hope St',
      city: 'Metropolis',
      latitude: 40.7150, // ~0.5 km away
      longitude: -74.0010,
      acceptedCategories: ['Cooked Meals', 'Biryani'],
      acceptedFoodTypes: ['Vegetarian'],
      maxCapacity: 200,
      currentCapacity: 10,
      capacityUnit: 'kg',
      isCurrentlyAvailable: true,
      operatingSchedule: [],
      verificationStatus: 'PENDING', // Unverified! Should be excluded by Rule 2
      updatedAt: new Date().toISOString(),
    }
  ];

  // Combine authenticated NGO with mock registered list without duplicating ID
  const allNGOs = [currentNGO];
  for (const extra of additionalNGOs) {
    if (!allNGOs.some((n) => n.id === extra.id)) {
      allNGOs.push(extra);
    }
  }
  return allNGOs;
};

export const matchingService = {
  // POST /api/matching/donation/{donationId}/run — Trigger dynamic matching engine
  runMatching: async (
    donationId: string,
    radiusKm: number = INITIAL_MATCHING_RADIUS_KM
  ): Promise<DonationMatch[]> => {
    try {
      const res = await api.post<ApiResponse<DonationMatch[]>>(`/matching/donation/${donationId}/run`, {
        radiusKm,
      });
      if (res.data.data) return res.data.data;
      throw new Error();
    } catch {
      // Mock Fallback Execution
      const donation = await donationService.getDonationById(donationId);
      if (!donation) {
        throw new Error(`Donation #${donationId} was not found.`);
      }

      if (donation.status !== 'AVAILABLE' && donation.status !== 'MATCHING') {
        throw new Error(`Donation #${donationId} is in '${donation.status}' state and cannot be matched.`);
      }

      const registeredNGOs = await getMockRegisteredNGOs();
      const existingMatches = getStoredMatches();

      const newMatches = runMatchingEngine(donation, registeredNGOs, existingMatches, radiusKm);

      // Merge new matches with persistent storage without duplicates
      const updatedMatchesList = [...existingMatches];
      for (const nm of newMatches) {
        const idx = updatedMatchesList.findIndex((m) => m.id === nm.id);
        if (idx >= 0) {
          updatedMatchesList[idx] = nm;
        } else {
          updatedMatchesList.push(nm);
        }
      }

      saveStoredMatches(updatedMatchesList);
      return newMatches;
    }
  },

  // GET /api/matching/donation/{donationId} — Get matches generated for a donation
  getDonationMatches: async (donationId: string): Promise<DonationMatch[]> => {
    try {
      const res = await api.get<ApiResponse<DonationMatch[]>>(`/matching/donation/${donationId}`);
      if (res.data.data) return res.data.data;
      throw new Error();
    } catch {
      const stored = getStoredMatches();
      return stored.filter((m) => m.donationId === donationId);
    }
  },

  // GET /api/ngo/matches — Get matches assigned to current logged-in NGO
  getNGOMatches: async (ngoId?: string): Promise<DonationMatch[]> => {
    try {
      const res = await api.get<ApiResponse<DonationMatch[]>>('/ngo/matches');
      if (res.data.data) return res.data.data;
      throw new Error();
    } catch {
      const profile = await ngoService.getNGOProfile();
      const targetNgoId = ngoId || profile.id;

      // Auto-run matching engine on all active donations to ensure newly created donations are matched
      const donations = await donationService.getAllDonations();
      const availableDonations = donations.filter((d: FoodDonation) => d.status === 'AVAILABLE' || d.status === 'MATCHING');

      for (const donation of availableDonations) {
        await matchingService.runMatching(donation.id, INITIAL_MATCHING_RADIUS_KM);
      }

      const refreshed = getStoredMatches();
      return refreshed.filter((m) => (m.ngoId === targetNgoId || m.ngoId === profile.id || m.ngoId === (profile as any).userId) && m.matchStatus !== 'CANCELLED');
    }
  },

  // GET /api/matching/{matchId} — Get single match details
  getMatchDetails: async (matchId: string): Promise<DonationMatch | null> => {
    try {
      const res = await api.get<ApiResponse<DonationMatch>>(`/matching/${matchId}`);
      if (res.data.data) return res.data.data;
      throw new Error();
    } catch {
      const stored = getStoredMatches();
      const found = stored.find((m) => m.id === matchId);
      return found || null;
    }
  },
};
