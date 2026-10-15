import api from './api';
import type { ApiResponse } from '../types';

export interface AdminSummaryData {
  totalUsers: number;
  totalNGOs: number;
  verifiedNGOs: number;
  pendingNGOs: number;
  totalVolunteers: number;
  pendingVolunteers: number;
  totalDonations: number;
  activeDonations: number;
  acceptedDonations: number;
  deliveredDonations: number;
  expiredDonations: number;
  activeDeliveries: number;
  totalFoodDistributedKg: number;
  todayFoodDistributedKg: number;
  todayDonations: number;
  todayDeliveries: number;
  systemMatchingRate: number;
}

export interface AdminUserRecord {
  id: number | string;
  name: string;
  email: string;
  role: 'DONOR' | 'NGO' | 'VOLUNTEER' | 'ADMIN';
  phone?: string;
  active: boolean;
  organizationName?: string;
  address?: string;
  city?: string;
  verificationStatus?: 'PENDING' | 'UNDER_REVIEW' | 'VERIFIED' | 'REJECTED' | 'SUSPENDED';
  verificationReason?: string;
  vehicleType?: string;
  maxCapacity?: number;
  availableCapacity?: number;
  lastActivity?: string;
  createdAt?: string;
}

export interface AdminDonationRecord {
  id: number | string;
  donationCode: string;
  donorId?: number | string;
  donorName: string;
  donorCity?: string;
  donorAddress?: string;
  foodName: string;
  foodCategory: string;
  quantity: number;
  unit: string;
  status: string;
  matchedNgoId?: number | string;
  matchedNgoName?: string;
  assignedVolunteerId?: number | string;
  assignedVolunteerName?: string;
  availableUntil?: string;
  searchRadiusKm?: number;
  matchingStage?: string;
  createdAt: string;
  deliveredAt?: string;
}

export interface AdminDeliveryRecord {
  id: number | string;
  deliveryCode: string;
  donationId?: number | string;
  donationCode?: string;
  donorName: string;
  pickupAddress: string;
  ngoName: string;
  destinationAddress: string;
  volunteerId?: number | string;
  volunteerName?: string;
  status: string;
  assignedAt?: string;
  pickedUpAt?: string;
  deliveredAt?: string;
  lastVolunteerLat?: number;
  lastVolunteerLng?: number;
  isDelayed?: boolean;
  createdAt?: string;
}

export interface AdminMatchRecord {
  id: number | string;
  donationId: number | string;
  donationCode: string;
  ngoId: number | string;
  ngoName: string;
  distanceKm: number;
  searchRadiusKm: number;
  status: string;
  offeredAt: string;
  respondedAt?: string;
}

