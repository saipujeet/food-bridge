import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { NotificationItem as NotificationItemType } from '../../types';

interface NotificationItemProps {
  notification: NotificationItemType;
  onMarkAsRead?: (id: string) => void;
  onCloseDropdown?: () => void;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
  onCloseDropdown,
}) => {
  const navigate = useNavigate();

  const getNotificationIcon = () => {
    switch (notification.type) {
      case 'DONATION_CREATED':
      case 'DONATION_EXPIRED':
      case 'DONATION_CANCELLED':
        return '📦';
      case 'MATCH_FOUND':
      case 'MATCH_RADIUS_EXPANDED':
        return '🔍';
      case 'DONATION_ACCEPTED':
      case 'DONATION_REJECTED':
        return '🎉';
      case 'VOLUNTEER_ASSIGNED':
      case 'DELIVERY_ACCEPTED':
        return '🛵';
      case 'PICKUP_PENDING':
      case 'FOOD_PICKED_UP':
        return '📦';
      case 'DELIVERY_STARTED':
      case 'DELIVERY_COMPLETED':
        return '🚚';
      case 'NGO_VERIFICATION':
      case 'VOLUNTEER_VERIFICATION':
        return '🛡️';
      default:
        return '🔔';
    }
  };

  const getPriorityBadge = () => {
    switch (notification.priority) {
      case 'URGENT':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'HIGH':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'LOW':
        return 'bg-gray-100 text-gray-600 border-gray-200';
      default:
        return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffSeconds < 60) return 'Just now';
    const diffMins = Math.floor(diffSeconds / 60);
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const handleClick = () => {
    if (!notification.isRead && onMarkAsRead) {
      onMarkAsRead(notification.id);
    }

    if (onCloseDropdown) {
      onCloseDropdown();
    }

    // Dynamic Resource Navigation based on referenceType & referenceId
    if (notification.referenceType === 'DONATION' && notification.referenceId) {
      navigate(`/donor/donations/${notification.referenceId}`);
    } else if (notification.referenceType === 'MATCH' && notification.referenceId) {
      navigate(`/ngo/matches/${notification.referenceId}`);
    } else if (notification.referenceType === 'DELIVERY' && notification.referenceId) {
      navigate(`/volunteer/deliveries/${notification.referenceId}`);
    } else {
      navigate('/notifications');
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start space-x-3 ${
        notification.isRead
          ? 'bg-white border-gray-100 text-gray-600 hover:bg-gray-50'
          : 'bg-emerald-50/40 border-emerald-200 text-gray-900 font-medium hover:bg-emerald-50/70 shadow-xs'
      }`}
    >
      {/* Icon Node */}
      <div className="w-9 h-9 rounded-full bg-white border border-gray-200 shadow-xs flex items-center justify-center text-base shrink-0 mt-0.5">
        {getNotificationIcon()}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <h4
            className={`text-xs font-bold truncate ${
              notification.isRead ? 'text-gray-800' : 'text-emerald-950 font-black'
            }`}
          >
            {notification.title}
          </h4>
          <span className="text-[10px] font-mono text-gray-400 shrink-0">
            {formatTimeAgo(notification.createdAt)}
          </span>
        </div>

        <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed mb-1.5">{notification.message}</p>

        <div className="flex items-center justify-between pt-1">
          <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded border ${getPriorityBadge()}`}>
            {notification.priority}
          </span>
          {!notification.isRead && (
            <span className="inline-flex items-center text-[10px] font-bold text-emerald-700">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mr-1 animate-pulse" />
              Unread
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
