import api from './api';
import type {
  NotificationItem,
  NotificationPreferences,
  CreateNotificationInput,
  NotificationFilterOptions,
  NotificationPriority,
  NotificationCategory,
  ApiResponse,
} from '../types';
import { websocketService } from './websocketService';

const NOTIFICATIONS_STORAGE_KEY = 'foodbridge_mock_notifications';
const NOTIFICATION_PREFERENCES_STORAGE_KEY = 'foodbridge_mock_notification_preferences';

const DEFAULT_PREFERENCES: NotificationPreferences = {
  id: 'pref_default',
  userId: '',
  emailEnabled: true,
  pushEnabled: true,
  inAppEnabled: true,
  browserEnabled: true,
  donationUpdates: true,
  matchingUpdates: true,
  deliveryUpdates: true,
  systemUpdates: true,
  categories: {
    DONATION: true,
    MATCH: true,
    DELIVERY: true,
    SYSTEM: true,
    VERIFICATION: true,
  },
  createdAt: new Date().toISOString(),
};

const getStoredNotifications = (): NotificationItem[] => {
  const raw = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {
      /* ignore */
    }
  }
  return [];
};

const saveStoredNotifications = (items: NotificationItem[]) => {
  localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(items));
};

const getStoredPreferences = (userId: string): NotificationPreferences => {
  const raw = localStorage.getItem(`${NOTIFICATION_PREFERENCES_STORAGE_KEY}_${userId}`);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {
      /* ignore */
    }
  }
  return { ...DEFAULT_PREFERENCES, id: `pref_${userId}`, userId };
};

const saveStoredPreferences = (userId: string, pref: NotificationPreferences) => {
  localStorage.setItem(`${NOTIFICATION_PREFERENCES_STORAGE_KEY}_${userId}`, JSON.stringify(pref));
};