export interface AdminIssueRecord {
  id: number | string;
  category: string;
  title: string;
  description: string;
  status: 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED' | 'DISMISSED';
  relatedEntityType?: string;
  relatedEntityId?: string;
  reportedBy?: string;
  assignedAdmin?: string;
  resolutionNotes?: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface AdminSettingRecord {
  id: number | string;
  settingKey: string;
  settingValue: string;
  description: string;
  category: string;
  updatedBy?: string;
  updatedAt?: string;
}

export interface AdminAuditLogRecord {
  id: number | string;
  actorAdminId?: number | string;
  actorAdminEmail: string;
  action: string;
  entityType: string;
  entityId?: string;
  previousState?: string;
  newState?: string;
  reason?: string;
  createdAt: string;
}

// Local storage keys for robust offline demonstration
const ADMIN_USERS_STORAGE = 'foodbridge_admin_users';
const ADMIN_ISSUES_STORAGE = 'foodbridge_admin_issues';
const ADMIN_SETTINGS_STORAGE = 'foodbridge_admin_settings';
const ADMIN_LOGS_STORAGE = 'foodbridge_admin_audit_logs';

const getInitialMockAdminUsers = (): AdminUserRecord[] => {
  const raw = localStorage.getItem(ADMIN_USERS_STORAGE);
  if (raw) {
    try { return JSON.parse(raw); } catch { /* ignore */ }
  }
  const defaults: AdminUserRecord[] = [
    {
      id: 1,
      name: 'System Administrator',
      email: 'admin@foodbridge.org',
      role: 'ADMIN',
      phone: '+1 555-0100',
      active: true,
      organizationName: 'FoodBridge Operations',
      city: 'Ongole',
      verificationStatus: 'VERIFIED',
      createdAt: '2026-09-01T08:00:00Z',
    },
    {
      id: 2,
      name: 'Chef Marcus Vance',
      email: 'donor@foodbridge.org',
      role: 'DONOR',
      phone: '+1 555-0192',
      active: true,
      organizationName: 'Grand Hyatt Metro Canteen',
      address: '742 Evergreen Terrace',
      city: 'Ongole',
      verificationStatus: 'VERIFIED',
      createdAt: '2026-09-10T10:30:00Z',
    },
    {
      id: 3,
      name: 'Sarah Jenkins',
      email: 'ngo@foodbridge.org',
      role: 'NGO',
      phone: '+1 555-0144',
      active: true,
      organizationName: 'Hope Harvest Foundation',
      address: '108 Compassion Ave',
      city: 'Ongole',
      verificationStatus: 'VERIFIED',
      maxCapacity: 250,
      availableCapacity: 205,
      createdAt: '2026-09-11T12:00:00Z',
    },
    {
      id: 4,
      name: 'Priya Sharma',
      email: 'helping@foodbridge.org',
      role: 'NGO',
      phone: '+1 555-0188',
      active: true,
      organizationName: 'Helping Hands Shelter',
      address: '54 Shelter Road',
      city: 'Vijayawada',
      verificationStatus: 'PENDING',
      maxCapacity: 150,
      availableCapacity: 150,
      createdAt: '2026-09-18T14:20:00Z',
    },
    {
      id: 5,
      name: 'David Miller',
      email: 'volunteer@foodbridge.org',
      role: 'VOLUNTEER',
      phone: '+1 555-0188',
      active: true,
      city: 'Ongole',
      verificationStatus: 'VERIFIED',
      vehicleType: 'Motorcycle / Scooter',
      createdAt: '2026-09-15T09:15:00Z',
    },
    {
      id: 6,
      name: 'Alex Rivera',
      email: 'alex@foodbridge.org',
      role: 'VOLUNTEER',
      phone: '+1 555-0199',
      active: true,
      city: 'Vijayawada',
      verificationStatus: 'PENDING',
      vehicleType: 'Electric Cargo Van',
      createdAt: '2026-09-20T16:45:00Z',
    },
  ];
  localStorage.setItem(ADMIN_USERS_STORAGE, JSON.stringify(defaults));
  return defaults;
};

const getInitialMockSettings = (): AdminSettingRecord[] => {
  const raw = localStorage.getItem(ADMIN_SETTINGS_STORAGE);
  if (raw) {
    try { return JSON.parse(raw); } catch { /* ignore */ }
  }
  const defaults: AdminSettingRecord[] = [
    { id: 1, settingKey: 'initial_matching_radius_km', settingValue: '5', description: 'Initial search radius for new food donations', category: 'Matching Engine', updatedBy: 'admin@foodbridge.org' },
    { id: 2, settingKey: 'radius_expansion_stages_km', settingValue: '5,10,15,20', description: 'Ordered sequence of radius expansion stages in kilometers', category: 'Matching Engine', updatedBy: 'admin@foodbridge.org' },
    { id: 3, settingKey: 'radius_expansion_interval_mins', settingValue: '30', description: 'Interval between successive radius expansion evaluations', category: 'Matching Engine', updatedBy: 'admin@foodbridge.org' },
    { id: 4, settingKey: 'max_matching_radius_km', settingValue: '20', description: 'Maximum ceiling distance for matching surplus food', category: 'Matching Engine', updatedBy: 'admin@foodbridge.org' },
    { id: 5, settingKey: 'delivery_delay_threshold_mins', settingValue: '45', description: 'Time after pickup before delivery is flagged as delayed', category: 'Delivery Tracking', updatedBy: 'admin@foodbridge.org' },
    { id: 6, settingKey: 'auto_expiration_check_enabled', settingValue: 'true', description: 'Automatically transition past availableUntil donations to EXPIRED', category: 'Safety Rules', updatedBy: 'admin@foodbridge.org' },
  ];
  localStorage.setItem(ADMIN_SETTINGS_STORAGE, JSON.stringify(defaults));
  return defaults;
};

const getInitialMockIssues = (): AdminIssueRecord[] => {
  const raw = localStorage.getItem(ADMIN_ISSUES_STORAGE);
  if (raw) {
    try { return JSON.parse(raw); } catch { /* ignore */ }
  }
  const defaults: AdminIssueRecord[] = [
    { id: 1, category: 'DONATION_COMPLAINT', title: 'Late pickup inquiry for DON-1004', description: 'Donor inquired why surplus vegetable pulao was not claimed before expiration window.', status: 'OPEN', relatedEntityType: 'DONATION', relatedEntityId: 'DON-1004', reportedBy: 'donor@foodbridge.org', createdAt: '2026-09-22T10:00:00Z' },
    { id: 2, category: 'NGO_VERIFICATION', title: 'Verify NGO registration document', description: 'Helping Hands Shelter submitted annual 80G tax exemption certificates.', status: 'UNDER_REVIEW', relatedEntityType: 'NGO', relatedEntityId: 'usr_ngo_2', reportedBy: 'helping@foodbridge.org', createdAt: '2026-09-23T11:30:00Z' },
    { id: 3, category: 'FAILED_DELIVERY', title: 'Traffic delay notification', description: 'Volunteer reported road construction on Compassion Ave causing 15m delay.', status: 'RESOLVED', relatedEntityType: 'DELIVERY', relatedEntityId: 'DEL-101', reportedBy: 'volunteer@foodbridge.org', resolutionNotes: 'Resolved via rerouting to alternative bypass road.', createdAt: '2026-09-24T14:15:00Z', resolvedAt: '2026-09-24T15:00:00Z' },
  ];
  localStorage.setItem(ADMIN_ISSUES_STORAGE, JSON.stringify(defaults));
  return defaults;
};

const getInitialMockLogs = (): AdminAuditLogRecord[] => {
  const raw = localStorage.getItem(ADMIN_LOGS_STORAGE);
  if (raw) {
    try { return JSON.parse(raw); } catch { /* ignore */ }
  }
  const defaults: AdminAuditLogRecord[] = [
    { id: 1, actorAdminEmail: 'admin@foodbridge.org', action: 'PLATFORM_INITIALIZATION', entityType: 'SYSTEM', entityId: 'SYS-01', newState: 'ACTIVE', reason: 'FoodBridge platform service initialized', createdAt: new Date(Date.now() - 86400000 * 2).toISOString() },
    { id: 2, actorAdminEmail: 'admin@foodbridge.org', action: 'NGO_VERIFIED', entityType: 'NGO', entityId: '3', previousState: 'PENDING', newState: 'VERIFIED', reason: 'Hope Harvest Foundation registration confirmed', createdAt: new Date(Date.now() - 86400000).toISOString() },
    { id: 3, actorAdminEmail: 'admin@foodbridge.org', action: 'VOLUNTEER_VERIFIED', entityType: 'VOLUNTEER', entityId: '5', previousState: 'PENDING', newState: 'VERIFIED', reason: 'David Miller credentials approved', createdAt: new Date(Date.now() - 3600000 * 4).toISOString() },
  ];
  localStorage.setItem(ADMIN_LOGS_STORAGE, JSON.stringify(defaults));
  return defaults;
};

const saveMockAuditLog = (action: string, entityType: string, entityId: string, prev: string | undefined, next: string, reason?: string) => {
  const logs = getInitialMockLogs();
  logs.unshift({
    id: Date.now(),
    actorAdminEmail: 'admin@foodbridge.org',
    action,
    entityType,
    entityId,
    previousState: prev,
    newState: next,
    reason: reason || 'Action performed by administrator',
    createdAt: new Date().toISOString(),
  });
  localStorage.setItem(ADMIN_LOGS_STORAGE, JSON.stringify(logs));
};

export const adminService = {
  // Dashboard Summary
  getDashboardSummary: async (): Promise<AdminSummaryData> => {
    try {
      const res = await api.get<ApiResponse<AdminSummaryData>>('/admin/dashboard/summary');
      if (res.data.data) return res.data.data;
      throw new Error();
    } catch {
      const users = getInitialMockAdminUsers();
      const ngos = users.filter((u) => u.role === 'NGO');
      const vols = users.filter((u) => u.role === 'VOLUNTEER');

      return {
        totalUsers: users.length,
        totalNGOs: ngos.length,
        verifiedNGOs: ngos.filter((n) => n.verificationStatus === 'VERIFIED').length,
        pendingNGOs: ngos.filter((n) => n.verificationStatus === 'PENDING').length,
        totalVolunteers: vols.length,
        pendingVolunteers: vols.filter((v) => v.verificationStatus === 'PENDING').length,
        totalDonations: 4,
        activeDonations: 1,
        acceptedDonations: 1,
        deliveredDonations: 1,
        expiredDonations: 1,
        activeDeliveries: 1,
        totalFoodDistributedKg: 150.0,
        todayFoodDistributedKg: 45.0,
        todayDonations: 1,
        todayDeliveries: 1,
        systemMatchingRate: 98.4,
      };
    }
  },

  // Recent Activity
  getRecentActivity: async (): Promise<AdminAuditLogRecord[]> => {
    try {
      const res = await api.get<ApiResponse<AdminAuditLogRecord[]>>('/admin/dashboard/recent-activity');
      if (res.data.data) return res.data.data;
      throw new Error();
    } catch {
      return getInitialMockLogs();
    }
  },

  // NGOs
  getNgos: async (status: string = 'ALL', search: string = ''): Promise<AdminUserRecord[]> => {
    try {
      const res = await api.get<ApiResponse<AdminUserRecord[]>>('/admin/ngos', { params: { status, search } });
      if (res.data.data) return res.data.data;
      throw new Error();
    } catch {
      const all = getInitialMockAdminUsers().filter((u) => u.role === 'NGO');
      return all.filter((u) => {
        if (status !== 'ALL' && u.verificationStatus !== status) return false;
        if (search) {
          const s = search.toLowerCase();
          return (
            (u.name && u.name.toLowerCase().includes(s)) ||
            (u.organizationName && u.organizationName.toLowerCase().includes(s)) ||
            (u.city && u.city.toLowerCase().includes(s))
          );
        }
        return true;
      });
    }
  },

  verifyNgo: async (id: number | string, reason?: string): Promise<AdminUserRecord> => {
    try {
      const res = await api.patch<ApiResponse<AdminUserRecord>>(`/admin/ngos/${id}/verify`, { reason });
      if (res.data.data) return res.data.data;
      throw new Error();
    } catch {
      const users = getInitialMockAdminUsers();
      const idx = users.findIndex((u) => String(u.id) === String(id));
      if (idx >= 0) {
        const old = users[idx].verificationStatus;
        users[idx].verificationStatus = 'VERIFIED';
        users[idx].verificationReason = reason;
        localStorage.setItem(ADMIN_USERS_STORAGE, JSON.stringify(users));
        saveMockAuditLog('NGO_VERIFIED', 'NGO', String(id), old, 'VERIFIED', reason || 'Verified and approved by admin');
        return users[idx];
      }
      throw new Error('NGO not found');
    }
  },

  rejectNgo: async (id: number | string, reason: string): Promise<AdminUserRecord> => {
    try {
      const res = await api.patch<ApiResponse<AdminUserRecord>>(`/admin/ngos/${id}/reject`, { reason });
      if (res.data.data) return res.data.data;
      throw new Error();
    } catch {
      const users = getInitialMockAdminUsers();
      const idx = users.findIndex((u) => String(u.id) === String(id));
      if (idx >= 0) {
        const old = users[idx].verificationStatus;
        users[idx].verificationStatus = 'REJECTED';
        users[idx].verificationReason = reason;
        localStorage.setItem(ADMIN_USERS_STORAGE, JSON.stringify(users));
        saveMockAuditLog('NGO_REJECTED', 'NGO', String(id), old, 'REJECTED', reason);
        return users[idx];
      }
      throw new Error('NGO not found');
    }
  },

  suspendNgo: async (id: number | string, reason: string): Promise<AdminUserRecord> => {
    try {
      const res = await api.patch<ApiResponse<AdminUserRecord>>(`/admin/ngos/${id}/suspend`, { reason });
      if (res.data.data) return res.data.data;
      throw new Error();
    } catch {
      const users = getInitialMockAdminUsers();
      const idx = users.findIndex((u) => String(u.id) === String(id));
      if (idx >= 0) {
        const old = users[idx].verificationStatus;
        users[idx].verificationStatus = 'SUSPENDED';
        users[idx].verificationReason = reason;
        localStorage.setItem(ADMIN_USERS_STORAGE, JSON.stringify(users));
        saveMockAuditLog('NGO_SUSPENDED', 'NGO', String(id), old, 'SUSPENDED', reason);
        return users[idx];
      }
      throw new Error('NGO not found');
    }
  },

  // Volunteers
  getVolunteers: async (status: string = 'ALL', search: string = ''): Promise<AdminUserRecord[]> => {
    try {
      const res = await api.get<ApiResponse<AdminUserRecord[]>>('/admin/volunteers', { params: { status, search } });
      if (res.data.data) return res.data.data;
      throw new Error();
    } catch {
      const all = getInitialMockAdminUsers().filter((u) => u.role === 'VOLUNTEER');
      return all.filter((u) => {
        if (status !== 'ALL' && u.verificationStatus !== status) return false;
        if (search) {
          const s = search.toLowerCase();
          return (
            (u.name && u.name.toLowerCase().includes(s)) ||
            (u.email && u.email.toLowerCase().includes(s)) ||
            (u.city && u.city.toLowerCase().includes(s))
          );
        }
        return true;
      });
    }
  },

  verifyVolunteer: async (id: number | string, reason?: string): Promise<AdminUserRecord> => {
    try {
      const res = await api.patch<ApiResponse<AdminUserRecord>>(`/admin/volunteers/${id}/verify`, { reason });
      if (res.data.data) return res.data.data;
      throw new Error();
    } catch {
      const users = getInitialMockAdminUsers();
      const idx = users.findIndex((u) => String(u.id) === String(id));
      if (idx >= 0) {
        const old = users[idx].verificationStatus;
        users[idx].verificationStatus = 'VERIFIED';
        users[idx].verificationReason = reason;
        localStorage.setItem(ADMIN_USERS_STORAGE, JSON.stringify(users));
        saveMockAuditLog('VOLUNTEER_VERIFIED', 'VOLUNTEER', String(id), old, 'VERIFIED', reason || 'Credentials approved by admin');
        return users[idx];
      }
      throw new Error('Volunteer not found');
    }
  },

  rejectVolunteer: async (id: number | string, reason: string): Promise<AdminUserRecord> => {
    try {
      const res = await api.patch<ApiResponse<AdminUserRecord>>(`/admin/volunteers/${id}/reject`, { reason });
      if (res.data.data) return res.data.data;
      throw new Error();
    } catch {
      const users = getInitialMockAdminUsers();
      const idx = users.findIndex((u) => String(u.id) === String(id));
      if (idx >= 0) {
        const old = users[idx].verificationStatus;
        users[idx].verificationStatus = 'REJECTED';
        users[idx].verificationReason = reason;
        localStorage.setItem(ADMIN_USERS_STORAGE, JSON.stringify(users));
        saveMockAuditLog('VOLUNTEER_REJECTED', 'VOLUNTEER', String(id), old, 'REJECTED', reason);
        return users[idx];
      }
      throw new Error('Volunteer not found');
    }
  },

  suspendVolunteer: async (id: number | string, reason: string): Promise<AdminUserRecord> => {
    try {
      const res = await api.patch<ApiResponse<AdminUserRecord>>(`/admin/volunteers/${id}/suspend`, { reason });
      if (res.data.data) return res.data.data;
      throw new Error();
    } catch {
      const users = getInitialMockAdminUsers();
      const idx = users.findIndex((u) => String(u.id) === String(id));
      if (idx >= 0) {
        const old = users[idx].verificationStatus;
        users[idx].verificationStatus = 'SUSPENDED';
        users[idx].verificationReason = reason;
        localStorage.setItem(ADMIN_USERS_STORAGE, JSON.stringify(users));
        saveMockAuditLog('VOLUNTEER_SUSPENDED', 'VOLUNTEER', String(id), old, 'SUSPENDED', reason);
        return users[idx];
      }
      throw new Error('Volunteer not found');
    }
  },

  // User Directory
  getUsers: async (role?: string, active?: boolean, search?: string): Promise<AdminUserRecord[]> => {
    try {
      const res = await api.get<ApiResponse<AdminUserRecord[]>>('/admin/users', { params: { role, active, search } });
      if (res.data.data) return res.data.data;
      throw new Error();
    } catch {
      let list = getInitialMockAdminUsers();
      if (role && role !== 'ALL') {
        list = list.filter((u) => u.role === role);
      }
      if (active !== undefined) {
        list = list.filter((u) => u.active === active);
      }
      if (search) {
        const s = search.toLowerCase();
        list = list.filter((u) => u.name.toLowerCase().includes(s) || u.email.toLowerCase().includes(s) || String(u.id).includes(s));
      }
      return list;
    }
  },

  suspendUser: async (id: number | string, reasonOrAdminId?: string | number, reasonText?: string): Promise<AdminUserRecord> => {
    if (reasonOrAdminId !== undefined && String(reasonOrAdminId) === String(id)) {
      throw new Error('Security Rule: You cannot suspend your own admin account.');
    }
    const finalReason = typeof reasonOrAdminId === 'string' ? reasonOrAdminId : (reasonText || 'Suspended by admin');
    try {
      const res = await api.patch<ApiResponse<AdminUserRecord>>(`/admin/users/${id}/suspend`, { reason: finalReason });
      if (res.data.data) return res.data.data;
      throw new Error();
    } catch (apiErr: any) {
      if (apiErr?.response?.data?.message) {
        throw new Error(apiErr.response.data.message);
      }
      const users = getInitialMockAdminUsers();
      const idx = users.findIndex((u) => String(u.id) === String(id));
      if (idx >= 0) {
        if (users[idx].role === 'ADMIN') {
          if (reasonOrAdminId !== undefined && String(reasonOrAdminId) === String(id)) {
            throw new Error('Security Rule: You cannot suspend your own admin account.');
          }
          const adminCount = users.filter((u) => u.role === 'ADMIN' && u.active).length;
          if (adminCount <= 1) {
            throw new Error('Security Rule: Cannot suspend the last active administrator.');
          }
        }
        users[idx].active = false;
        localStorage.setItem(ADMIN_USERS_STORAGE, JSON.stringify(users));
        saveMockAuditLog('USER_SUSPENDED', 'USER', String(id), 'ACTIVE', 'SUSPENDED', finalReason);
        return users[idx];
      }
      throw new Error('User not found');
    }
  },

  reactivateUser: async (id: number | string): Promise<AdminUserRecord> => {
    try {
      const res = await api.patch<ApiResponse<AdminUserRecord>>(`/admin/users/${id}/reactivate`);
      if (res.data.data) return res.data.data;
      throw new Error();
    } catch {
      const users = getInitialMockAdminUsers();
      const idx = users.findIndex((u) => String(u.id) === String(id));
      if (idx >= 0) {
        users[idx].active = true;
        localStorage.setItem(ADMIN_USERS_STORAGE, JSON.stringify(users));
        saveMockAuditLog('USER_REACTIVATED', 'USER', String(id), 'SUSPENDED', 'ACTIVE', 'Reactivated by admin');
        return users[idx];
      }
      throw new Error('User not found');
    }
  },

  // Donations Monitoring
  getDonations: async (status: string = 'ALL', search: string = ''): Promise<AdminDonationRecord[]> => {
    try {
      const res = await api.get<ApiResponse<AdminDonationRecord[]>>('/admin/donations', { params: { status, search } });
      if (res.data.data) return res.data.data;
      throw new Error();
    } catch {
      const defaults: AdminDonationRecord[] = [
        { id: 1, donationCode: 'DON-1001', donorName: 'Grand Hyatt Metro Canteen', donorCity: 'Ongole', donorAddress: '742 Evergreen Terrace', foodName: 'Fresh Vegetable Biryani & Gravy Meals', foodCategory: 'Biryani', quantity: 45, unit: 'kg', status: 'MATCHING', availableUntil: new Date(Date.now() + 3600000 * 12).toISOString(), searchRadiusKm: 5.0, matchingStage: 'STAGE_1_5KM', createdAt: new Date(Date.now() - 3600000 * 2).toISOString() },
        { id: 2, donationCode: 'DON-1002', donorName: 'Grand Hyatt Metro Canteen', donorCity: 'Ongole', donorAddress: '742 Evergreen Terrace', foodName: 'Artisan Bread Rolls & Whole Wheat Buns', foodCategory: 'Bakery', quantity: 20, unit: 'boxes', status: 'ACCEPTED', matchedNgoName: 'Hope Harvest Foundation', availableUntil: new Date(Date.now() + 3600000 * 8).toISOString(), searchRadiusKm: 10.0, matchingStage: 'ACCEPTED', createdAt: new Date(Date.now() - 3600000 * 4).toISOString() },
        { id: 3, donationCode: 'DON-1003', donorName: 'Grand Hyatt Metro Canteen', donorCity: 'Ongole', donorAddress: '742 Evergreen Terrace', foodName: 'Sealed Fruit Juice Packs & Mixed Snacks', foodCategory: 'Packaged Food', quantity: 85, unit: 'packets', status: 'DELIVERED', matchedNgoName: 'Hope Harvest Foundation', assignedVolunteerName: 'David Miller', searchRadiusKm: 5.0, matchingStage: 'COMPLETED', createdAt: new Date(Date.now() - 86400000).toISOString(), deliveredAt: new Date(Date.now() - 3600000 * 22).toISOString() },
        { id: 4, donationCode: 'DON-1004', donorName: 'Grand Hyatt Metro Canteen', donorCity: 'Ongole', donorAddress: '742 Evergreen Terrace', foodName: 'Prepared Mixed Vegetable Pulao', foodCategory: 'Cooked Meals', quantity: 30, unit: 'kg', status: 'EXPIRED', searchRadiusKm: 20.0, matchingStage: 'EXPIRED', createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), availableUntil: new Date(Date.now() - 3600000 * 4).toISOString() },
      ];
      return defaults.filter((d) => {
        if (status !== 'ALL' && d.status !== status) return false;
        if (search) {
          const s = search.toLowerCase();
          return d.foodName.toLowerCase().includes(s) || d.donationCode.toLowerCase().includes(s) || d.donorName.toLowerCase().includes(s);
        }
        return true;
      });
    }
  },

