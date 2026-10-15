import React from 'react';
import { RefreshCw, Calendar } from 'lucide-react';
import { Button } from '../common/Button';

export interface DateRangeFilterProps {
  selectedPeriod: 'today' | 'week' | 'month';
  onPeriodChange: (period: 'today' | 'week' | 'month') => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
  lastUpdated?: string;
  className?: string;
}

export const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
  selectedPeriod,
  onPeriodChange,
  onRefresh,
  isRefreshing = false,
  lastUpdated,
  className = '',
}) => {
  const formatLastUpdated = (iso?: string) => {
    if (!iso) return 'Just now';
    try {
      const d = new Date(iso);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return 'Recently';
    }
  };

  return (
    <div
      className={`bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${className}`}
    >
      {/* Period Selection Buttons */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0">
        <span className="text-xs font-bold text-slate-500 mr-1 flex items-center shrink-0">
          <Calendar className="w-3.5 h-3.5 mr-1" />
          Period:
        </span>
        {(
          [
            { id: 'today', label: 'Today' },
            { id: 'week', label: 'Last 7 Days' },
            { id: 'month', label: 'Last 30 Days' },
          ] as const
        ).map((item) => (
          <button
            key={item.id}
            onClick={() => onPeriodChange(item.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              selectedPeriod === item.id
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Refresh and Timestamp */}
      <div className="flex items-center justify-between sm:justify-end space-x-3 text-xs text-slate-400">
        {lastUpdated && (
          <span className="text-[11px] font-medium text-slate-500">
            Updated: <strong className="text-slate-700">{formatLastUpdated(lastUpdated)}</strong>
          </span>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          isLoading={isRefreshing}
          leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />}
        >
          Refresh
        </Button>
      </div>
    </div>
  );
};
