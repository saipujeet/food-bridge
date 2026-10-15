import api from './api';
import type {
  VolunteerProfile,
  UpdateVolunteerProfileRequest,
  UpdateVolunteerAvailabilityRequest,
  VolunteerAvailability,
  ApiResponse,
  LocationHistoryRecord,
} from '../types';
import { authService } from './authService';
import { isValidCoordinate } from '../utils/distanceUtils';
import { notificationEventBus } from '../utils/notificationEventBus';

const VOLUNTEER_PROFILE_STORAGE_KEY = 'foodbridge_mock_volunteer_profile';
const VOLUNTEER_LOCATION_HISTORY_STORAGE_KEY = 'foodbridge_mock_volunteer_location_history';

const DEFAULT_VOLUNTEER_PROFILE: VolunteerProfile = {
  id: 'vol_profile_001',
  userId: 'user_vol_001',
  fullName: 'Alex River (Volunteer)',
  phone: '+91 98480 77777',
  profileImageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  vehicleType: 'SCOOTER',
  availabilityStatus: 'AVAILABLE',
  verificationStatus: 'VERIFIED',
  serviceArea: 'Ongole & Vijayawada Region, Andhra Pradesh',
  latitude: 15.505,
  longitude: 80.049,
  createdAt: new Date().toISOString(),
};

const getStoredVolunteerProfile = (): VolunteerProfile => {
  const raw = localStorage.getItem(VOLUNTEER_PROFILE_STORAGE_KEY);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {
      /* ignore */
    }
  }
  return DEFAULT_VOLUNTEER_PROFILE;
};

const saveStoredVolunteerProfile = (profile: VolunteerProfile) => {
  localStorage.setItem(VOLUNTEER_PROFILE_STORAGE_KEY, JSON.stringify(profile));
};

const recordLocationHistory = (volunteerId: string, latitude: number, longitude: number) => {
  try {
    const raw = localStorage.getItem(VOLUNTEER_LOCATION_HISTORY_STORAGE_KEY);
    const history: LocationHistoryRecord[] = raw ? JSON.parse(raw) : [];
    const newRecord: LocationHistoryRecord = {
      id: `loc_hist_${Date.now()}`,
      volunteerId,
      latitude,
      longitude,
      recordedAt: new Date().toISOString(),
    };
    history.unshift(newRecord);
    // Keep last 50 entries
    localStorage.setItem(VOLUNTEER_LOCATION_HISTORY_STORAGE_KEY, JSON.stringify(history.slice(0, 50)));
  } catch {
    /* ignore */
  }
};