  // Matches Monitoring
  getMatches: async (status: string = 'ALL'): Promise<AdminMatchRecord[]> => {
    try {
      const res = await api.get<ApiResponse<AdminMatchRecord[]>>('/admin/matches', { params: { status } });
      if (res.data.data) return res.data.data;
      throw new Error();
    } catch {
      const defaults: AdminMatchRecord[] = [
        { id: 1, donationId: 1, donationCode: 'DON-1001', ngoId: 3, ngoName: 'Hope Harvest Foundation', distanceKm: 2.3, searchRadiusKm: 5.0, status: 'OFFERED', offeredAt: new Date(Date.now() - 3600000).toISOString() },
        { id: 2, donationId: 2, donationCode: 'DON-1002', ngoId: 3, ngoName: 'Hope Harvest Foundation', distanceKm: 2.3, searchRadiusKm: 5.0, status: 'ACCEPTED', offeredAt: new Date(Date.now() - 3600000 * 3).toISOString(), respondedAt: new Date(Date.now() - 3600000 * 2).toISOString() },
      ];
      return status === 'ALL' ? defaults : defaults.filter((m) => m.status === status);
    }
  },

  // Deliveries Monitoring
  getDeliveries: async (status: string = 'ALL'): Promise<AdminDeliveryRecord[]> => {
    try {
      const res = await api.get<ApiResponse<AdminDeliveryRecord[]>>('/admin/deliveries', { params: { status } });
      if (res.data.data) return res.data.data;
      throw new Error();
    } catch {
      const defaults: AdminDeliveryRecord[] = [
        { id: 1, deliveryCode: 'DEL-101', donationCode: 'DON-1002', donorName: 'Grand Hyatt Metro Canteen', pickupAddress: '742 Evergreen Terrace, Ongole', ngoName: 'Hope Harvest Foundation', destinationAddress: '108 Compassion Ave, Ongole', volunteerName: 'David Miller', status: 'IN_TRANSIT', assignedAt: new Date(Date.now() - 3600000).toISOString(), pickedUpAt: new Date(Date.now() - 1800000).toISOString(), lastVolunteerLat: 15.503, lastVolunteerLng: 80.051, isDelayed: false, createdAt: new Date(Date.now() - 3600000).toISOString() },
        { id: 2, deliveryCode: 'DEL-102', donationCode: 'DON-1003', donorName: 'Grand Hyatt Metro Canteen', pickupAddress: '742 Evergreen Terrace, Ongole', ngoName: 'Hope Harvest Foundation', destinationAddress: '108 Compassion Ave, Ongole', volunteerName: 'David Miller', status: 'DELIVERED', assignedAt: new Date(Date.now() - 86400000).toISOString(), pickedUpAt: new Date(Date.now() - 86400000 + 1800000).toISOString(), deliveredAt: new Date(Date.now() - 86400000 + 3600000).toISOString(), lastVolunteerLat: 15.5006, lastVolunteerLng: 80.0532, isDelayed: false, createdAt: new Date(Date.now() - 86400000).toISOString() },
      ];
      return status === 'ALL' ? defaults : defaults.filter((d) => d.status === status);
    }
  },