export const notificationService = {
  // Create & publish notification (Backend Event Trigger Integration)
  createNotification: async (input: CreateNotificationInput): Promise<NotificationItem> => {
    if (!input.userId) {
      throw new Error('Notification creation failed: userId is required.');
    }

    const notifications = getStoredNotifications();
    const now = new Date();
    const nowStr = now.toISOString();

    // Duplicate Prevention Check (Same type + referenceId + userId within 5 seconds)
    const existingDuplicate = notifications.find((n) => {
      if (n.userId !== input.userId || n.type !== input.type || n.referenceId !== input.referenceId) {
        return false;
      }
      const createdTime = new Date(n.createdAt).getTime();
      return now.getTime() - createdTime < 5000;
    });

    if (existingDuplicate) {
      return existingDuplicate;
    }

    // Priority Default Calculation based on Notification Type
    let priority: NotificationPriority = input.priority || 'NORMAL';
    if (input.type === 'DONATION_EXPIRED' || input.type === 'DONATION_ACCEPTED' || input.type === 'DELIVERY_COMPLETED') {
      priority = input.priority || 'HIGH';
    }

    let category: NotificationCategory = input.category || 'DONATION';
    if (!input.category) {
      if (input.referenceType === 'MATCH') category = 'MATCH';
      else if (input.referenceType === 'DELIVERY') category = 'DELIVERY';
      else if (input.referenceType === 'SYSTEM') category = 'SYSTEM';
      else if (input.type.includes('VERIFICATION')) category = 'VERIFICATION';
    }

    const newNotification: NotificationItem = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId: input.userId,
      type: input.type,
      category,
      title: input.title,
      message: input.message,
      priority,
      referenceType: input.referenceType,
      referenceId: input.referenceId,
      isRead: false,
      createdAt: nowStr,
    };

    notifications.unshift(newNotification);
    saveStoredNotifications(notifications);

    // Publish to Real-Time Communication Channel
    websocketService.publishRealTimeNotification(newNotification);

    return newNotification;
  },

  // GET /api/notifications — Get authenticated user's notifications
  getUserNotifications: async (
    userId: string,
    options?: NotificationFilterOptions
  ): Promise<NotificationItem[]> => {
    try {
      const res = await api.get<ApiResponse<NotificationItem[]>>('/notifications', { timeout: 800 });
      if (res.data.data) return res.data.data;
      throw new Error(res.data.message || 'Failed to fetch notifications');
    } catch {
      let items = getStoredNotifications().filter((n) => n.userId === userId);

      // Status Filter
      if (options?.status === 'UNREAD') {
        items = items.filter((n) => !n.isRead);
      } else if (options?.status === 'READ') {
        items = items.filter((n) => n.isRead);
      }

      // Category Filter
      if (options?.category && options.category !== 'ALL') {
        items = items.filter((n) => {
          if (options.category === 'DONATION') return n.category === 'DONATION' || n.referenceType === 'DONATION';
          if (options.category === 'MATCH' || options.category === 'MATCHING') return n.category === 'MATCH' || n.referenceType === 'MATCH';
          if (options.category === 'DELIVERY') return n.category === 'DELIVERY' || n.referenceType === 'DELIVERY';
          if (options.category === 'SYSTEM') return n.category === 'SYSTEM' || n.referenceType === 'SYSTEM';
          if (options.category === 'VERIFICATION') return n.category === 'VERIFICATION';
          return true;
        });
      }

      return items;
    }
  },

  // GET /api/notifications/unread-count — Get authenticated user's unread notification count
  getUnreadCount: async (userId: string): Promise<number> => {
    try {
      const res = await api.get<ApiResponse<{ count: number }>>('/notifications/unread-count', { timeout: 800 });
      if (res.data.data) return res.data.data.count;
      throw new Error(res.data.message || 'Failed to fetch unread count');
    } catch {
      const items = getStoredNotifications().filter((n) => n.userId === userId && !n.isRead);
      return items.length;
    }
  },

  // PATCH /api/notifications/{id}/read — Mark single notification as read
  markAsRead: async (notificationId: string, userId: string): Promise<NotificationItem> => {
    try {
      const res = await api.patch<ApiResponse<NotificationItem>>(`/notifications/${notificationId}/read`);
      if (res.data.data) return res.data.data;
      throw new Error(res.data.message || 'Failed to mark notification as read');
    } catch {
      const items = getStoredNotifications();
      const idx = items.findIndex((n) => n.id === notificationId && n.userId === userId);
      if (idx < 0) {
        throw new Error('FORBIDDEN: Notification not found or unauthorized access.');
      }

      items[idx].isRead = true;
      items[idx].readAt = new Date().toISOString();
      saveStoredNotifications(items);
      return items[idx];
    }
  },

  // PATCH /api/notifications/read-all — Mark all notifications for authenticated user as read
  markAllAsRead: async (userId: string): Promise<number> => {
    try {
      const res = await api.patch<ApiResponse<{ updatedCount: number }>>('/notifications/read-all');
      if (res.data.data) return res.data.data.updatedCount;
      throw new Error(res.data.message || 'Failed to mark all as read');
    } catch {
      const items = getStoredNotifications();
      let updatedCount = 0;
      const nowStr = new Date().toISOString();

      for (let i = 0; i < items.length; i++) {
        if (items[i].userId === userId && !items[i].isRead) {
          items[i].isRead = true;
          items[i].readAt = nowStr;
          updatedCount++;
        }
      }

      saveStoredNotifications(items);
      return updatedCount;
    }
  },

  // DELETE /api/notifications/{id} — Delete notification
  deleteNotification: async (notificationId: string, userId: string): Promise<boolean> => {
    try {
      await api.delete(`/notifications/${notificationId}`);
      return true;
    } catch {
      const items = getStoredNotifications();
      const filtered = items.filter((n) => !(n.id === notificationId && n.userId === userId));
      saveStoredNotifications(filtered);
      return true;
    }
  },

  // Notification Preferences
  getNotificationPreferences: async (userId: string): Promise<NotificationPreferences> => {
    try {
      const res = await api.get<ApiResponse<NotificationPreferences>>('/notifications/preferences', { timeout: 800 });
      if (res.data.data) return res.data.data;
      throw new Error(res.data.message || 'Failed to fetch preferences');
    } catch {
      return getStoredPreferences(userId);
    }
  },

  getUserPreferences: async (userId: string): Promise<NotificationPreferences> => {
    return notificationService.getNotificationPreferences(userId);
  },

  updateNotificationPreferences: async (
    userId: string,
    data: Partial<NotificationPreferences>
  ): Promise<NotificationPreferences> => {
    try {
      const res = await api.put<ApiResponse<NotificationPreferences>>('/notifications/preferences', data);
      if (res.data.data) return res.data.data;
      throw new Error(res.data.message || 'Failed to update preferences');
    } catch {
      const current = getStoredPreferences(userId);
      const updated: NotificationPreferences = {
        ...current,
        ...data,
        updatedAt: new Date().toISOString(),
      };
      saveStoredPreferences(userId, updated);
      return updated;
    }
  },

  saveUserPreferences: async (
    userId: string,
    data: Partial<NotificationPreferences>
  ): Promise<NotificationPreferences> => {
    return notificationService.updateNotificationPreferences(userId, data);
  },
};
