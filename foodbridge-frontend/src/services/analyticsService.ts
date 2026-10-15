import api from './api';
import type { ApiResponse } from '../types';

export interface PeriodData {
  from: string;
  to: string;
  timezone: string;
}

export interface TrendPoint {
  date: string;
  donationsCreated: number;
  foodOfferedKg: number;
  foodDistributedKg: number;
  deliveriesCompleted: number;
}

export interface DistributionStatus {
  status: string;
  count: number;
  foodKg: number;
  percentage: number;
}

export interface RecentActivity {
  type: string;
  code: string;
  title: string;
  description: string;
  status: string;
  timestamp: string;
}

export interface AdminOverviewData {
  period: PeriodData;
  totalDonors: number;
  totalNGOs: number;
  totalVolunteers: number;
  donationsCreatedToday: number;
  foodDonatedTodayKg: number;
  foodDistributedTodayKg: number;
  pendingDonations: number;
  acceptedDonations: number;
  inProgressDonations: number;
  completedDonations: number;
  cancelledDonations: number;
  expiredDonations: number;
  activeNGOs: number;
  activeVolunteers: number;
  completionRate: number;
  totalFoodOfferedKg: number;
  totalFoodDistributedKg: number;
  recentActivities: RecentActivity[];
  lastUpdated: string;
}

export interface NGOOverviewData {
  period: PeriodData;
  newOffersAvailable: number;
  offersAccepted: number;
  upcomingPickups: number;
  pendingDeliveries: number;
  completedPickups: number;
  foodReceivedTodayKg: number;
  dailyCapacityKg: number;
  remainingCapacityKg: number;
  capacityUtilizationRate: number;
  recentReceipts: any[];
  weeklyTrends: TrendPoint[];
  lastUpdated: string;
}

export interface DonorOverviewData {
  period: PeriodData;
  donationsCreatedToday: number;
  activeOffers: number;
  acceptedOffers: number;
  completedDistributions: number;
  cancelledOrExpiredOffers: number;
  totalFoodOfferedKg: number;
  totalFoodDistributedKg: number;
  todayFoodOfferedKg: number;
  todayFoodDistributedKg: number;
  recentDonations: any[];
  monthlyTrends: TrendPoint[];
  lastUpdated: string;
}

export interface VolunteerOverviewData {
  period: PeriodData;
  assignedDeliveries: number;
  pickupsAwaitingAction: number;
  deliveriesInProgress: number;
  completedDeliveries: number;
  cancelledTasks: number;
  todayDeliveriesCompleted: number;
  totalKmEstimated: number;
  recentDeliveries: any[];
  weeklyTrends: TrendPoint[];
  lastUpdated: string;
}

// Local mock storage helpers
const DONATIONS_STORAGE_KEY = 'foodbridge_mock_donations';
const DELIVERY_TASKS_STORAGE_KEY = 'foodbridge_mock_delivery_tasks';
const ADMIN_USERS_STORAGE = 'foodbridge_admin_users';

const getMockDonations = (): any[] => {
  const raw = localStorage.getItem(DONATIONS_STORAGE_KEY);
  if (raw) {
    try { return JSON.parse(raw); } catch { /* ignore */ }
  }
  return [
    { id: 'DON-1001', donorName: 'Grand Hyatt Metro Canteen', foodName: 'Fresh Vegetable Biryani', quantity: 45, unit: 'kg', status: 'AVAILABLE', createdAt: new Date().toISOString() },
    { id: 'DON-1002', donorName: 'Grand Hyatt Metro Canteen', foodName: 'Artisan Bread Rolls', quantity: 20, unit: 'boxes', status: 'ACCEPTED', matchedNgoName: 'Hope Harvest Foundation', createdAt: new Date().toISOString() },
    { id: 'DON-1003', donorName: 'Grand Hyatt Metro Canteen', foodName: 'Sealed Fruit Juice Packs', quantity: 85, unit: 'packets', status: 'DELIVERED', matchedNgoName: 'Hope Harvest Foundation', deliveredAt: new Date().toISOString(), createdAt: new Date().toISOString() },
    { id: 'DON-1004', donorName: 'Grand Hyatt Metro Canteen', foodName: 'Mixed Vegetable Pulao', quantity: 30, unit: 'kg', status: 'EXPIRED', createdAt: new Date(Date.now() - 86400000).toISOString() },
  ];
};

