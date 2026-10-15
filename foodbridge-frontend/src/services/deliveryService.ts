import api from './api';
import type {
  DeliveryTask,
  PickupConfirmation,
  DeliveryProof,
  FoodDonation,
  NGOProfileData,
  DonationAcceptanceRecord,
  ApiResponse,
} from '../types';
import { volunteerService } from './volunteerService';
import { notificationService } from './notificationService';

const DELIVERY_TASKS_STORAGE_KEY = 'foodbridge_mock_delivery_tasks';
const PICKUP_CONFIRMATIONS_STORAGE_KEY = 'foodbridge_mock_pickup_confirmations';
const DELIVERY_PROOFS_STORAGE_KEY = 'foodbridge_mock_delivery_proofs';
const DONATIONS_STORAGE_KEY = 'foodbridge_mock_donations';

// In-Memory Mutex Lock for Concurrency Simulation
let isDeliveryLockAcquired = false;

const acquireDeliveryLock = async (): Promise<boolean> => {
  let attempts = 0;
  while (isDeliveryLockAcquired && attempts < 20) {
    await new Promise((resolve) => setTimeout(resolve, 50));
    attempts++;
  }
  if (isDeliveryLockAcquired) return false;
  isDeliveryLockAcquired = true;
  return true;
};

const releaseDeliveryLock = () => {
  isDeliveryLockAcquired = false;
};

// Distance calculation helper (Haversine Formula)
const calculateDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
};

const INITIAL_SEED_DELIVERIES: DeliveryTask[] = [
  {
    id: 'del_seed_101',
    donationId: 'DON-1001',
    donorId: 'usr_donor_1',
    ngoId: 'ngo_1',
    volunteerId: null,
    volunteerName: null,
    volunteerPhone: null,
    donorName: 'Grand Hyatt Canteen',
    donorPhone: '+91 98480 12345',
    ngoName: 'Hope Harvest Foundation',
    ngoPhone: '+91 98480 88888',
    pickupAddress: '742 Gopal Nagar 4th Line, Ongole, Andhra Pradesh',
    pickupLatitude: 15.505,
    pickupLongitude: 80.049,
    dropAddress: '108 Compassion Ave, Shelter Sector 2, Ongole, Andhra Pradesh',
    dropLatitude: 15.500639,
    dropLongitude: 80.05328,
    foodName: 'Fresh Vegetable Biryani & Gravy Meals',
    foodCategory: 'Biryani',
    quantity: 45,
    unit: 'kg',
    specialInstructions: 'Collect from rear kitchen entrance loading bay 2.',
    status: 'PENDING_ASSIGNMENT',
    distanceKm: 0.5,
    availableUntil: new Date(Date.now() + 86400000).toISOString(),
    createdAt: new Date().toISOString(),
    version: 1,
  },
  {
    id: 'del_seed_102',
    donationId: 'DON-1002',
    donorId: 'usr_donor_1',
    ngoId: 'ngo_2',
    volunteerId: null,
    volunteerName: null,
    volunteerPhone: null,
    donorName: 'Vijayawada Grand Hotel Canteen',
    donorPhone: '+91 98480 54321',
    ngoName: 'Community Food Bank Shelter',
    ngoPhone: '+91 98480 44444',
    pickupAddress: '12 MG Road, Vijayawada, Andhra Pradesh',
    pickupLatitude: 16.506,
    pickupLongitude: 80.648,
    dropAddress: '220 Hope Avenue, Vijayawada, Andhra Pradesh',
    dropLatitude: 16.51,
    dropLongitude: 80.65,
    foodName: 'Artisan Bread Rolls & Whole Wheat Buns',
    foodCategory: 'Bakery',
    quantity: 20,
    unit: 'boxes',
    specialInstructions: 'Handle bakery boxes with care.',
    status: 'PENDING_ASSIGNMENT',
    distanceKm: 0.6,
    availableUntil: new Date(Date.now() + 86400000).toISOString(),
    createdAt: new Date().toISOString(),
    version: 1,
  },
];

const getStoredDeliveries = (): DeliveryTask[] => {
  const raw = localStorage.getItem(DELIVERY_TASKS_STORAGE_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch {
      /* ignore */
    }
  }
  localStorage.setItem(DELIVERY_TASKS_STORAGE_KEY, JSON.stringify(INITIAL_SEED_DELIVERIES));
  return INITIAL_SEED_DELIVERIES;
};

