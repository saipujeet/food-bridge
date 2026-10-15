import React from 'react';
import { Search, RotateCcw, RefreshCw } from 'lucide-react';

interface HistoryFilterBarProps {
  search: string;
  onSearchChange: (val: string) => void;
  eventType: string;
  onEventTypeChange: (val: string) => void;
  status: string;
  onStatusChange: (val: string) => void;
  onReset: () => void;
  onRefresh: () => void;
  isLoading?: boolean;
  eventTypes?: { label: string; value: string }[];
  statuses?: { label: string; value: string }[];
}

export const HistoryFilterBar: React.FC<HistoryFilterBarProps> = ({
  search,
  onSearchChange,
  eventType,
  onEventTypeChange,
  status,
  onStatusChange,
  onReset,
  onRefresh,
  isLoading = false,
  eventTypes = [
    { label: 'All Event Types', value: 'ALL' },
    { label: 'Donation Created', value: 'DONATION_CREATED' },
    { label: 'Search Initiated', value: 'MATCH_SEARCH_INITIATED' },
    { label: 'NGO Accepted', value: 'NGO_ACCEPTED' },
    { label: 'Volunteer Assigned', value: 'VOLUNTEER_ASSIGNED' },
    { label: 'Pickup Completed', value: 'PICKUP_COMPLETED' },
    { label: 'In Transit', value: 'IN_TRANSIT' },
    { label: 'Delivered', value: 'DELIVERY_COMPLETED' },
    { label: 'Expired', value: 'DONATION_EXPIRED' },
    { label: 'Cancelled', value: 'DONATION_CANCELLED' },
  ],
  statuses = [
    { label: 'All Statuses', value: 'ALL' },
    { label: 'Available', value: 'AVAILABLE' },
    { label: 'Matching', value: 'MATCHING' },
    { label: 'Accepted', value: 'ACCEPTED' },
    { label: 'Picked Up', value: 'PICKED_UP' },
    { label: 'In Transit', value: 'IN_TRANSIT' },
    { label: 'Delivered', value: 'DELIVERY_COMPLETED' },
    { label: 'Expired', value: 'EXPIRED' },
  ],
}) => {
  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center gap-3">
      {/* Search Bar */}
      <div className="relative flex-1 w-full">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
        <input
          type="text"
          placeholder="Search by code (e.g. DON-1001), keyword, or actor..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-700 bg-slate-50/50"
        />
      </div>

      {/* Event Type Dropdown */}
      <div className="w-full md:w-48">
        <select
          value={eventType}
          onChange={(e) => onEventTypeChange(e.target.value)}
          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-700 bg-white"
        >
          {eventTypes.map((et) => (
            <option key={et.value} value={et.value}>
              {et.label}
            </option>
          ))}
        </select>
      </div>

      {/* Status Dropdown */}
      <div className="w-full md:w-40">
        <select
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-700 bg-white"
        >
          {statuses.map((st) => (
            <option key={st.value} value={st.value}>
              {st.label}
            </option>
          ))}
        </select>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center space-x-2 w-full md:w-auto shrink-0 justify-end">
        <button
          onClick={onReset}
          title="Reset filters"
          className="p-2 text-xs text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          onClick={onRefresh}
          disabled={isLoading}
          title="Refresh history stream"
          className="inline-flex items-center space-x-1.5 px-3 py-2 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>
    </div>
  );
};
