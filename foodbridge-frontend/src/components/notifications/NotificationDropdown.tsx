import React from 'react';
import { Link } from 'react-router-dom';
import type { NotificationItem as NotificationItemType } from '../../types';
import { NotificationItem } from './NotificationItem';

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItemType[];
  unreadCount: number;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  isOpen,
  onClose,
  notifications,
  unreadCount,
  onMarkAsRead,
  onMarkAllAsRead,
}) => {
  if (!isOpen) return null;

  const recentNotifications = notifications.slice(0, 5);

  return (
    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-gray-200 z-50 overflow-hidden transform transition-all">
      {/* Header */}
      <div className="p-4 bg-slate-50 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-lg">🔔</span>
          <h3 className="text-sm font-bold text-gray-900">Notifications</h3>
          {unreadCount > 0 && (
            <span className="bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
              {unreadCount} unread
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={onMarkAllAsRead}
            className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 transition-colors"
          >
            Mark all read
          </button>
        )}
      </div>

      {/* Notification List */}
      <div className="max-h-80 overflow-y-auto p-3 space-y-2 divide-y-0">
        {recentNotifications.length === 0 ? (
          <div className="py-8 text-center text-gray-400">
            <span className="text-3xl block mb-1">🔕</span>
            <p className="text-xs font-semibold text-gray-600">No Notifications Yet</p>
            <p className="text-[11px] text-gray-400 mt-0.5">Events across the platform will appear here.</p>
          </div>
        ) : (
          recentNotifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onMarkAsRead={onMarkAsRead}
              onCloseDropdown={onClose}
            />
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-3 bg-gray-50 border-t border-gray-100 text-center">
        <Link
          to="/notifications"
          onClick={onClose}
          className="text-xs font-bold text-emerald-700 hover:text-emerald-900 block"
        >
          View Notification Center →
        </Link>
      </div>
    </div>
  );
};
