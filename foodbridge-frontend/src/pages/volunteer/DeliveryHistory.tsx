import React, { useState, useEffect, useCallback } from 'react';
import { useDelivery } from '../../hooks/useDelivery';
import { historyService } from '../../services/historyService';
import type { DeliveryHistoryEvent } from '../../types';
import { DeliveryStatusBadge } from '../../components/delivery/DeliveryStatusBadge';
import { ActivityTimeline } from '../../components/history/ActivityTimeline';
import { HistoryFilterBar } from '../../components/history/HistoryFilterBar';
import { EventDetailModal } from '../../components/history/EventDetailModal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useToast } from '../../context/ToastContext';
import { History, ShieldCheck, List, Layers } from 'lucide-react';

export const DeliveryHistory: React.FC = () => {
  const { myDeliveries, isLoading: isDeliveryLoading, error, fetchMyDeliveries } = useDelivery();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'timeline' | 'table'>('timeline');
  const [events, setEvents] = useState<DeliveryHistoryEvent[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [eventType, setEventType] = useState<string>('ALL');
  const [status, setStatus] = useState<string>('ALL');
  const [selectedEvent, setSelectedEvent] = useState<DeliveryHistoryEvent | null>(null);

  useEffect(() => {
    fetchMyDeliveries();
  }, [fetchMyDeliveries]);

  const fetchMilestones = useCallback(async () => {
    setIsHistoryLoading(true);
    try {
      const data = await historyService.getDeliveryHistory({
        search,
        eventType,
        status,
      });
      setEvents(data.content);
    } catch {
      showToast('Error', 'Unable to load delivery milestone history.', 'error');
    } finally {
      setIsHistoryLoading(false);
    }
  }, [search, eventType, status, showToast]);

  useEffect(() => {
    fetchMilestones();
  }, [fetchMilestones]);

  const handleReset = () => {
    setSearch('');
    setEventType('ALL');
    setStatus('ALL');
  };

  const completedDeliveries = myDeliveries.filter((d) => d.status === 'DELIVERED');

  if (isDeliveryLoading && myDeliveries.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner text="Loading delivery history..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Banner */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
              <History className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                Volunteer Delivery History
                <span className="text-xs font-bold text-purple-800 bg-purple-100 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Audit Verified
                </span>
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Detailed milestone trail of all assigned surplus food transports, pickups, and completed drop-offs
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            {/* View Switcher */}
            <div className="bg-gray-100 p-1 rounded-xl flex items-center space-x-1 text-xs font-bold">
              <button
                onClick={() => setActiveTab('timeline')}
                className={`px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition-all cursor-pointer ${
                  activeTab === 'timeline'
                    ? 'bg-white text-gray-900 shadow-xs'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Milestone Timeline</span>
              </button>
              <button
                onClick={() => setActiveTab('table')}
                className={`px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition-all cursor-pointer ${
                  activeTab === 'table'
                    ? 'bg-white text-gray-900 shadow-xs'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>Completed Tasks ({completedDeliveries.length})</span>
              </button>
            </div>
          </div>
        </div>

        {error && <div className="p-4 bg-rose-50 text-rose-700 text-xs rounded-xl">{error}</div>}

        {activeTab === 'timeline' ? (
          <div className="space-y-4">
            {/* Filter Bar */}
            <HistoryFilterBar
              search={search}
              onSearchChange={setSearch}
              eventType={eventType}
              onEventTypeChange={setEventType}
              status={status}
              onStatusChange={setStatus}
              onReset={handleReset}
              onRefresh={fetchMilestones}
              isLoading={isHistoryLoading}
              eventTypes={[
                { label: 'All Milestones', value: 'ALL' },
                { label: 'Task Generated', value: 'DELIVERY_CREATED' },
                { label: 'Volunteer Assigned', value: 'VOLUNTEER_ASSIGNED' },
                { label: 'Pickup Completed', value: 'PICKUP_COMPLETED' },
                { label: 'In Transit', value: 'IN_TRANSIT' },
                { label: 'Delivered to NGO', value: 'DELIVERY_COMPLETED' },
                { label: 'Cancelled / Reassigned', value: 'DELIVERY_CANCELLED' },
              ]}
              statuses={[
                { label: 'All Statuses', value: 'ALL' },
                { label: 'Pending Assignment', value: 'PENDING_ASSIGNMENT' },
                { label: 'Accepted', value: 'ACCEPTED' },
                { label: 'Picked Up', value: 'PICKED_UP' },
                { label: 'In Transit', value: 'IN_TRANSIT' },
                { label: 'Delivered', value: 'DELIVERED' },
              ]}
            />

            {/* Vertical Timeline */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <ActivityTimeline
                events={events}
                onSelectEvent={(evt) => setSelectedEvent(evt as DeliveryHistoryEvent)}
                emptyMessage="No delivery milestone records match your query."
              />
            </div>
          </div>
        ) : (
          /* Completed Tasks Table */
          completedDeliveries.length === 0 ? (
            <div className="bg-white p-12 rounded-xl border border-gray-200 text-center shadow-sm">
              <div className="text-4xl mb-3">📜</div>
              <h3 className="text-lg font-bold text-gray-900">No Completed Deliveries Yet</h3>
              <p className="text-xs text-gray-500 max-w-md mx-auto mt-1">
                Once you complete food transport tasks, your delivery records and proof logs will be displayed here.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-gray-600">
                  <thead className="bg-gray-50 text-gray-700 font-bold uppercase tracking-wider border-b border-gray-200">
                    <tr>
                      <th className="p-4">Delivery Code</th>
                      <th className="p-4">Food Item</th>
                      <th className="p-4">Quantity</th>
                      <th className="p-4">Donor Pickup</th>
                      <th className="p-4">Recipient NGO</th>
                      <th className="p-4">Delivered At</th>
                      <th className="p-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {completedDeliveries.map((task) => (
                      <tr key={task.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="p-4 font-mono font-semibold text-gray-900">{task.id}</td>
                        <td className="p-4 font-bold text-gray-900">{task.foodName}</td>
                        <td className="p-4 font-medium text-emerald-700">
                          {task.quantity} {task.unit}
                        </td>
                        <td className="p-4">{task.donorName}</td>
                        <td className="p-4 font-semibold text-blue-900">{task.ngoName}</td>
                        <td className="p-4 font-mono">
                          {task.deliveredAt ? new Date(task.deliveredAt).toLocaleString() : 'N/A'}
                        </td>
                        <td className="p-4 text-right">
                          <DeliveryStatusBadge status={task.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        )}
      </div>

      {/* Detail Modal */}
      {selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </div>
  );
};