export const volunteerService = {
  // GET /api/volunteer/profile — Get authenticated volunteer's operational profile
  getVolunteerProfile: async (): Promise<VolunteerProfile> => {
    try {
      const res = await api.get<ApiResponse<VolunteerProfile>>('/volunteer/profile', { timeout: 800 });
      if (res.data.data) return res.data.data;
      throw new Error(res.data.message || 'Failed to fetch volunteer profile');
    } catch {
      const user = await authService.getCurrentUser();
      const profile = getStoredVolunteerProfile();
      if (user && user.role === 'VOLUNTEER') {
        profile.fullName = user.name || profile.fullName;
        profile.phone = user.phone || profile.phone;
        profile.userId = user.id || profile.userId;
      }
      saveStoredVolunteerProfile(profile);
      return profile;
    }
  },

  // PUT /api/volunteer/profile — Update volunteer operational profile
  updateVolunteerProfile: async (data: UpdateVolunteerProfileRequest): Promise<VolunteerProfile> => {
    try {
      const res = await api.put<ApiResponse<VolunteerProfile>>('/volunteer/profile', data);
      if (res.data.data) return res.data.data;
      throw new Error(res.data.message || 'Failed to update volunteer profile');
    } catch {
      const profile = getStoredVolunteerProfile();
      const updated: VolunteerProfile = {
        ...profile,
        fullName: data.fullName ?? profile.fullName,
        phone: data.phone ?? profile.phone,
        vehicleType: data.vehicleType ?? profile.vehicleType,
        serviceArea: data.serviceArea ?? profile.serviceArea,
        latitude: data.latitude ?? profile.latitude,
        longitude: data.longitude ?? profile.longitude,
        profileImageUrl: data.profileImageUrl ?? profile.profileImageUrl,
        updatedAt: new Date().toISOString(),
      };
      saveStoredVolunteerProfile(updated);
      return updated;
    }
  },

  // POST /api/volunteers/location — Security-scoped volunteer live location update
  updateLocation: async (latitude: number, longitude: number, targetVolunteerId?: string): Promise<VolunteerProfile> => {
    if (!isValidCoordinate(latitude, longitude)) {
      throw new Error('Invalid coordinates: Latitude must be between -90 and 90, Longitude between -180 and 180.');
    }

    try {
      const res = await api.post<ApiResponse<VolunteerProfile>>('/volunteers/location', { latitude, longitude });
      if (res.data.data) return res.data.data;
      throw new Error(res.data.message || 'Failed to update location');
    } catch {
      const user = await authService.getCurrentUser();
      const profile = getStoredVolunteerProfile();

      // Security check: Only authenticated volunteer can update their own location
      if (targetVolunteerId && targetVolunteerId !== profile.id && targetVolunteerId !== profile.userId) {
        if (!user || (user.id !== targetVolunteerId && user.role !== 'ADMIN')) {
          throw new Error('FORBIDDEN: You cannot update another volunteer\'s location coordinates.');
        }
      }

      const updated: VolunteerProfile = {
        ...profile,
        latitude,
        longitude,
        updatedAt: new Date().toISOString(),
      };

      saveStoredVolunteerProfile(updated);
      recordLocationHistory(profile.id, latitude, longitude);

      // Emit real-time location update notification to active delivery map subscribers
      notificationEventBus.emit({
        id: `loc_event_${Date.now()}`,
        userId: profile.userId,
        type: 'SYSTEM_ALERT',
        category: 'DELIVERY',
        title: 'Volunteer Location Updated',
        message: `Volunteer live coordinates updated to (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`,
        priority: 'LOW',
        isRead: true,
        createdAt: new Date().toISOString(),
      });

      return updated;
    }
  },

  // PUT /api/volunteer/availability — Update volunteer availability status
  updateAvailability: async (availabilityStatus: VolunteerAvailability): Promise<VolunteerProfile> => {
    try {
      const res = await api.put<ApiResponse<VolunteerProfile>>('/volunteer/availability', {
        availabilityStatus,
      } as UpdateVolunteerAvailabilityRequest);
      if (res.data.data) return res.data.data;
      throw new Error(res.data.message || 'Failed to update availability status');
    } catch {
      const profile = getStoredVolunteerProfile();
      if (profile.verificationStatus !== 'VERIFIED') {
        throw new Error('UNAUTHORIZED: Only verified volunteers can update availability.');
      }
      const updated: VolunteerProfile = {
        ...profile,
        availabilityStatus,
        updatedAt: new Date().toISOString(),
      };
      saveStoredVolunteerProfile(updated);
      return updated;
    }
  },

  // Eligibility validator for volunteer task assignment
  verifyVolunteerEligibility: (profile: VolunteerProfile): { eligible: boolean; reason?: string } => {
    if (profile.verificationStatus !== 'VERIFIED') {
      return { eligible: false, reason: 'Volunteer account verification is pending or suspended.' };
    }
    if (profile.availabilityStatus === 'UNAVAILABLE') {
      return { eligible: false, reason: 'Volunteer is currently marked as UNAVAILABLE.' };
    }
    if (profile.availabilityStatus === 'BUSY') {
      return { eligible: false, reason: 'Volunteer is currently BUSY with another active delivery task.' };
    }
    return { eligible: true };
  },
};