  // Issues & Reports
  getIssues: async (status: string = 'ALL', category: string = 'ALL'): Promise<AdminIssueRecord[]> => {
    try {
      const res = await api.get<ApiResponse<AdminIssueRecord[]>>('/admin/issues', { params: { status, category } });
      if (res.data.data) return res.data.data;
      throw new Error();
    } catch {
      let list = getInitialMockIssues();
      if (status !== 'ALL') list = list.filter((i) => i.status === status);
      if (category !== 'ALL') list = list.filter((i) => i.category === category);
      return list;
    }
  },

  updateIssueStatus: async (id: number | string, status: 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED' | 'DISMISSED', notes?: string): Promise<AdminIssueRecord> => {
    try {
      const res = await api.patch<ApiResponse<AdminIssueRecord>>(`/admin/issues/${id}/status`, { status, notes });
      if (res.data.data) return res.data.data;
      throw new Error();
    } catch {
      const issues = getInitialMockIssues();
      const idx = issues.findIndex((i) => String(i.id) === String(id));
      if (idx >= 0) {
        const old = issues[idx].status;
        issues[idx].status = status;
        if (notes) issues[idx].resolutionNotes = notes;
        if (status === 'RESOLVED' || status === 'DISMISSED') {
          issues[idx].resolvedAt = new Date().toISOString();
          issues[idx].assignedAdmin = 'admin@foodbridge.org';
        }
        localStorage.setItem(ADMIN_ISSUES_STORAGE, JSON.stringify(issues));
        saveMockAuditLog('ISSUE_STATUS_CHANGED', 'ISSUE', String(id), old, status, notes);
        return issues[idx];
      }
      throw new Error('Issue not found');
    }
  },

