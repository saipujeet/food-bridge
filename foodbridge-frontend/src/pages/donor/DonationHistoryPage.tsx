import React, { useState, useEffect, useCallback } from 'react';
import { historyService } from '../../services/historyService';
import type { DonationHistoryEvent } from '../../types';
import { ActivityTimeline } from '../../components/history/ActivityTimeline';
import { HistoryFilterBar } from '../../components/history/HistoryFilterBar';
import { EventDetailModal } from '../../components/history/EventDetailModal';
import { useToast } from '../../context/ToastContext';
import { History, ShieldCheck, ArrowUpDown } from 'lucide-react';

export const DonationHistoryPage: React.FC = () => {
  const { showToast } = useToast();
  const [events, setEvents] = useState<DonationHistoryEvent[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [eventType, setEventType] = useState<string>('ALL');
  const [status, setStatus] = useState<string>('ALL');
  const [selectedEvent, setSelectedEvent] = useState<DonationHistoryEvent | null>(null);

  const fetchHistory = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await historyService.getDonationHistory({
        search,
        eventType,
        status,
      });
      setEvents(data.content);
    } catch {
      showToast('Error', 'Unable to load donation history.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [search, eventType, status, showToast]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleReset = () => {
    setSearch('');
    setEventType('ALL');
    setStatus('ALL');
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <History className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              Donation Lifecycle History
              <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Immutable Audit Trail
              </span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Chronological log of all donation creations, radius matching stages, NGO acceptances, and delivery handovers
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl shrink-0">
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
          <span>{events.length} Events Logged</span>
        </div>
      </div>

      {/* Filter Bar */}
      <HistoryFilterBar
        search={search}
        onSearchChange={setSearch}
        eventType={eventType}
        onEventTypeChange={setEventType}
        status={status}
        onStatusChange={setStatus}
        onReset={handleReset}
        onRefresh={fetchHistory}
        isLoading={isLoading}
      />

      {/* Timeline Stream */}
      <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-200/80">
        <ActivityTimeline
          events={events}
          onSelectEvent={(evt) => setSelectedEvent(evt as DonationHistoryEvent)}
          emptyMessage="No donation lifecycle events match the selected filter criteria."
        />
      </div>

      {/* Event Details Inspection Modal */}
      {selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </div>
  );
};
