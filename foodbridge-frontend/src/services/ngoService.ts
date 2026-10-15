import api from './api';
import type { NGOProfileData, ApiResponse, DaySchedule, FoodCategory, FoodType, CapacityUnit, NGOVerificationStatus } from '../types';
import { createDefaultSchedule } from '../utils/availabilityUtils';

const NGO_STORAGE_KEY = 'foodbridge_mock_ngo_profile';

const calculateTodayNGOUsedCapacity = (ngoId: string): number => {
  const raw = localStorage.getItem('foodbridge_mock_donation_acceptances');
  if (!raw) return 0;
  try {
    const acceptances = JSON.parse(raw);
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    return acceptances
      .filter((a: any) => (a.ngoId === ngoId || a.ngoId === 'usr_ngo_1') && a.status === 'CONFIRMED' && new Date(a.acceptedAt) >= startOfToday)
      .reduce((sum: number, a: any) => sum + (Number(a.acceptedQuantity) || 0), 0);
  } catch {
    return 0;
  }
};

const getInitialMockNGOProfile = (): NGOProfileData => {
  const raw = localStorage.getItem(NGO_STORAGE_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      return {
        ...parsed,
        currentCapacity: calculateTodayNGOUsedCapacity(parsed.id || 'usr_ngo_1'),
      };
    } catch {
      /* ignore */
    }
  }

  const initial: NGOProfileData = {
    id: 'usr_ngo_1',
    organizationName: 'Hope Harvest Foundation',
    registrationNumber: 'NGO-AP-2024-8849',
    contactPerson: 'Sarah Jenkins',
    email: 'ngo@foodbridge.org',
    phone: '+91 98480 88888',
    address: '108 Compassion Ave, Shelter Sector 2, Ongole',
    city: 'Ongole',
    description: 'Providing daily wholesome evening meals, shelter, and nutrition support for community families and children.',
    latitude: 15.500639,
    longitude: 80.05328,
    acceptedCategories: ['Cooked Meals', 'Rice', 'Biryani', 'Bakery', 'Packaged Food'],
    acceptedFoodTypes: ['Vegetarian', 'Non-Vegetarian'],
    maxCapacity: 250,
    currentCapacity: calculateTodayNGOUsedCapacity('usr_ngo_1'),
    capacityUnit: 'kg',
    isCurrentlyAvailable: true,
    operatingSchedule: createDefaultSchedule(),
    verificationStatus: 'VERIFIED',
    verificationNotes: 'Official registration documentation & shelter health guidelines verified by system administrator.',
    updatedAt: new Date().toISOString(),
  };

  localStorage.setItem(NGO_STORAGE_KEY, JSON.stringify(initial));
  return initial;
};

const saveMockNGOProfile = (data: NGOProfileData) => {
  localStorage.setItem(NGO_STORAGE_KEY, JSON.stringify(data));
};

