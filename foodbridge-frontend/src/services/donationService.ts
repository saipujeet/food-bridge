import api from './api';
import type { FoodDonation, ApiResponse } from '../types';
import { notificationService } from './notificationService';
import { matchingService } from './matchingService';

const DONATIONS_STORAGE_KEY = 'foodbridge_mock_donations';

const getInitialMockDonations = (): FoodDonation[] => {
  const raw = localStorage.getItem(DONATIONS_STORAGE_KEY);
  let donations: FoodDonation[] = [];
  if (raw) {
    try {
      donations = JSON.parse(raw);
    } catch {
      donations = [];
    }
  }

  const now = new Date();
  const futureExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  if (donations.length > 0) {
    let modified = false;
    for (const d of donations) {
      if (d.status === 'AVAILABLE' || d.status === 'MATCHING') {
        const untilDate = new Date(d.availableUntil ? d.availableUntil.replace(' ', 'T') : '');
        if (isNaN(untilDate.getTime()) || untilDate < now) {
          d.availableUntil = futureExpiry;
          modified = true;
        }
      }
    }
    if (modified) {
      saveDonations(donations);
    }
    return donations;
  }

  const initial: FoodDonation[] = [
    {
      id: 'DON-1001',
      donorId: 'usr_donor_1',
      donorName: 'Grand Hyatt Canteen',
      donorCity: 'Ongole',
      donorPhone: '+91 98480 12345',
      donorAddress: '742 Gopal Nagar 4th Line, Ongole',
      latitude: 15.505,
      longitude: 80.049,
      foodName: 'Fresh Vegetable Biryani & Gravy Meals',
      foodCategory: 'Biryani',
      foodType: 'Vegetarian',
      quantity: 45,
      unit: 'kg',
      description: 'Freshly prepared vegetable biryani with raita and mixed gravy. Kept in insulated food warmers.',
      preparationDate: new Date().toISOString().split('T')[0],
      preparationTime: '17:30',
      availableFrom: new Date().toISOString(),
      availableUntil: futureExpiry,
      imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=60',
      specialInstructions: 'Please collect from rear kitchen entrance loading bay 2.',
      status: 'AVAILABLE',
      createdAt: new Date().toISOString(),
      distanceKm: 0.2,
    },
    {
      id: 'DON-1002',
      donorId: 'usr_donor_1',
      donorName: 'Vijayawada Grand Hotel Canteen',
      donorCity: 'Vijayawada',
      donorPhone: '+91 98480 54321',
      donorAddress: '12 MG Road, Vijayawada',
      latitude: 16.506,
      longitude: 80.648,
      foodName: 'Artisan Bread Rolls & Whole Wheat Buns',
      foodCategory: 'Bakery',
      foodType: 'Vegetarian',
      quantity: 20,
      unit: 'boxes',
      description: 'Surplus dinner rolls and whole wheat buns from evening banquet.',
      preparationDate: new Date().toISOString().split('T')[0],
      preparationTime: '16:00',
      availableFrom: new Date().toISOString(),
      availableUntil: futureExpiry,
      imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=60',
      specialInstructions: 'Packaged in clean cardboard bakery boxes.',
      status: 'MATCHED',
      matchedNgoId: 'usr_ngo_1',
      matchedNgoName: 'Hope Harvest Foundation',
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      distanceKm: 1.8,
    },
    {
      id: 'DON-1003',
      donorId: 'usr_donor_1',
      donorName: 'Hyderabad Convention Kitchen',
      donorCity: 'Hyderabad',
      donorPhone: '+91 98480 99999',
      donorAddress: '45 Banjara Hills Road No 1, Hyderabad',
      latitude: 17.385,
      longitude: 78.486,
      foodName: 'Sealed Fruit Juice Packs & Mixed Snacks',
      foodCategory: 'Packaged Food',
      foodType: 'Vegetarian',
      quantity: 85,
      unit: 'packets',
      description: 'Commercial packaged fruit juices and sealed snack items from corporate convention.',
      preparationDate: new Date().toISOString().split('T')[0],
      preparationTime: '12:00',
      availableFrom: new Date().toISOString(),
      availableUntil: futureExpiry,
      imageUrl: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=500&auto=format&fit=crop&q=60',
      specialInstructions: 'Stored in climate-controlled pantry area.',
      status: 'DELIVERED',
      matchedNgoId: 'usr_ngo_1',
      matchedNgoName: 'Hope Harvest Foundation',
      assignedVolunteerId: 'usr_vol_1',
      assignedVolunteerName: 'David Miller',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      distanceKm: 1.2,
    },
  ];
  localStorage.setItem(DONATIONS_STORAGE_KEY, JSON.stringify(initial));
  return initial;
};