const getMockDeliveries = (): any[] => {
  const raw = localStorage.getItem(DELIVERY_TASKS_STORAGE_KEY);
  if (raw) {
    try { return JSON.parse(raw); } catch { /* ignore */ }
  }
  return [
    { id: 'DEL-101', deliveryCode: 'DEL-101', donationCode: 'DON-1002', donorName: 'Grand Hyatt Metro Canteen', pickupAddress: '742 Gopal Nagar, Ongole', ngoName: 'Hope Harvest Foundation', destinationAddress: '108 Compassion Ave, Ongole', volunteerName: 'David Miller', status: 'IN_TRANSIT', createdAt: new Date().toISOString() },
    { id: 'DEL-100', deliveryCode: 'DEL-100', donationCode: 'DON-1003', donorName: 'Grand Hyatt Metro Canteen', pickupAddress: '742 Gopal Nagar, Ongole', ngoName: 'Hope Harvest Foundation', destinationAddress: '108 Compassion Ave, Ongole', volunteerName: 'David Miller', status: 'DELIVERED', deliveredAt: new Date().toISOString(), createdAt: new Date().toISOString() },
  ];
};

const getMockUsers = (): any[] => {
  const raw = localStorage.getItem(ADMIN_USERS_STORAGE);
  if (raw) {
    try { return JSON.parse(raw); } catch { /* ignore */ }
  }
  return [
    { id: 1, role: 'ADMIN', active: true },
    { id: 2, role: 'DONOR', active: true },
    { id: 3, role: 'NGO', active: true, maxCapacity: 250 },
    { id: 4, role: 'NGO', active: true, maxCapacity: 150 },
    { id: 5, role: 'VOLUNTEER', active: true },
    { id: 6, role: 'VOLUNTEER', active: true },
  ];
};