const saveStoredDeliveries = (tasks: DeliveryTask[]) => {
  localStorage.setItem(DELIVERY_TASKS_STORAGE_KEY, JSON.stringify(tasks));
};

const getStoredPickupConfirmations = (): PickupConfirmation[] => {
  const raw = localStorage.getItem(PICKUP_CONFIRMATIONS_STORAGE_KEY);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {
      /* ignore */
    }
  }
  return [];
};

const saveStoredPickupConfirmations = (confirmations: PickupConfirmation[]) => {
  localStorage.setItem(PICKUP_CONFIRMATIONS_STORAGE_KEY, JSON.stringify(confirmations));
};

const getStoredDeliveryProofs = (): DeliveryProof[] => {
  const raw = localStorage.getItem(DELIVERY_PROOFS_STORAGE_KEY);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {
      /* ignore */
    }
  }
  return [];
};

const saveStoredDeliveryProofs = (proofs: DeliveryProof[]) => {
  localStorage.setItem(DELIVERY_PROOFS_STORAGE_KEY, JSON.stringify(proofs));
};

export const deliveryService = {
  // Automatic Delivery Creation called when NGO accepts donation (Module 6 -> Module 7)
  createDeliveryTaskForAcceptedDonation: async (
    donation: FoodDonation,
    ngoProfile: NGOProfileData,
    _acceptanceRecord: DonationAcceptanceRecord
  ): Promise<DeliveryTask> => {
    const deliveries = getStoredDeliveries();
    
    // Invariant Check: ONE ACCEPTED DONATION -> ONE ACTIVE DELIVERY TASK
    const existing = deliveries.find((d) => d.donationId === donation.id && d.status !== 'CANCELLED' && d.status !== 'FAILED');
    if (existing) {
      return existing;
    }

    const pickupLat = donation.latitude || 15.500;
    const pickupLon = donation.longitude || 80.040;
    const dropLat = ngoProfile.latitude || 15.510;
    const dropLon = ngoProfile.longitude || 80.050;
    const distanceKm = calculateDistanceKm(pickupLat, pickupLon, dropLat, dropLon);
    const nowStr = new Date().toISOString();

    const newTask: DeliveryTask = {
      id: `del_${donation.id}`,
      donationId: donation.id,
      donorId: donation.donorId,
      ngoId: ngoProfile.id,
      volunteerId: null,
      volunteerName: null,
      volunteerPhone: null,
      donorName: donation.donorName || 'Donor',
      donorPhone: donation.donorPhone || '+1 (555) 123-4567',
      ngoName: ngoProfile.organizationName,
      ngoPhone: ngoProfile.phone || '+1 (555) 987-6543',
      pickupAddress: donation.donorAddress || donation.donorCity || 'Donor Location',
      pickupLatitude: pickupLat,
      pickupLongitude: pickupLon,
      dropAddress: ngoProfile.address || ngoProfile.city || 'NGO Drop Location',
      dropLatitude: dropLat,
      dropLongitude: dropLon,
      foodName: donation.foodName,
      foodCategory: donation.foodCategory,
      quantity: donation.quantity,
      unit: donation.unit,
      specialInstructions: donation.specialInstructions,
      status: 'PENDING_ASSIGNMENT',
      distanceKm,
      availableUntil: donation.availableUntil,
      createdAt: nowStr,
      version: 1,
    };

    deliveries.push(newTask);
    saveStoredDeliveries(deliveries);
    return newTask;
  },

  // GET /api/deliveries/available — Get list of unassigned delivery tasks eligible for pickup
  getAvailableDeliveries: async (): Promise<DeliveryTask[]> => {
    try {
      const res = await api.get<ApiResponse<DeliveryTask[]>>('/deliveries/available', { timeout: typeof window !== 'undefined' ? 3000 : 150 });
      if (res.data.data) return res.data.data;
      throw new Error(res.data.message || 'Failed to fetch available deliveries');
    } catch {
      let deliveries = getStoredDeliveries();
      const now = new Date();
      let available = deliveries.filter((d) => {
        if (d.status !== 'PENDING_ASSIGNMENT') return false;
        const untilDate = new Date(d.availableUntil);
        if (!isNaN(untilDate.getTime()) && untilDate < now) return false;
        return true;
      });

      // Auto-seed fresh unassigned tasks if local storage tasks were previously accepted/completed
      if (available.length === 0) {
        const freshSeed: DeliveryTask[] = [
          {
            id: `del_avail_${Date.now()}_1`,
            donationId: `don_avail_${Date.now()}_1`,
            donorId: 'usr_donor_1',
            ngoId: 'ngo_1',
            volunteerId: null,
            volunteerName: null,
            volunteerPhone: null,
            donorName: 'Grand Hyatt Metro Canteen',
            donorPhone: '+1 (555) 0192-3344',
            ngoName: 'Helping Hands NGO Relief',
            ngoPhone: '+1 (555) 987-6543',
            pickupAddress: '742 Evergreen Terrace, Sector 4, Metropolis',
            pickupLatitude: 40.7128,
            pickupLongitude: -74.006,
            dropAddress: '105 Main St, Metropolis',
            dropLatitude: 40.72,
            dropLongitude: -74.0,
            foodName: 'Fresh Vegetable Biryani & Gravy Meals',
            foodCategory: 'Biryani',
            quantity: 45,
            unit: 'kg',
            specialInstructions: 'Collect from rear kitchen loading bay 2.',
            status: 'PENDING_ASSIGNMENT',
            distanceKm: 2.4,
            availableUntil: new Date(Date.now() + 86400000).toISOString(),
            createdAt: new Date().toISOString(),
            version: 1,
          },
          {
            id: `del_avail_${Date.now()}_2`,
            donationId: `don_avail_${Date.now()}_2`,
            donorId: 'usr_donor_1',
            ngoId: 'ngo_2',
            volunteerId: null,
            volunteerName: null,
            volunteerPhone: null,
            donorName: 'Metropolis Bakery Canteen',
            donorPhone: '+1 (555) 234-5678',
            ngoName: 'Community Food Bank Shelter',
            ngoPhone: '+1 (555) 444-5555',
            pickupAddress: '12 Market Square, Metropolis',
            pickupLatitude: 40.715,
            pickupLongitude: -74.008,
            dropAddress: '220 Hope Avenue, Metropolis',
            dropLatitude: 40.73,
            dropLongitude: -74.01,
            foodName: 'Artisan Whole Wheat Rolls & Pastries',
            foodCategory: 'Bakery',
            quantity: 20,
            unit: 'boxes',
            specialInstructions: 'Handle bakery boxes with care.',
            status: 'PENDING_ASSIGNMENT',
            distanceKm: 3.1,
            availableUntil: new Date(Date.now() + 86400000).toISOString(),
            createdAt: new Date().toISOString(),
            version: 1,
          },
        ];
        deliveries = [...deliveries, ...freshSeed];
        saveStoredDeliveries(deliveries);
        available = freshSeed;
      }

      return available;
    }
  },

  // GET /api/deliveries/my — Get active and past deliveries for authenticated volunteer
  getVolunteerDeliveries: async (): Promise<DeliveryTask[]> => {
    try {
      const res = await api.get<ApiResponse<DeliveryTask[]>>('/deliveries/my', { timeout: typeof window !== 'undefined' ? 3000 : 150 });
      if (res.data.data) return res.data.data;
      throw new Error(res.data.message || 'Failed to fetch volunteer deliveries');
    } catch {
      const profile = await volunteerService.getVolunteerProfile();
      const deliveries = getStoredDeliveries();
      return deliveries.filter((d) => d.volunteerId === profile.id);
    }
  },

  // GET /api/deliveries/{deliveryId} — Get delivery task details
  getDeliveryById: async (deliveryId: string): Promise<DeliveryTask | null> => {
    try {
      const res = await api.get<ApiResponse<DeliveryTask>>(`/deliveries/${deliveryId}`, { timeout: typeof window !== 'undefined' ? 3000 : 150 });
      if (res.data.data) return res.data.data;
      return null;
    } catch {
      const deliveries = getStoredDeliveries();
      return deliveries.find((d) => d.id === deliveryId) || null;
    }
  },

  // GET /api/deliveries/donation/{donationId} — Get delivery status by donation ID
  getDeliveryByDonationId: async (donationId: string): Promise<DeliveryTask | null> => {
    try {
      const res = await api.get<ApiResponse<DeliveryTask>>(`/deliveries/donation/${donationId}`, { timeout: typeof window !== 'undefined' ? 3000 : 150 });
      if (res.data.data) return res.data.data;
      return null;
    } catch {
      const deliveries = getStoredDeliveries();
      return deliveries.find((d) => d.donationId === donationId) || null;
    }
  },

  // POST /api/deliveries/{deliveryId}/accept — Volunteer accepts a delivery task (With Mutex Concurrency Lock)
  acceptDeliveryTask: async (deliveryId: string, notes?: string): Promise<DeliveryTask> => {
    try {
      const res = await api.post<ApiResponse<DeliveryTask>>(`/deliveries/${deliveryId}/accept`, { notes });
      if (res.data.data) return res.data.data;
      throw new Error(res.data.message || 'Failed to accept delivery task');
    } catch (err: unknown) {
      const lockAcquired = await acquireDeliveryLock();
      if (!lockAcquired) {
        throw new Error('CONFLICT: Simultaneous delivery acceptance request in progress. Please try again.');
      }

      try {
        const profile = await volunteerService.getVolunteerProfile();
        const eligibility = volunteerService.verifyVolunteerEligibility(profile);
        if (!eligibility.eligible) {
          throw new Error(`UNAUTHORIZED: ${eligibility.reason}`);
        }

        const deliveries = getStoredDeliveries();
        const activeTask = deliveries.find(
          (d) => d.volunteerId === profile.id && d.status !== 'DELIVERED' && d.status !== 'CANCELLED' && d.status !== 'FAILED'
        );
        if (activeTask) {
          throw new Error('BUSY: You are already handling another active delivery task.');
        }

        const taskIndex = deliveries.findIndex((d) => d.id === deliveryId);
        if (taskIndex < 0) {
          throw new Error(`NOT_FOUND: Delivery task #${deliveryId} not found.`);
        }

        const task = deliveries[taskIndex];

        // CONCURRENCY CONTROL / OPTIMISTIC LOCK CHECK
        if (task.status !== 'PENDING_ASSIGNMENT' || task.volunteerId) {
          throw new Error('CONFLICT: This delivery task has already been accepted by another volunteer.');
        }

        // Expiration check
        const now = new Date();
        const untilDate = new Date(task.availableUntil);
        if (!isNaN(untilDate.getTime()) && untilDate < now) {
          throw new Error('EXPIRED: This donation window has expired and cannot be picked up.');
        }

        const nowStr = now.toISOString();

        // Perform atomic update
        task.volunteerId = profile.id;
        task.volunteerName = profile.fullName;
        task.volunteerPhone = profile.phone;
        task.status = 'ACCEPTED';
        task.acceptedAt = nowStr;
        task.assignedAt = nowStr;
        task.updatedAt = nowStr;
        task.version += 1;

        deliveries[taskIndex] = task;
        saveStoredDeliveries(deliveries);

        // Update Volunteer Availability -> BUSY
        await volunteerService.updateAvailability('BUSY');

        // Trigger Module 8 Notifications: VOLUNTEER_ASSIGNED & DELIVERY_ACCEPTED
        try {
          // Notify Donor
          await notificationService.createNotification({
            userId: task.donorId || 'usr_donor_1',
            type: 'VOLUNTEER_ASSIGNED',
            title: 'Volunteer Assigned',
            message: `Volunteer ${profile.fullName} has accepted the delivery task to transport '${task.foodName}'.`,
            priority: 'NORMAL',
            referenceType: 'DELIVERY',
            referenceId: task.id,
          });

          // Notify NGO
          await notificationService.createNotification({
            userId: task.ngoId || 'ngo_1',
            type: 'VOLUNTEER_ASSIGNED',
            title: 'Volunteer Assigned to Delivery',
            message: `Volunteer ${profile.fullName} has accepted the delivery task for '${task.foodName}'.`,
            priority: 'NORMAL',
            referenceType: 'DELIVERY',
            referenceId: task.id,
          });

          // Notify Volunteer
          await notificationService.createNotification({
            userId: profile.id,
            type: 'DELIVERY_ACCEPTED',
            title: 'Delivery Task Accepted',
            message: `You accepted the delivery task for '${task.foodName}'. Please proceed to donor location for pickup.`,
            priority: 'NORMAL',
            referenceType: 'DELIVERY',
            referenceId: task.id,
          });
        } catch {
          /* ignore notification errors */
        }

        return task;
      } finally {
        releaseDeliveryLock();
      }
    }
  },

  // POST /api/deliveries/{deliveryId}/pickup — Mark food as picked up from donor
  confirmPickup: async (deliveryId: string, notes?: string, proofImageUrl?: string): Promise<DeliveryTask> => {
    try {
      const res = await api.post<ApiResponse<DeliveryTask>>(`/deliveries/${deliveryId}/pickup`, { notes, proofImageUrl });
      if (res.data.data) return res.data.data;
      throw new Error(res.data.message || 'Failed to confirm pickup');
    } catch {
      const profile = await volunteerService.getVolunteerProfile();
      const deliveries = getStoredDeliveries();
      const taskIndex = deliveries.findIndex((d) => d.id === deliveryId);
      if (taskIndex < 0) throw new Error('Delivery task not found');

      const task = deliveries[taskIndex];
      if (task.volunteerId !== profile.id) {
        throw new Error('FORBIDDEN: You can only update your own assigned delivery task.');
      }
      if (task.status !== 'ACCEPTED' && task.status !== 'PICKUP_PENDING') {
        throw new Error(`INVALID_TRANSITION: Delivery status '${task.status}' cannot transition to PICKED_UP.`);
      }

      const nowStr = new Date().toISOString();
      task.status = 'PICKED_UP';
      task.pickedUpAt = nowStr;
      task.updatedAt = nowStr;
      task.version += 1;

      deliveries[taskIndex] = task;
      saveStoredDeliveries(deliveries);

      // Record Pickup Confirmation
      const confirmations = getStoredPickupConfirmations();
      confirmations.push({
        id: `pk_${Date.now()}`,
        deliveryId: task.id,
        volunteerId: profile.id,
        confirmedAt: nowStr,
        notes,
        proofImageUrl,
      });
      saveStoredPickupConfirmations(confirmations);

      // Trigger Module 8 Notification: FOOD_PICKED_UP
      try {
        await notificationService.createNotification({
          userId: task.ngoId || 'ngo_1',
          type: 'FOOD_PICKED_UP',
          title: 'Food Picked Up',
          message: `Volunteer ${profile.fullName} picked up '${task.foodName}' from the donor and is preparing for transit.`,
          priority: 'NORMAL',
          referenceType: 'DELIVERY',
          referenceId: task.id,
        });

        await notificationService.createNotification({
          userId: task.donorId || 'usr_donor_1',
          type: 'FOOD_PICKED_UP',
          title: 'Donation Picked Up',
          message: `Your food donation for '${task.foodName}' was picked up successfully by volunteer ${profile.fullName}.`,
          priority: 'NORMAL',
          referenceType: 'DELIVERY',
          referenceId: task.id,
        });
      } catch {
        /* ignore notification errors */
      }

      return task;
    }
  },

  // POST /api/deliveries/{deliveryId}/start — Start transport (IN_TRANSIT)
  startDelivery: async (deliveryId: string): Promise<DeliveryTask> => {
    try {
      const res = await api.post<ApiResponse<DeliveryTask>>(`/deliveries/${deliveryId}/start`);
      if (res.data.data) return res.data.data;
      throw new Error(res.data.message || 'Failed to start delivery');
    } catch {
      const profile = await volunteerService.getVolunteerProfile();
      const deliveries = getStoredDeliveries();
      const taskIndex = deliveries.findIndex((d) => d.id === deliveryId);
      if (taskIndex < 0) throw new Error('Delivery task not found');

      const task = deliveries[taskIndex];
      if (task.volunteerId !== profile.id) {
        throw new Error('FORBIDDEN: You can only update your own assigned delivery task.');
      }
      if (task.status !== 'PICKED_UP') {
        throw new Error(`INVALID_TRANSITION: Delivery status '${task.status}' cannot transition to IN_TRANSIT.`);
      }

      const nowStr = new Date().toISOString();
      task.status = 'IN_TRANSIT';
      task.inTransitAt = nowStr;
      task.updatedAt = nowStr;
      task.version += 1;

      deliveries[taskIndex] = task;
      saveStoredDeliveries(deliveries);

      // Trigger Module 8 Notification: DELIVERY_STARTED
      try {
        await notificationService.createNotification({
          userId: task.ngoId || 'ngo_1',
          type: 'DELIVERY_STARTED',
          title: 'Delivery in Transit',
          message: `Volunteer ${profile.fullName} has started transit for '${task.foodName}' heading to your center.`,
          priority: 'NORMAL',
          referenceType: 'DELIVERY',
          referenceId: task.id,
        });
      } catch {
        /* ignore notification errors */
      }

      return task;
    }
  },

  // POST /api/deliveries/{deliveryId}/complete — Complete delivery to NGO
  completeDelivery: async (deliveryId: string, notes?: string, proofImageUrl?: string): Promise<DeliveryTask> => {
    try {
      const res = await api.post<ApiResponse<DeliveryTask>>(`/deliveries/${deliveryId}/complete`, { notes, proofImageUrl });
      if (res.data.data) return res.data.data;
      throw new Error(res.data.message || 'Failed to complete delivery');
    } catch {
      const profile = await volunteerService.getVolunteerProfile();
      const deliveries = getStoredDeliveries();
      const taskIndex = deliveries.findIndex((d) => d.id === deliveryId);
      if (taskIndex < 0) throw new Error('Delivery task not found');

      const task = deliveries[taskIndex];
      if (task.volunteerId !== profile.id) {
        throw new Error('FORBIDDEN: You can only update your own assigned delivery task.');
      }
      if (task.status !== 'IN_TRANSIT') {
        throw new Error(`INVALID_TRANSITION: Delivery status '${task.status}' cannot transition to DELIVERED.`);
      }

      const nowStr = new Date().toISOString();
      task.status = 'DELIVERED';
      task.deliveredAt = nowStr;
      task.updatedAt = nowStr;
      task.version += 1;

      deliveries[taskIndex] = task;
      saveStoredDeliveries(deliveries);

      // Record Delivery Proof
      const proofs = getStoredDeliveryProofs();
      proofs.push({
        id: `prf_${Date.now()}`,
        deliveryId: task.id,
        volunteerId: profile.id,
        confirmedAt: nowStr,
        notes,
        proofImageUrl,
      });
      saveStoredDeliveryProofs(proofs);

      // Update Donation Status -> DELIVERED
      const allDonationsRaw = localStorage.getItem(DONATIONS_STORAGE_KEY);
      if (allDonationsRaw) {
        try {
          const donationsList: FoodDonation[] = JSON.parse(allDonationsRaw);
          const donIdx = donationsList.findIndex((d) => d.id === task.donationId);
          if (donIdx >= 0) {
            donationsList[donIdx].status = 'DELIVERED';
            donationsList[donIdx].assignedVolunteerId = profile.id;
            donationsList[donIdx].assignedVolunteerName = profile.fullName;
            donationsList[donIdx].assignedVolunteerPhone = profile.phone;
            donationsList[donIdx].updatedAt = nowStr;
            localStorage.setItem(DONATIONS_STORAGE_KEY, JSON.stringify(donationsList));
          }
        } catch {
          /* ignore */
        }
      }

      // Reset Volunteer Availability -> AVAILABLE
      await volunteerService.updateAvailability('AVAILABLE');

      // Trigger Module 8 Notifications: DELIVERY_COMPLETED
      try {
        // Notify Donor
        await notificationService.createNotification({
          userId: task.donorId || 'usr_donor_1',
          type: 'DELIVERY_COMPLETED',
          title: 'Donation Delivered Successfully!',
          message: `Your surplus food donation '${task.foodName}' has been delivered to ${task.ngoName}. Thank you for making a difference!`,
          priority: 'HIGH',
          referenceType: 'DELIVERY',
          referenceId: task.id,
        });

        // Notify NGO
        await notificationService.createNotification({
          userId: task.ngoId || 'ngo_1',
          type: 'DELIVERY_COMPLETED',
          title: 'Food Donation Delivered',
          message: `Food donation '${task.foodName}' (${task.quantity} ${task.unit}) has been delivered to your center.`,
          priority: 'HIGH',
          referenceType: 'DELIVERY',
          referenceId: task.id,
        });

        // Notify Volunteer
        await notificationService.createNotification({
          userId: profile.id,
          type: 'DELIVERY_COMPLETED',
          title: 'Delivery Mission Completed!',
          message: `You successfully completed the delivery task for '${task.foodName}'. Thank you for your volunteer service!`,
          priority: 'HIGH',
          referenceType: 'DELIVERY',
          referenceId: task.id,
        });
      } catch {
        /* ignore notification errors */
      }

      return task;
    }
  },
};
