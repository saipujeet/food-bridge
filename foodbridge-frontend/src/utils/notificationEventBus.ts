import type { NotificationItem } from '../types';

type NotificationListener = (notification: NotificationItem) => void;

class NotificationEventBus {
  private listeners: Set<NotificationListener> = new Set();

  public subscribe(listener: NotificationListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public emit(notification: NotificationItem): void {
    this.listeners.forEach((listener) => {
      try {
        listener(notification);
      } catch (err) {
        console.error('Notification listener error:', err);
      }
    });
  }

  public clear(): void {
    this.listeners.clear();
  }
}

export const notificationEventBus = new NotificationEventBus();
