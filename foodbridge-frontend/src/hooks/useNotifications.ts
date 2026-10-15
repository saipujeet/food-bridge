import { useState, useEffect, useCallback } from 'react';
import type { NotificationItem, NotificationFilterOptions } from '../types';
import { notificationService } from '../services/notificationService';
import { notificationEventBus } from '../utils/notificationEventBus';
import { websocketService } from '../services/websocketService';
import { useAuth } from './useAuth';

export const useNotifications = (options?: NotificationFilterOptions) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [toastNotification, setToastNotification] = useState<NotificationItem | null>(null);

  const fetchNotifications = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const data = await notificationService.getUserNotifications(user.id, options);
      const count = await notificationService.getUnreadCount(user.id);
      setNotifications(data);
      setUnreadCount(count);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load notifications';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [user, options?.status, options?.category]);

  const markAsRead = async (notificationId: string): Promise<void> => {
    if (!user) return;
    try {
      const updated = await notificationService.markAsRead(notificationId, user.id);
      setNotifications((prev) => prev.map((n) => (n.id === notificationId ? updated : n)));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to mark notification as read';
      setError(msg);
    }
  };

  const markAllAsRead = async (): Promise<void> => {
    if (!user) return;
    try {
      await notificationService.markAllAsRead(user.id);
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true, readAt: n.readAt || new Date().toISOString() }))
      );
      setUnreadCount(0);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to mark all as read';
      setError(msg);
    }
  };

  const deleteNotification = async (notificationId: string): Promise<void> => {
    if (!user) return;
    try {
      await notificationService.deleteNotification(notificationId, user.id);
      setNotifications((prev) => {
        const target = prev.find((n) => n.id === notificationId);
        if (target && !target.isRead) {
          setUnreadCount((cnt) => Math.max(0, cnt - 1));
        }
        return prev.filter((n) => n.id !== notificationId);
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete notification';
      setError(msg);
    }
  };

  const dismissToast = () => {
    setToastNotification(null);
  };

  // Subscribe to Real-Time Communication Events
  useEffect(() => {
    if (!user) return;

    // Connect WebSocket channel for authenticated user
    websocketService.connect(user.id);

    // Subscribe to Event Bus
    const unsubscribe = notificationEventBus.subscribe((incoming) => {
      if (incoming.userId === user.id) {
        setNotifications((prev) => {
          if (prev.some((n) => n.id === incoming.id)) return prev;
          return [incoming, ...prev];
        });
        if (!incoming.isRead) {
          setUnreadCount((cnt) => cnt + 1);
        }
        // Show Toast for HIGH or URGENT priority events
        if (incoming.priority === 'HIGH' || incoming.priority === 'URGENT') {
          setToastNotification(incoming);
        }
      }
    });

    return () => {
      unsubscribe();
      websocketService.disconnect();
    };
  }, [user]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    toastNotification,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    dismissToast,
  };
};