const checkAndExpireDonations = (list: FoodDonation[]): FoodDonation[] => {
  const now = new Date();
  let modified = false;
  for (const d of list) {
    if (d.status === 'AVAILABLE' || d.status === 'MATCHING') {
      const untilDate = new Date(d.availableUntil ? d.availableUntil.replace(' ', 'T') : '');
      if (!isNaN(untilDate.getTime()) && untilDate < now) {
        d.status = 'EXPIRED';
        d.updatedAt = now.toISOString();
        modified = true;
      }
    }
  }
  if (modified) {
    saveDonations(list);
  }
  return list;
};

const saveDonations = (list: FoodDonation[]) => {
  localStorage.setItem(DONATIONS_STORAGE_KEY, JSON.stringify(list));
};

export const donationService = {
  // Check and transition expired donations automatically
  checkAndExpireDonations: async (): Promise<FoodDonation[]> => {
    const donations = getInitialMockDonations();
    return checkAndExpireDonations(donations);
  },

  // GET /api/donations/my — Fetch current authenticated donor's donations
  getDonorDonations: async (): Promise<FoodDonation[]> => {
    try {
      const res = await api.get<ApiResponse<FoodDonation[]>>('/donations/my');
      if (res.data.data) return res.data.data;
      throw new Error();
    } catch {
      const donations = getInitialMockDonations();
      return checkAndExpireDonations(donations);
    }
  },

  // GET /api/donations — Fetch all donations (Public / NGO overview)
  getAllDonations: async (): Promise<FoodDonation[]> => {
    try {
      const res = await api.get<ApiResponse<FoodDonation[]>>('/donations');
      if (res.data.data) return res.data.data;
      throw new Error();
    } catch {
      const donations = getInitialMockDonations();
      return checkAndExpireDonations(donations);
    }
  },

  // GET /api/donations/{id} — Fetch single donation details
  getDonationById: async (id: string): Promise<FoodDonation> => {
    try {
      const res = await api.get<ApiResponse<FoodDonation>>(`/donations/${id}`);
      if (res.data.data) return res.data.data;
      throw new Error();
    } catch {
      const all = checkAndExpireDonations(getInitialMockDonations());
      const found = all.find((d) => d.id === id || d.id.toLowerCase() === id.toLowerCase());
      if (found) return found;
      throw new Error('This donation could not be found.');
    }
  },

  // POST /api/donations — Create a new surplus food donation
  createDonation: async (data: Partial<FoodDonation>): Promise<FoodDonation> => {
    try {
      const res = await api.post<ApiResponse<FoodDonation>>('/donations', data);
      if (res.data.data) return res.data.data;
      throw new Error();
    } catch {
      const current = getInitialMockDonations();
      const newId = `DON-${1000 + current.length + 1}`;
      const newDonation: FoodDonation = {
        id: newId,
        donorId: data.donorId || 'usr_donor_1',
        donorName: data.donorName || 'Grand Hyatt Canteen',
        donorCity: data.donorCity || 'Metropolis',
        donorPhone: data.donorPhone || '+1 555-0192',
        donorAddress: data.donorAddress || '742 Evergreen Terrace',
        latitude: data.latitude || 40.7128,
        longitude: data.longitude || -74.0060,

        foodName: data.foodName || 'Surplus Meals',
        foodCategory: data.foodCategory || 'Cooked Meals',
        foodType: data.foodType || 'Vegetarian',
        quantity: Number(data.quantity) || 10,
        unit: data.unit || 'kg',
        description: data.description || '',

        preparationDate: data.preparationDate || new Date().toISOString().split('T')[0],
        preparationTime: data.preparationTime || '18:00',
        availableFrom: data.availableFrom || new Date().toISOString(),
        availableUntil: data.availableUntil || new Date(Date.now() + 14400000).toISOString(),

        imageUrl: data.imageUrl || 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=60',
        specialInstructions: data.specialInstructions || '',

        status: 'AVAILABLE',
        createdAt: new Date().toISOString(),
        distanceKm: 1.8,
      };

      current.unshift(newDonation);
      saveDonations(current);

      // Trigger Module 4 Dynamic Matching Engine & Module 8 Notifications
      try {
        await matchingService.runMatching(newDonation.id, 5);
        await notificationService.createNotification({
          userId: newDonation.donorId,
          type: 'DONATION_CREATED',
          title: 'Donation Created',
          message: `Your food donation for '${newDonation.foodName}' (${newDonation.quantity} ${newDonation.unit}) was created successfully and is now matching.`,
          priority: 'NORMAL',
          referenceType: 'DONATION',
          referenceId: newDonation.id,
        });
      } catch {
        /* ignore notification errors */
      }

      return newDonation;
    }
  },

  // PUT /api/donations/{id} — Update an eligible donation
  updateDonation: async (id: string, data: Partial<FoodDonation>): Promise<FoodDonation> => {
    try {
      const res = await api.put<ApiResponse<FoodDonation>>(`/donations/${id}`, data);
      if (res.data.data) return res.data.data;
      throw new Error();
    } catch {
      const current = getInitialMockDonations();
      const idx = current.findIndex((d) => d.id === id);
      if (idx >= 0) {
        if (current[idx].status !== 'AVAILABLE') {
          throw new Error('This donation can no longer be edited because its current status does not allow changes.');
        }
        const updated: FoodDonation = {
          ...current[idx],
          ...data,
          updatedAt: new Date().toISOString(),
        };
        current[idx] = updated;
        saveDonations(current);

        // Re-run matching engine after donation parameters/location update
        try {
          await matchingService.runMatching(updated.id, 5);
        } catch {
          /* ignore */
        }

        return updated;
      }
      throw new Error('Donation not found.');
    }
  },

  // PATCH /api/donations/{id}/cancel — Cancel an eligible donation
  cancelDonation: async (id: string): Promise<FoodDonation> => {
    try {
      const res = await api.patch<ApiResponse<FoodDonation>>(`/donations/${id}/cancel`);
      if (res.data.data) return res.data.data;
      throw new Error();
    } catch {
      const current = getInitialMockDonations();
      const idx = current.findIndex((d) => d.id === id);
      if (idx >= 0) {
        current[idx].status = 'CANCELLED';
        current[idx].updatedAt = new Date().toISOString();
        saveDonations(current);
        return current[idx];
      }
      throw new Error('Donation not found.');
    }
  },

  // Claim Donation by NGO (Module 3-4 prep)
  claimDonation: async (donationId: string, ngoId: string, ngoName: string): Promise<FoodDonation> => {
    try {
      const res = await api.post<ApiResponse<FoodDonation>>(`/donations/${donationId}/claim`, { ngoId, ngoName });
      if (res.data.data) return res.data.data;
      throw new Error();
    } catch {
      const current = getInitialMockDonations();
      const idx = current.findIndex((d) => d.id === donationId);
      if (idx >= 0) {
        current[idx].status = 'MATCHED';
        current[idx].matchedNgoId = ngoId;
        current[idx].matchedNgoName = ngoName;
        current[idx].updatedAt = new Date().toISOString();
        saveDonations(current);
        return current[idx];
      }
      throw new Error('Donation listing not found');
    }
  },

  // Accept Pickup by Volunteer (Module 7 prep)
  acceptVolunteerPickup: async (donationId: string, volId: string, volName: string, volPhone: string): Promise<FoodDonation> => {
    try {
      const res = await api.post<ApiResponse<FoodDonation>>(`/donations/${donationId}/volunteer-pickup`, { volId, volName, volPhone });
      if (res.data.data) return res.data.data;
      throw new Error();
    } catch {
      const current = getInitialMockDonations();
      const idx = current.findIndex((d) => d.id === donationId);
      if (idx >= 0) {
        current[idx].status = 'PICKED_UP';
        current[idx].assignedVolunteerId = volId;
        current[idx].assignedVolunteerName = volName;
        current[idx].assignedVolunteerPhone = volPhone;
        current[idx].updatedAt = new Date().toISOString();
        saveDonations(current);
        return current[idx];
      }
      throw new Error('Donation listing not found');
    }
  },

  // Mark Completed / Delivered
  completeDonation: async (donationId: string): Promise<FoodDonation> => {
    try {
      const res = await api.post<ApiResponse<FoodDonation>>(`/donations/${donationId}/complete`);
      if (res.data.data) return res.data.data;
      throw new Error();
    } catch {
      const current = getInitialMockDonations();
      const idx = current.findIndex((d) => d.id === donationId);
      if (idx >= 0) {
        current[idx].status = 'DELIVERED';
        current[idx].updatedAt = new Date().toISOString();
        saveDonations(current);
        return current[idx];
      }
      throw new Error('Donation listing not found');
    }
  },
};
