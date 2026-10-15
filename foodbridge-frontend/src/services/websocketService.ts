import { notificationEventBus } from '../utils/notificationEventBus';
import type { NotificationItem } from '../types';

export const websocketService = {
  _isConnected: false,

  connect: (userId: string): void => {
    if (!userId) return;
    websocketService._isConnected = true;
    console.log(`[WebSocket] Connected to channel /user/${userId}/notifications`);
  },

  disconnect: (): void => {
    websocketService._isConnected = false;
    console.log('[WebSocket] Disconnected from notifications channel.');
  },

  publishRealTimeNotification: (notification: NotificationItem): void => {
    // Emit notification event to all active React client subscribers
    notificationEventBus.emit(notification);
  },

  getIsConnected: (): boolean => websocketService._isConnected,
};