export const analyticsService = {
  // Admin Overview
  getAdminOverview: async (from?: string, to?: string): Promise<AdminOverviewData> => {
    try {
      const res = await api.get<ApiResponse<AdminOverviewData>>('/analytics/admin/overview', { params: { from, to } });
      if (res.data.data) return res.data.data;
      throw new Error();
    } catch {
      const donations = getMockDonations();
      const deliveries = getMockDeliveries();
      const users = getMockUsers();

      const donors = users.filter((u) => u.role === 'DONOR').length;
      const ngos = users.filter((u) => u.role === 'NGO').length;
      const vols = users.filter((u) => u.role === 'VOLUNTEER').length;

      const completed = donations.filter((d) => d.status === 'DELIVERED').length;
      const pending = donations.filter((d) => d.status === 'AVAILABLE' || d.status === 'MATCHING').length;
      const accepted = donations.filter((d) => d.status === 'ACCEPTED' || d.status === 'MATCHED').length;
      const inProg = donations.filter((d) => d.status === 'PICKUP_PENDING' || d.status === 'PICKED_UP' || d.status === 'IN_TRANSIT').length;
      const cancelled = donations.filter((d) => d.status === 'CANCELLED').length;
      const expired = donations.filter((d) => d.status === 'EXPIRED').length;

      const totalFoodOffered = donations.reduce((sum, d) => sum + (Number(d.quantity) || 0), 0);
      const totalFoodDistributed = donations.filter((d) => d.status === 'DELIVERED').reduce((sum, d) => sum + (Number(d.quantity) || 0), 0);

      const eligible = completed + expired + cancelled;
      const completionRate = eligible > 0 ? Math.round((completed * 100.0 / eligible) * 10) / 10 : 75.0;

      return {
        period: { from: from || new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0], to: to || new Date().toISOString().split('T')[0], timezone: 'Asia/Kolkata' },
        totalDonors: donors || 1,
        totalNGOs: ngos || 2,
        totalVolunteers: vols || 2,
        donationsCreatedToday: donations.length,
        foodDonatedTodayKg: totalFoodOffered,
        foodDistributedTodayKg: totalFoodDistributed,
        pendingDonations: pending,
        acceptedDonations: accepted,
        inProgressDonations: inProg,
        completedDonations: completed,
        cancelledDonations: cancelled,
        expiredDonations: expired,
        activeNGOs: ngos || 2,
        activeVolunteers: vols || 2,
        completionRate,
        totalFoodOfferedKg: totalFoodOffered,
        totalFoodDistributedKg: totalFoodDistributed,
        recentActivities: [
          ...donations.slice(0, 3).map((d) => ({
            type: 'DONATION' as const,
            code: d.donationCode || `DON-${d.id}`,
            title: d.foodTitle || 'Surplus Food Batch',
            description: `${d.donorName || 'Donor'} (${d.quantity} kg)`,
            status: d.status,
            timestamp: d.createdAt || new Date().toISOString(),
          })),
          ...deliveries.slice(0, 3).map((del) => ({
            type: 'DELIVERY' as const,
            code: del.deliveryCode || `DEL-${del.id}`,
            title: del.ngoName || 'NGO Destination',
            description: `Assigned to ${del.volunteerName || 'Volunteer'} (${del.status})`,
            status: del.status,
            timestamp: del.createdAt || new Date().toISOString(),
          })),
        ],
        lastUpdated: new Date().toISOString(),
      };
    }
  },

  // Admin Trends
  getAdminTrends: async (period: string = 'week'): Promise<TrendPoint[]> => {
    try {
      const res = await api.get<ApiResponse<TrendPoint[]>>('/analytics/admin/trends', { params: { period } });
      if (res.data.data) return res.data.data;
      throw new Error();
    } catch {
      const days = period === 'day' ? 1 : period === 'month' ? 30 : 7;
      const list: TrendPoint[] = [];
      const now = new Date();
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 86400000);
        const dateStr = d.toISOString().split('T')[0];
        list.push({
          date: dateStr,
          donationsCreated: i === 0 ? 3 : Math.floor(Math.random() * 2) + 1,
          foodOfferedKg: i === 0 ? 65 : 25 + (i * 7) % 30,
          foodDistributedKg: i === 0 ? 45 : 20 + (i * 5) % 25,
          deliveriesCompleted: i === 0 ? 2 : Math.floor(Math.random() * 2),
        });
      }
      return list;
    }
  },

  // Admin Distribution Status
  getAdminDistributionStatus: async (): Promise<DistributionStatus[]> => {
    try {
      const res = await api.get<ApiResponse<DistributionStatus[]>>('/analytics/admin/distribution-status');
      if (res.data.data) return res.data.data;
      throw new Error();
    } catch {
      return [
        { status: 'AVAILABLE', count: 1, foodKg: 45, percentage: 25.0 },
        { status: 'ACCEPTED', count: 1, foodKg: 20, percentage: 25.0 },
        { status: 'DELIVERED', count: 1, foodKg: 85, percentage: 25.0 },
        { status: 'EXPIRED', count: 1, foodKg: 30, percentage: 25.0 },
      ];
    }
  },

  // NGO Overview
  getNGOOverview: async (ngoId?: number | string): Promise<NGOOverviewData> => {
    try {
      const res = await api.get<ApiResponse<NGOOverviewData>>('/analytics/ngo/overview', { params: { ngoId } });
      if (res.data.data) return res.data.data;
      throw new Error();
    } catch {
      const donations = getMockDonations();
      const completed = donations.filter((d) => d.status === 'DELIVERED');
      const foodToday = completed.reduce((sum, d) => sum + (Number(d.quantity) || 0), 0);
      const dailyCap = 250;
      // Formula: remaining capacity = max(0, daily capacity - food received today)
      const remaining = Math.max(0, dailyCap - foodToday);
      const util = Math.round((foodToday / dailyCap) * 1000) / 10;

      const weekly: TrendPoint[] = [];
      const now = new Date();
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 86400000);
        weekly.push({
          date: d.toISOString().split('T')[0],
          donationsCreated: 0,
          foodOfferedKg: 0,
          foodDistributedKg: i === 0 ? foodToday : (15 + (i * 8) % 35),
          deliveriesCompleted: i === 0 ? 1 : 1,
        });
      }

      return {
        period: { from: new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0], to: new Date().toISOString().split('T')[0], timezone: 'Asia/Kolkata' },
        newOffersAvailable: donations.filter((d) => d.status === 'AVAILABLE' || d.status === 'MATCHED').length,
        offersAccepted: donations.filter((d) => d.status === 'ACCEPTED').length,
        upcomingPickups: donations.filter((d) => d.status === 'PICKUP_PENDING').length,
        pendingDeliveries: donations.filter((d) => d.status === 'IN_TRANSIT').length,
        completedPickups: completed.length,
        foodReceivedTodayKg: foodToday,
        dailyCapacityKg: dailyCap,
        remainingCapacityKg: remaining,
        capacityUtilizationRate: util,
        recentReceipts: completed,
        weeklyTrends: weekly,
        lastUpdated: new Date().toISOString(),
      };
    }
  },

  // Donor Overview
  getDonorOverview: async (donorId?: number | string): Promise<DonorOverviewData> => {
    try {
      const res = await api.get<ApiResponse<DonorOverviewData>>('/analytics/donor/overview', { params: { donorId } });
      if (res.data.data) return res.data.data;
      throw new Error();
    } catch {
      const donations = getMockDonations();
      const totalOffered = donations.reduce((sum, d) => sum + (Number(d.quantity) || 0), 0);
      const totalDist = donations.filter((d) => d.status === 'DELIVERED').reduce((sum, d) => sum + (Number(d.quantity) || 0), 0);

      const trends: TrendPoint[] = [];
      const now = new Date();
      for (let i = 21; i >= 0; i -= 7) {
        const d = new Date(now.getTime() - i * 86400000);
        trends.push({
          date: d.toISOString().split('T')[0],
          donationsCreated: 1,
          foodOfferedKg: 30 + (i * 3) % 25,
          foodDistributedKg: 20 + (i * 2) % 20,
          deliveriesCompleted: 1,
        });
      }

      return {
        period: { from: new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0], to: new Date().toISOString().split('T')[0], timezone: 'Asia/Kolkata' },
        donationsCreatedToday: donations.length,
        activeOffers: donations.filter((d) => d.status === 'AVAILABLE' || d.status === 'MATCHING').length,
        acceptedOffers: donations.filter((d) => d.status === 'ACCEPTED' || d.status === 'IN_TRANSIT').length,
        completedDistributions: donations.filter((d) => d.status === 'DELIVERED').length,
        cancelledOrExpiredOffers: donations.filter((d) => d.status === 'CANCELLED' || d.status === 'EXPIRED').length,
        totalFoodOfferedKg: totalOffered,
        totalFoodDistributedKg: totalDist,
        todayFoodOfferedKg: totalOffered,
        todayFoodDistributedKg: totalDist,
        recentDonations: donations.slice(0, 5),
        monthlyTrends: trends,
        lastUpdated: new Date().toISOString(),
      };
    }
  },

  // Volunteer Overview
  getVolunteerOverview: async (volunteerId?: number | string): Promise<VolunteerOverviewData> => {
    try {
      const res = await api.get<ApiResponse<VolunteerOverviewData>>('/analytics/volunteer/overview', { params: { volunteerId } });
      if (res.data.data) return res.data.data;
      throw new Error();
    } catch {
      const deliveries = getMockDeliveries();
      const completed = deliveries.filter((d) => d.status === 'DELIVERED').length;
      const inProg = deliveries.filter((d) => d.status === 'IN_TRANSIT' || d.status === 'PICKED_UP').length;
      const awaiting = deliveries.filter((d) => d.status === 'PENDING_ASSIGNMENT' || d.status === 'ACCEPTED' || d.status === 'PICKUP_PENDING').length;

      const weekly: TrendPoint[] = [];
      const now = new Date();
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 86400000);
        weekly.push({
          date: d.toISOString().split('T')[0],
          donationsCreated: 0,
          foodOfferedKg: 0,
          foodDistributedKg: 0,
          deliveriesCompleted: i === 0 ? completed : (i % 2 === 0 ? 1 : 2),
        });
      }

      return {
        period: { from: new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0], to: new Date().toISOString().split('T')[0], timezone: 'Asia/Kolkata' },
        assignedDeliveries: deliveries.length,
        pickupsAwaitingAction: awaiting,
        deliveriesInProgress: inProg,
        completedDeliveries: completed,
        cancelledTasks: deliveries.filter((d) => d.status === 'CANCELLED').length,
        todayDeliveriesCompleted: completed,
        totalKmEstimated: Math.round(completed * 5.2 * 10) / 10,
        recentDeliveries: deliveries.slice(0, 5),
        weeklyTrends: weekly,
        lastUpdated: new Date().toISOString(),
      };
    }
  },

  // History
  getDonationsHistory: async (from?: string, to?: string): Promise<any[]> => {
    try {
      const res = await api.get<ApiResponse<any[]>>('/analytics/donations/history', { params: { from, to } });
      if (res.data.data) return res.data.data;
      throw new Error();
    } catch {
      return getMockDonations();
    }
  },

  getDeliveriesHistory: async (from?: string, to?: string): Promise<any[]> => {
    try {
      const res = await api.get<ApiResponse<any[]>>('/analytics/deliveries/history', { params: { from, to } });
      if (res.data.data) return res.data.data;
      throw new Error();
    } catch {
      return getMockDeliveries();
    }
  },
};
