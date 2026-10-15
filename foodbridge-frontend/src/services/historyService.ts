import api from './api';
import type {
  DonationHistoryEvent,
  DeliveryHistoryEvent,
  AuditLogEntry,
  HistoryFilterParams,
  ApiResponse,
  User,
} from '../types';
import { storage } from '../utils';

const DONATION_HISTORY_KEY = 'foodbridge_history_donations';
const DELIVERY_HISTORY_KEY = 'foodbridge_history_deliveries';
const AUDIT_LOGS_KEY = 'foodbridge_history_audit';

// Initial authentic mock history events for offline demo
const getInitialDonationHistory = (): DonationHistoryEvent[] => {
  const raw = localStorage.getItem(DONATION_HISTORY_KEY);
  if (raw) {
    try { return JSON.parse(raw); } catch { /* ignore */ }
  }
  const defaults: DonationHistoryEvent[] = [
    {
      id: 'EVT-DON-1001-01',
      donationId: 'DON-1001',
      donationCode: 'DON-1001',
      donorId: 'usr_donor_1',
      actorId: 'usr_donor_1',
      actorEmail: 'donor@foodbridge.org',
      actorRole: 'DONOR',
      eventType: 'DONATION_CREATED',
      previousStatus: null,
      newStatus: 'AVAILABLE',
      description: 'Donation batch created by Grand Hyatt Canteen (45 kg Fresh Vegetable Biryani)',
      correlationId: 'corr-init-don-1001',
      createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    },
    {
      id: 'EVT-DON-1001-02',
      donationId: 'DON-1001',
      donationCode: 'DON-1001',
      donorId: 'usr_donor_1',
      actorId: 'usr_sys_01',
      actorEmail: 'system@foodbridge.org',
      actorRole: 'SYSTEM',
      eventType: 'MATCH_SEARCH_INITIATED',
      previousStatus: 'AVAILABLE',
      newStatus: 'MATCHING',
      description: 'Matching engine initiated search within 5 km radius',
      correlationId: 'corr-init-don-1001',
      createdAt: new Date(Date.now() - 3600000 * 3.8).toISOString(),
    },
    {
      id: 'EVT-DON-1002-01',
      donationId: 'DON-1002',
      donationCode: 'DON-1002',
      donorId: 'usr_donor_1',
      actorId: 'usr_donor_1',
      actorEmail: 'donor@foodbridge.org',
      actorRole: 'DONOR',
      eventType: 'DONATION_CREATED',
      previousStatus: null,
      newStatus: 'AVAILABLE',
      description: 'Donation batch created: Artisan Bread Rolls (20 boxes)',
      correlationId: 'corr-init-don-1002',
      createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    },
    {
      id: 'EVT-DON-1002-02',
      donationId: 'DON-1002',
      donationCode: 'DON-1002',
      donorId: 'usr_donor_1',
      matchedNgoId: 'usr_ngo_1',
      actorId: 'usr_ngo_1',
      actorEmail: 'ngo@foodbridge.org',
      actorRole: 'NGO',
      eventType: 'NGO_ACCEPTED',
      previousStatus: 'AVAILABLE',
      newStatus: 'ACCEPTED',
      description: 'Donation offer accepted by Hope Harvest Foundation',
      correlationId: 'corr-init-don-1002',
      createdAt: new Date(Date.now() - 3600000 * 7.5).toISOString(),
    },
    {
      id: 'EVT-DON-1003-01',
      donationId: 'DON-1003',
      donationCode: 'DON-1003',
      donorId: 'usr_donor_1',
      actorId: 'usr_donor_1',
      actorEmail: 'donor@foodbridge.org',
      actorRole: 'DONOR',
      eventType: 'DONATION_CREATED',
      previousStatus: null,
      newStatus: 'AVAILABLE',
      description: 'Donation batch created: Sealed Fruit Juice Packs (85 packets)',
      correlationId: 'corr-init-don-1003',
      createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    },
    {
      id: 'EVT-DON-1003-02',
      donationId: 'DON-1003',
      donationCode: 'DON-1003',
      donorId: 'usr_donor_1',
      matchedNgoId: 'usr_ngo_1',
      actorId: 'usr_ngo_1',
      actorEmail: 'ngo@foodbridge.org',
      actorRole: 'NGO',
      eventType: 'NGO_ACCEPTED',
      previousStatus: 'AVAILABLE',
      newStatus: 'ACCEPTED',
      description: 'Donation offer accepted by Hope Harvest Foundation',
      correlationId: 'corr-init-don-1003',
      createdAt: new Date(Date.now() - 3600000 * 23.5).toISOString(),
    },
    {
      id: 'EVT-DON-1003-03',
      donationId: 'DON-1003',
      donationCode: 'DON-1003',
      donorId: 'usr_donor_1',
      matchedNgoId: 'usr_ngo_1',
      actorId: 'usr_vol_1',
      actorEmail: 'volunteer@foodbridge.org',
      actorRole: 'VOLUNTEER',
      eventType: 'VOLUNTEER_ASSIGNED',
      previousStatus: 'ACCEPTED',
      newStatus: 'PICKUP_PENDING',
      description: 'Volunteer David Miller accepted delivery mission',
      correlationId: 'corr-init-don-1003',
      createdAt: new Date(Date.now() - 3600000 * 22).toISOString(),
    },
    {
      id: 'EVT-DON-1003-04',
      donationId: 'DON-1003',
      donationCode: 'DON-1003',
      donorId: 'usr_donor_1',
      matchedNgoId: 'usr_ngo_1',
      actorId: 'usr_vol_1',
      actorEmail: 'volunteer@foodbridge.org',
      actorRole: 'VOLUNTEER',
      eventType: 'PICKUP_COMPLETED',
      previousStatus: 'PICKUP_PENDING',
      newStatus: 'PICKED_UP',
      description: 'Food collected from donor kitchen loading bay',
      correlationId: 'corr-init-don-1003',
      createdAt: new Date(Date.now() - 3600000 * 21).toISOString(),
    },
    {
      id: 'EVT-DON-1003-05',
      donationId: 'DON-1003',
      donationCode: 'DON-1003',
      donorId: 'usr_donor_1',
      matchedNgoId: 'usr_ngo_1',
      actorId: 'usr_vol_1',
      actorEmail: 'volunteer@foodbridge.org',
      actorRole: 'VOLUNTEER',
      eventType: 'DELIVERY_COMPLETED',
      previousStatus: 'IN_TRANSIT',
      newStatus: 'DELIVERED',
      description: 'Surplus food securely delivered to Hope Harvest Foundation',
      correlationId: 'corr-init-don-1003',
      createdAt: new Date(Date.now() - 3600000 * 20).toISOString(),
    },
    {
      id: 'EVT-DON-1004-01',
      donationId: 'DON-1004',
      donationCode: 'DON-1004',
      donorId: 'usr_donor_1',
      actorId: 'usr_donor_1',
      actorEmail: 'donor@foodbridge.org',
      actorRole: 'DONOR',
      eventType: 'DONATION_CREATED',
      previousStatus: null,
      newStatus: 'AVAILABLE',
      description: 'Donation batch created: Mixed Vegetable Pulao (30 kg)',
      correlationId: 'corr-init-don-1004',
      createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    },
    {
      id: 'EVT-DON-1004-02',
      donationId: 'DON-1004',
      donationCode: 'DON-1004',
      donorId: 'usr_donor_1',
      actorId: 'usr_sys_01',
      actorEmail: 'system@foodbridge.org',
      actorRole: 'SYSTEM',
      eventType: 'DONATION_EXPIRED',
      previousStatus: 'AVAILABLE',
      newStatus: 'EXPIRED',
      description: 'Donation shelf-life expired without pickup; record preserved for audit reporting',
      correlationId: 'corr-init-don-1004',
      createdAt: new Date(Date.now() - 3600000 * 40).toISOString(),
    },
  ];
  localStorage.setItem(DONATION_HISTORY_KEY, JSON.stringify(defaults));
  return defaults;
};