export const ngoService = {
  // GET /api/ngo/profile — Fetch current authenticated NGO profile
  getNGOProfile: async (): Promise<NGOProfileData> => {
    try {
      const res = await api.get<ApiResponse<NGOProfileData>>('/ngo/profile');
      if (res.data.data) return res.data.data;
      throw new Error();
    } catch {
      return getInitialMockNGOProfile();
    }
  },

  // PUT /api/ngo/profile — Update NGO organization & contact profile
  updateNGOProfile: async (partial: Partial<NGOProfileData>): Promise<NGOProfileData> => {
    try {
      const res = await api.put<ApiResponse<NGOProfileData>>('/ngo/profile', partial);
      if (res.data.data) return res.data.data;
      throw new Error();
    } catch {
      const current = getInitialMockNGOProfile();
      const updated: NGOProfileData = {
        ...current,
        ...partial,
        updatedAt: new Date().toISOString(),
      };
      saveMockNGOProfile(updated);
      return updated;
    }
  },

  // GET /api/ngo/preferences — Fetch food preferences
  getFoodPreferences: async (): Promise<{ acceptedCategories: FoodCategory[]; acceptedFoodTypes: FoodType[] }> => {
    try {
      const res = await api.get<ApiResponse<{ acceptedCategories: FoodCategory[]; acceptedFoodTypes: FoodType[] }>>('/ngo/preferences');
      if (res.data.data) return res.data.data;
      throw new Error();
    } catch {
      const profile = getInitialMockNGOProfile();
      return {
        acceptedCategories: profile.acceptedCategories,
        acceptedFoodTypes: profile.acceptedFoodTypes,
      };
    }
  },

  // PUT /api/ngo/preferences — Update food preferences
  updateFoodPreferences: async (params: { acceptedCategories: FoodCategory[]; acceptedFoodTypes: FoodType[] }): Promise<NGOProfileData> => {
    try {
      const res = await api.put<ApiResponse<NGOProfileData>>('/ngo/preferences', params);
      if (res.data.data) return res.data.data;
      throw new Error();
    } catch {
      const current = getInitialMockNGOProfile();
      const updated: NGOProfileData = {
        ...current,
        acceptedCategories: params.acceptedCategories,
        acceptedFoodTypes: params.acceptedFoodTypes,
        updatedAt: new Date().toISOString(),
      };
      saveMockNGOProfile(updated);
      return updated;
    }
  },

  // GET /api/ngo/capacity — Fetch food receiving capacity
  getCapacity: async (): Promise<{ maxCapacity: number; currentCapacity: number; capacityUnit: CapacityUnit }> => {
    try {
      const res = await api.get<ApiResponse<{ maxCapacity: number; currentCapacity: number; capacityUnit: CapacityUnit }>>('/ngo/capacity');
      if (res.data.data) return res.data.data;
      throw new Error();
    } catch {
      const profile = getInitialMockNGOProfile();
      return {
        maxCapacity: profile.maxCapacity,
        currentCapacity: profile.currentCapacity,
        capacityUnit: profile.capacityUnit,
      };
    }
  },

  // PUT /api/ngo/capacity — Update capacity
  updateCapacity: async (params: { maxCapacity: number; currentCapacity: number; capacityUnit: CapacityUnit }): Promise<NGOProfileData> => {
    try {
      const res = await api.put<ApiResponse<NGOProfileData>>('/ngo/capacity', params);
      if (res.data.data) return res.data.data;
      throw new Error();
    } catch {
      const current = getInitialMockNGOProfile();
      const updated: NGOProfileData = {
        ...current,
        maxCapacity: params.maxCapacity,
        currentCapacity: params.currentCapacity,
        capacityUnit: params.capacityUnit,
        updatedAt: new Date().toISOString(),
      };
      saveMockNGOProfile(updated);
      return updated;
    }
  },

  // GET /api/ngo/availability — Fetch availability & operating hours schedule
  getAvailability: async (): Promise<{ isCurrentlyAvailable: boolean; operatingSchedule: DaySchedule[] }> => {
    try {
      const res = await api.get<ApiResponse<{ isCurrentlyAvailable: boolean; operatingSchedule: DaySchedule[] }>>('/ngo/availability');
      if (res.data.data) return res.data.data;
      throw new Error();
    } catch {
      const profile = getInitialMockNGOProfile();
      return {
        isCurrentlyAvailable: profile.isCurrentlyAvailable,
        operatingSchedule: profile.operatingSchedule,
      };
    }
  },

  // PUT /api/ngo/availability — Update availability & schedule
  updateAvailability: async (params: { isCurrentlyAvailable: boolean; operatingSchedule: DaySchedule[] }): Promise<NGOProfileData> => {
    try {
      const res = await api.put<ApiResponse<NGOProfileData>>('/ngo/availability', params);
      if (res.data.data) return res.data.data;
      throw new Error();
    } catch {
      const current = getInitialMockNGOProfile();
      const updated: NGOProfileData = {
        ...current,
        isCurrentlyAvailable: params.isCurrentlyAvailable,
        operatingSchedule: params.operatingSchedule,
        updatedAt: new Date().toISOString(),
      };
      saveMockNGOProfile(updated);
      return updated;
    }
  },

  // GET /api/ngo/location — Fetch location details
  getLocation: async (): Promise<{ address: string; city: string; latitude: number; longitude: number }> => {
    try {
      const res = await api.get<ApiResponse<{ address: string; city: string; latitude: number; longitude: number }>>('/ngo/location');
      if (res.data.data) return res.data.data;
      throw new Error();
    } catch {
      const profile = getInitialMockNGOProfile();
      return {
        address: profile.address,
        city: profile.city,
        latitude: profile.latitude,
        longitude: profile.longitude,
      };
    }
  },

  // PUT /api/ngo/location — Update location details
  updateLocation: async (params: { address: string; city: string; latitude: number; longitude: number }): Promise<NGOProfileData> => {
    try {
      const res = await api.put<ApiResponse<NGOProfileData>>('/ngo/location', params);
      if (res.data.data) return res.data.data;
      throw new Error();
    } catch {
      const current = getInitialMockNGOProfile();
      const updated: NGOProfileData = {
        ...current,
        address: params.address,
        city: params.city,
        latitude: params.latitude,
        longitude: params.longitude,
        updatedAt: new Date().toISOString(),
      };
      saveMockNGOProfile(updated);

      // Dynamically re-run matching for all active donations after NGO location update
      try {
        const { donationService } = await import('./donationService');
        const { matchingService } = await import('./matchingService');
        const donations = await donationService.getAllDonations();
        const activeDonations = donations.filter((d) => d.status === 'AVAILABLE' || d.status === 'MATCHING');
        for (const donation of activeDonations) {
          await matchingService.runMatching(donation.id, 5);
        }
      } catch {
        /* ignore */
      }

      return updated;
    }
  },

  // GET /api/ngo/verification — Fetch verification status
  getVerificationStatus: async (): Promise<{ status: NGOVerificationStatus; notes?: string }> => {
    try {
      const res = await api.get<ApiResponse<{ status: NGOVerificationStatus; notes?: string }>>('/ngo/verification');
      if (res.data.data) return res.data.data;
      throw new Error();
    } catch {
      const profile = getInitialMockNGOProfile();
      return {
        status: profile.verificationStatus,
        notes: profile.verificationNotes,
      };
    }
  },
};
