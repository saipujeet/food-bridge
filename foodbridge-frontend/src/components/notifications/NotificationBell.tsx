import React, { useState, useRef, useEffect } from 'react';
import { useNotifications } from '../../hooks/useNotifications';
import { NotificationDropdown } from './NotificationDropdown';
import { Bell } from 'lucide-react';

export const NotificationBell: React.FC = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block" ref={bellRef}>
      <button
        onClick={() => setDropdownOpen((prev) => !prev)}
        className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors focus:outline-none"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5 text-slate-700" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-white animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <NotificationDropdown
        isOpen={dropdownOpen}
        onClose={() => setDropdownOpen(false)}
        notifications={notifications}
        unreadCount={unreadCount}
        onMarkAsRead={markAsRead}
        onMarkAllAsRead={markAllAsRead}
      />
    </div>
  );
};