const getInitialDeliveryHistory = (): DeliveryHistoryEvent[] => {
  const raw = localStorage.getItem(DELIVERY_HISTORY_KEY);
  if (raw) {
    try { return JSON.parse(raw); } catch { /* ignore */ }
  }
  const defaults: DeliveryHistoryEvent[] = [
    {
      id: 'EVT-DEL-101-01',
      deliveryId: 'DEL-101',
      deliveryCode: 'DEL-101',
      donationId: 'DON-1002',
      donationCode: 'DON-1002',
      volunteerId: 'usr_vol_1',
      ngoId: 'usr_ngo_1',
      actorId: 'usr_sys_01',
      actorEmail: 'system@foodbridge.org',
      actorRole: 'SYSTEM',
      eventType: 'DELIVERY_CREATED',
      previousStatus: null,
      newStatus: 'PENDING_ASSIGNMENT',
      description: 'Delivery dispatch task created after NGO acceptance',
      correlationId: 'corr-del-101',
      createdAt: new Date(Date.now() - 3600000 * 7).toISOString(),
    },
    {
      id: 'EVT-DEL-101-02',
      deliveryId: 'DEL-101',
      deliveryCode: 'DEL-101',
      donationId: 'DON-1002',
      donationCode: 'DON-1002',
      volunteerId: 'usr_vol_1',
      ngoId: 'usr_ngo_1',
      actorId: 'usr_vol_1',
      actorEmail: 'volunteer@foodbridge.org',
      actorRole: 'VOLUNTEER',
      eventType: 'VOLUNTEER_ASSIGNED',
      previousStatus: 'PENDING_ASSIGNMENT',
      newStatus: 'ACCEPTED',
      description: 'David Miller accepted delivery task',
      correlationId: 'corr-del-101',
      createdAt: new Date(Date.now() - 3600000 * 6.5).toISOString(),
    },
    {
      id: 'EVT-DEL-101-03',
      deliveryId: 'DEL-101',
      deliveryCode: 'DEL-101',
      donationId: 'DON-1002',
      donationCode: 'DON-1002',
      volunteerId: 'usr_vol_1',
      ngoId: 'usr_ngo_1',
      actorId: 'usr_vol_1',
      actorEmail: 'volunteer@foodbridge.org',
      actorRole: 'VOLUNTEER',
      eventType: 'PICKUP_COMPLETED',
      previousStatus: 'PICKUP_PENDING',
      newStatus: 'PICKED_UP',
      description: 'Food collected from Grand Hyatt Metro Canteen',
      correlationId: 'corr-del-101',
      createdAt: new Date(Date.now() - 3600000 * 5.8).toISOString(),
    },
    {
      id: 'EVT-DEL-101-04',
      deliveryId: 'DEL-101',
      deliveryCode: 'DEL-101',
      donationId: 'DON-1002',
      donationCode: 'DON-1002',
      volunteerId: 'usr_vol_1',
      ngoId: 'usr_ngo_1',
      actorId: 'usr_vol_1',
      actorEmail: 'volunteer@foodbridge.org',
      actorRole: 'VOLUNTEER',
      eventType: 'IN_TRANSIT',
      previousStatus: 'PICKED_UP',
      newStatus: 'IN_TRANSIT',
      description: 'Volunteer is en route to Hope Harvest Foundation',
      correlationId: 'corr-del-101',
      createdAt: new Date(Date.now() - 3600000 * 5.5).toISOString(),
    },
    {
      id: 'EVT-DEL-100-01',
      deliveryId: 'DEL-100',
      deliveryCode: 'DEL-100',
      donationId: 'DON-1003',
      donationCode: 'DON-1003',
      volunteerId: 'usr_vol_1',
      ngoId: 'usr_ngo_1',
      actorId: 'usr_vol_1',
      actorEmail: 'volunteer@foodbridge.org',
      actorRole: 'VOLUNTEER',
      eventType: 'DELIVERY_COMPLETED',
      previousStatus: 'IN_TRANSIT',
      newStatus: 'DELIVERED',
      description: 'Food handed over and confirmed by NGO staff',
      correlationId: 'corr-del-100',
      createdAt: new Date(Date.now() - 3600000 * 20).toISOString(),
    },
  ];
  localStorage.setItem(DELIVERY_HISTORY_KEY, JSON.stringify(defaults));
  return defaults;
};

