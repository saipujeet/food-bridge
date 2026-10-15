import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../hooks/useNotifications';
import type { NotificationPriority, NotificationCategory } from '../../types';
import {
  Bell,
  CheckCheck,
  Trash2,
  Filter,
  Search,
  RefreshCw,
  ExternalLink,
  Info,
  AlertTriangle,
  Package,
  Layers,
  Truck,
  Shield,
} from 'lucide-react';
import { Button } from '../../components/common/Button';

export const NotificationCenterPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | 'UNREAD' | 'READ'>('ALL');
  const [selectedPriority, setSelectedPriority] = useState<string>('ALL');

  // Filtered Notifications computation
  const filteredNotifications = useMemo(() => {
    return notifications.filter((item) => {
      // Category filter
      if (selectedCategory !== 'ALL' && item.category !== selectedCategory) {
        return false;
      }
      // Status filter
      if (selectedStatus === 'UNREAD' && item.isRead) return false;
      if (selectedStatus === 'READ' && !item.isRead) return false;

      // Priority filter
      if (selectedPriority !== 'ALL' && item.priority !== selectedPriority) return false;

      // Search Query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(query);
        const matchesMsg = item.message.toLowerCase().includes(query);
        return matchesTitle || matchesMsg;
      }

      return true;
    });
  }, [notifications, selectedCategory, selectedStatus, selectedPriority, searchQuery]);

  const getCategoryIcon = (category: NotificationCategory) => {
    switch (category) {
      case 'DONATION':
        return <Package className="w-4 h-4 text-emerald-600" />;
      case 'MATCH':
        return <Layers className="w-4 h-4 text-blue-600" />;
      case 'DELIVERY':
        return <Truck className="w-4 h-4 text-amber-600" />;
      case 'SYSTEM':
      case 'VERIFICATION':
        return <Shield className="w-4 h-4 text-purple-600" />;
      default:
        return <Bell className="w-4 h-4 text-gray-600" />;
    }
  };

  const getPriorityBadgeClass = (priority: NotificationPriority) => {
    switch (priority) {
      case 'URGENT':
        return 'bg-rose-100 text-rose-800 border-rose-200 font-extrabold';
      case 'HIGH':
        return 'bg-amber-100 text-amber-800 border-amber-200 font-bold';
      case 'NORMAL':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'LOW':
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const handleNavigate = (referenceType?: string, referenceId?: string) => {
    if (referenceType === 'DONATION' && referenceId) {
      navigate(`/donor/donations/${referenceId}`);
    } else if (referenceType === 'MATCH' && referenceId) {
      navigate(`/ngo/matches/${referenceId}`);
    } else if (referenceType === 'DELIVERY' && referenceId) {
      navigate(`/volunteer/deliveries/${referenceId}`);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto py-2">
      {/* HEADER SECTION */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Notification Center</h1>
              <p className="text-xs text-slate-500 font-medium">
                Real-time alerts, match updates, and delivery dispatch communications
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {unreadCount > 0 && (
            <Button variant="secondary" size="sm" onClick={markAllAsRead} className="flex items-center space-x-2">
              <CheckCheck className="w-4 h-4 text-emerald-600" />
              <span>Mark All as Read ({unreadCount})</span>
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={fetchNotifications} className="flex items-center space-x-2">
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
        {/* Search & Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="md:col-span-2 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search notifications by title or message..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
            />
          </div>

          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as 'ALL' | 'UNREAD' | 'READ')}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50 text-slate-700 font-semibold"
            >
              <option value="ALL">Status: All Statuses</option>
              <option value="UNREAD">Status: Unread Only</option>
              <option value="READ">Status: Read Only</option>
            </select>
          </div>

          <div>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50 text-slate-700 font-semibold"
            >
              <option value="ALL">Priority: All Priorities</option>
              <option value="URGENT">Priority: URGENT</option>
              <option value="HIGH">Priority: HIGH</option>
              <option value="NORMAL">Priority: NORMAL</option>
              <option value="LOW">Priority: LOW</option>
            </select>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center space-x-2 border-t border-slate-100 pt-3 overflow-x-auto pb-1">
          <span className="text-[11px] font-bold text-slate-400 flex items-center mr-2 shrink-0">
            <Filter className="w-3 h-3 mr-1" /> Category:
          </span>
          {[
            { id: 'ALL', label: 'All' },
            { id: 'DONATION', label: 'Donations' },
            { id: 'MATCH', label: 'Matches' },
            { id: 'DELIVERY', label: 'Deliveries' },
            { id: 'SYSTEM', label: 'System' },
            { id: 'VERIFICATION', label: 'Verification' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedCategory(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                selectedCategory === tab.id
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ERROR ALERT */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* NOTIFICATIONS LIST */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
            <p className="text-xs font-semibold text-slate-500">Loading notifications from event bus...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Info className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">No Notifications Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              There are no notifications matching your search filter or selected category tab.
            </p>
          </div>
        ) : (
          filteredNotifications.map((item) => (
            <div
              key={item.id}
              className={`p-4 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                item.isRead
                  ? 'bg-white border-slate-200 text-slate-700'
                  : 'bg-emerald-50/50 border-emerald-300 text-slate-900 shadow-xs'
              }`}
            >
              <div className="flex items-start space-x-4 min-w-0">
                {/* Category Icon */}
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-center shrink-0 mt-0.5">
                  {getCategoryIcon(item.category)}
                </div>

                {/* Main Content */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center space-x-2 flex-wrap gap-y-1 mb-1">
                    <h3 className={`text-sm font-bold truncate ${item.isRead ? 'text-slate-800' : 'text-slate-950 font-black'}`}>
                      {item.title}
                    </h3>
                    <span className={`text-[10px] px-2 py-0.5 rounded border ${getPriorityBadgeClass(item.priority)}`}>
                      {item.priority}
                    </span>
                    {!item.isRead && (
                      <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        New
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed mb-2">{item.message}</p>

                  <div className="flex items-center space-x-4 text-[10px] text-slate-400 font-mono">
                    <span>Received: {new Date(item.createdAt).toLocaleString()}</span>
                    <span>•</span>
                    <span>Category: {item.category}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2 shrink-0 self-end md:self-center">
                {item.referenceId && item.referenceType && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (!item.isRead) markAsRead(item.id);
                      handleNavigate(item.referenceType, item.referenceId);
                    }}
                    className="flex items-center space-x-1.5 text-xs text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                  >
                    <span>View Target</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Button>
                )}

                {!item.isRead && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => markAsRead(item.id)}
                    className="text-xs text-slate-600 hover:text-emerald-700"
                    title="Mark as Read"
                  >
                    <CheckCheck className="w-4 h-4" />
                  </Button>
                )}

                <button
                  onClick={() => deleteNotification(item.id)}
                  className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Delete Notification"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