  // Settings
  getSettings: async (): Promise<AdminSettingRecord[]> => {
    try {
      const res = await api.get<ApiResponse<AdminSettingRecord[]>>('/admin/settings');
      if (res.data.data) return res.data.data;
      throw new Error();
    } catch {
      return getInitialMockSettings();
    }
  },

  updateSetting: async (key: string, value: string): Promise<AdminSettingRecord> => {
    if (value === undefined || value === null || value.trim() === '') {
      throw new Error('Validation Error: Setting value cannot be empty');
    }
    try {
      const res = await api.put<ApiResponse<AdminSettingRecord>>(`/admin/settings/${key}`, { value });
      if (res.data.data) return res.data.data;
      throw new Error();
    } catch (apiErr: any) {
      if (apiErr?.response?.data?.message) {
        throw new Error(apiErr.response.data.message);
      }
      const settings = getInitialMockSettings();
      const idx = settings.findIndex((s) => s.settingKey === key);
      if (idx >= 0) {
        const old = settings[idx].settingValue;
        settings[idx].settingValue = value;
        settings[idx].updatedBy = 'admin@foodbridge.org';
        settings[idx].updatedAt = new Date().toISOString();
        localStorage.setItem(ADMIN_SETTINGS_STORAGE, JSON.stringify(settings));
        saveMockAuditLog('SETTING_UPDATED', 'SYSTEM_SETTING', key, old, value, 'Operational parameter updated');
        return settings[idx];
      }
      throw new Error('Setting not found');
    }
  },

  // Audit Logs
  getAuditLogs: async (): Promise<AdminAuditLogRecord[]> => {
    try {
      const res = await api.get<ApiResponse<{ content: AdminAuditLogRecord[] }>>('/admin/audit-logs');
      if (res.data.data?.content) return res.data.data.content;
      throw new Error();
    } catch {
      return getInitialMockLogs();
    }
  },
};