const getInitialAuditLogs = (): AuditLogEntry[] => {
  const raw = localStorage.getItem(AUDIT_LOGS_KEY);
  if (raw) {
    try { return JSON.parse(raw); } catch { /* ignore */ }
  }
  const defaults: AuditLogEntry[] = [
    {
      id: 1,
      actorId: 1,
      actorEmail: 'admin@foodbridge.org',
      actorRole: 'ADMIN',
      action: 'PLATFORM_INITIALIZATION',
      entityType: 'SYSTEM',
      entityId: 'SYS-01',
      previousState: null,
      newState: 'ACTIVE',
      reason: 'FoodBridge production governance platform initialized',
      correlationId: 'corr-audit-01',
      createdAt: new Date(Date.now() - 3600000 * 72).toISOString(),
    },
    {
      id: 2,
      actorId: 1,
      actorEmail: 'admin@foodbridge.org',
      actorRole: 'ADMIN',
      action: 'NGO_VERIFIED',
      entityType: 'NGO',
      entityId: '2',
      previousState: 'PENDING',
      newState: 'VERIFIED',
      reason: 'Hope Harvest Foundation registration confirmed via NGO Darpan registration verification',
      correlationId: 'corr-audit-02',
      createdAt: new Date(Date.now() - 3600000 * 70).toISOString(),
    },
    {
      id: 3,
      actorId: 1,
      actorEmail: 'admin@foodbridge.org',
      actorRole: 'ADMIN',
      action: 'VOLUNTEER_VERIFIED',
      entityType: 'VOLUNTEER',
      entityId: '3',
      previousState: 'PENDING',
      newState: 'VERIFIED',
      reason: 'David Miller driver license and safety credential validation verified',
      correlationId: 'corr-audit-03',
      createdAt: new Date(Date.now() - 3600000 * 68).toISOString(),
    },
    {
      id: 4,
      actorId: 1,
      actorEmail: 'admin@foodbridge.org',
      actorRole: 'ADMIN',
      action: 'SETTING_UPDATED',
      entityType: 'SYSTEM_SETTING',
      entityId: 'initial_matching_radius_km',
      previousState: '3',
      newState: '5',
      reason: 'Standardized initial search radius for urban clusters',
      correlationId: 'corr-audit-04',
      createdAt: new Date(Date.now() - 3600000 * 50).toISOString(),
    },
  ];
  localStorage.setItem(AUDIT_LOGS_KEY, JSON.stringify(defaults));
  return defaults;
};

export const historyService = {
  // ==========================================
  // 1. DONATION HISTORY
  // ==========================================

  getDonationHistory: async (params?: HistoryFilterParams): Promise<{ content: DonationHistoryEvent[]; totalElements: number }> => {
    try {
      const res = await api.get<ApiResponse<{ content: DonationHistoryEvent[]; totalElements: number }>>('/history/donations', { params });
      if (res.data.data) return res.data.data;
      throw new Error();
    } catch {
      // Offline fallback scoped to authenticated user role
      const currentUser: User | null = storage.getUser();
      let events = getInitialDonationHistory();

      if (currentUser) {
        if (currentUser.role === 'DONOR') {
          events = events.filter((e) => !e.donorId || e.donorId === currentUser.id || e.actorEmail === currentUser.email);
        } else if (currentUser.role === 'NGO') {
          events = events.filter((e) => !e.matchedNgoId || e.matchedNgoId === currentUser.id || e.actorEmail === currentUser.email);
        } else if (currentUser.role === 'VOLUNTEER') {
          // Volunteers cannot access general donation lifecycle history
          events = [];
        }
      }

      if (params?.donationCode) {
        events = events.filter((e) => e.donationCode.toLowerCase().includes(params.donationCode!.toLowerCase()));
      }
      if (params?.eventType && params.eventType !== 'ALL') {
        events = events.filter((e) => e.eventType === params.eventType);
      }
      if (params?.status && params.status !== 'ALL') {
        events = events.filter((e) => e.newStatus === params.status);
      }
      if (params?.search) {
        const s = params.search.toLowerCase();
        events = events.filter((e) =>
          e.donationCode.toLowerCase().includes(s) ||
          e.eventType.toLowerCase().includes(s) ||
          (e.description && e.description.toLowerCase().includes(s)) ||
          (e.actorEmail && e.actorEmail.toLowerCase().includes(s))
        );
      }

      events.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      return { content: events, totalElements: events.length };
    }
  },

  getDonationTimeline: async (donationId: string | number): Promise<DonationHistoryEvent[]> => {
    try {
      const res = await api.get<ApiResponse<DonationHistoryEvent[]>>(`/history/donations/${donationId}`);
      if (res.data.data) return res.data.data;
      throw new Error();
    } catch {
      const events = getInitialDonationHistory();
      return events
        .filter((e) => String(e.donationId) === String(donationId) || e.donationCode === String(donationId))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
  },

  recordDonationEvent: async (event: Partial<DonationHistoryEvent>): Promise<DonationHistoryEvent> => {
    try {
      const res = await api.post<ApiResponse<DonationHistoryEvent>>(`/history/donations/${event.donationId}/events`, event);
      if (res.data.data) return res.data.data;
      throw new Error();
    } catch {
      const events = getInitialDonationHistory();
      const currentUser: User | null = storage.getUser();
      const newEvent: DonationHistoryEvent = {
        id: `EVT-DON-${Date.now()}`,
        donationId: event.donationId || 'DON-NEW',
        donationCode: event.donationCode || `DON-${event.donationId}`,
        donorId: event.donorId || currentUser?.id,
        matchedNgoId: event.matchedNgoId,
        actorId: currentUser?.id,
        actorEmail: currentUser?.email || 'user@foodbridge.org',
        actorRole: (currentUser?.role as any) || 'SYSTEM',
        eventType: event.eventType || 'DONATION_UPDATED',
        previousStatus: event.previousStatus || null,
        newStatus: event.newStatus || 'AVAILABLE',
        description: event.description || 'Donation status updated',
        correlationId: event.correlationId || `corr-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      events.unshift(newEvent);
      localStorage.setItem(DONATION_HISTORY_KEY, JSON.stringify(events));

      // Also record in audit trail
      historyService.recordAuditEvent({
        actorEmail: newEvent.actorEmail || 'system@foodbridge.org',
        actorRole: newEvent.actorRole || 'SYSTEM',
        action: newEvent.eventType,
        entityType: 'DONATION',
        entityId: newEvent.donationCode,
        previousState: newEvent.previousStatus,
        newState: newEvent.newStatus,
        reason: newEvent.description,
        correlationId: newEvent.correlationId,
      });

      return newEvent;
    }
  },

  // ==========================================
  // 2. DELIVERY HISTORY
  // ==========================================

  getDeliveryHistory: async (params?: HistoryFilterParams): Promise<{ content: DeliveryHistoryEvent[]; totalElements: number }> => {
    try {
      const res = await api.get<ApiResponse<{ content: DeliveryHistoryEvent[]; totalElements: number }>>('/history/deliveries', { params });
      if (res.data.data) return res.data.data;
      throw new Error();
    } catch {
      const currentUser: User | null = storage.getUser();
      let events = getInitialDeliveryHistory();

      if (currentUser) {
        if (currentUser.role === 'VOLUNTEER') {
          events = events.filter((e) => !e.volunteerId || e.volunteerId === currentUser.id || e.actorEmail === currentUser.email);
        } else if (currentUser.role === 'NGO') {
          events = events.filter((e) => !e.ngoId || e.ngoId === currentUser.id);
        } else if (currentUser.role === 'DONOR') {
          // Donors cannot access volunteer delivery history
          events = [];
        }
      }

      if (params?.deliveryCode) {
        events = events.filter((e) => e.deliveryCode.toLowerCase().includes(params.deliveryCode!.toLowerCase()));
      }
      if (params?.eventType && params.eventType !== 'ALL') {
        events = events.filter((e) => e.eventType === params.eventType);
      }
      if (params?.status && params.status !== 'ALL') {
        events = events.filter((e) => e.newStatus === params.status);
      }
      if (params?.search) {
        const s = params.search.toLowerCase();
        events = events.filter((e) =>
          e.deliveryCode.toLowerCase().includes(s) ||
          e.eventType.toLowerCase().includes(s) ||
          (e.description && e.description.toLowerCase().includes(s))
        );
      }

      events.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      return { content: events, totalElements: events.length };
    }
  },

  getDeliveryTimeline: async (deliveryId: string | number): Promise<DeliveryHistoryEvent[]> => {
    try {
      const res = await api.get<ApiResponse<DeliveryHistoryEvent[]>>(`/history/deliveries/${deliveryId}`);
      if (res.data.data) return res.data.data;
      throw new Error();
    } catch {
      const events = getInitialDeliveryHistory();
      return events
        .filter((e) => String(e.deliveryId) === String(deliveryId) || e.deliveryCode === String(deliveryId))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
  },

  recordDeliveryEvent: async (event: Partial<DeliveryHistoryEvent>): Promise<DeliveryHistoryEvent> => {
    try {
      const res = await api.post<ApiResponse<DeliveryHistoryEvent>>(`/history/deliveries/${event.deliveryId}/events`, event);
      if (res.data.data) return res.data.data;
      throw new Error();
    } catch {
      const events = getInitialDeliveryHistory();
      const currentUser: User | null = storage.getUser();
      const newEvent: DeliveryHistoryEvent = {
        id: `EVT-DEL-${Date.now()}`,
        deliveryId: event.deliveryId || 'DEL-NEW',
        deliveryCode: event.deliveryCode || `DEL-${event.deliveryId}`,
        donationId: event.donationId,
        donationCode: event.donationCode,
        volunteerId: event.volunteerId || currentUser?.id,
        ngoId: event.ngoId,
        actorId: currentUser?.id,
        actorEmail: currentUser?.email || 'volunteer@foodbridge.org',
        actorRole: (currentUser?.role as any) || 'VOLUNTEER',
        eventType: event.eventType || 'IN_TRANSIT',
        previousStatus: event.previousStatus || null,
        newStatus: event.newStatus || 'IN_TRANSIT',
        description: event.description || 'Delivery milestone recorded',
        correlationId: event.correlationId || `corr-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      events.unshift(newEvent);
      localStorage.setItem(DELIVERY_HISTORY_KEY, JSON.stringify(events));

      // Also record in audit trail
      historyService.recordAuditEvent({
        actorEmail: newEvent.actorEmail || 'volunteer@foodbridge.org',
        actorRole: newEvent.actorRole || 'VOLUNTEER',
        action: newEvent.eventType,
        entityType: 'DELIVERY',
        entityId: newEvent.deliveryCode,
        previousState: newEvent.previousStatus,
        newState: newEvent.newStatus,
        reason: newEvent.description,
        correlationId: newEvent.correlationId,
      });

      return newEvent;
    }
  },

  // ==========================================
  // 3. ADMIN AUDIT TRAIL
  // ==========================================

  getAdminAuditTrail: async (params?: HistoryFilterParams): Promise<{ content: AuditLogEntry[]; totalElements: number }> => {
    try {
      const res = await api.get<ApiResponse<{ content: AuditLogEntry[]; totalElements: number }>>('/history/admin/audit-trail', { params });
      if (res.data.data) return res.data.data;
      throw new Error();
    } catch {
      let logs = getInitialAuditLogs();
      if (params?.entityType && params.entityType !== 'ALL') {
        logs = logs.filter((l) => l.entityType === params.entityType);
      }
      if (params?.actorRole && params.actorRole !== 'ALL') {
        logs = logs.filter((l) => l.actorRole === params.actorRole);
      }
      if (params?.search) {
        const s = params.search.toLowerCase();
        logs = logs.filter((l) =>
          l.action.toLowerCase().includes(s) ||
          l.actorEmail.toLowerCase().includes(s) ||
          (l.reason && l.reason.toLowerCase().includes(s)) ||
          (l.entityId && l.entityId.toLowerCase().includes(s)) ||
          (l.correlationId && l.correlationId.toLowerCase().includes(s))
        );
      }

      logs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      return { content: logs, totalElements: logs.length };
    }
  },

  recordAuditEvent: (audit: Partial<AuditLogEntry>): void => {
    const logs = getInitialAuditLogs();
    const entry: AuditLogEntry = {
      id: Date.now(),
      actorId: audit.actorId,
      actorEmail: audit.actorEmail || 'system@foodbridge.org',
      actorRole: audit.actorRole || 'SYSTEM',
      action: audit.action || 'ACTIVITY_LOGGED',
      entityType: audit.entityType || 'SYSTEM',
      entityId: audit.entityId,
      previousState: audit.previousState,
      newState: audit.newState,
      reason: audit.reason,
      correlationId: audit.correlationId || `corr-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    logs.unshift(entry);
    localStorage.setItem(AUDIT_LOGS_KEY, JSON.stringify(logs));
  },
};
