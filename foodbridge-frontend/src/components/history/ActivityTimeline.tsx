import React from 'react';
import type { DonationHistoryEvent, DeliveryHistoryEvent } from '../../types';
import {
  Sparkles,
  Search,
  CheckCircle2,
  Clock,
  Truck,
  Box,
  XCircle,
  AlertTriangle,
  ExternalLink,
  Shield,
  Layers,
} from 'lucide-react';

interface ActivityTimelineProps {
  events: (DonationHistoryEvent | DeliveryHistoryEvent)[];
  onSelectEvent?: (event: DonationHistoryEvent | DeliveryHistoryEvent) => void;
  emptyMessage?: string;
}

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({
  events,
  onSelectEvent,
  emptyMessage = 'No historical activity records found.',
}) => {
  if (!events || events.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400 mb-3">
          <Clock className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-bold text-slate-800">Timeline Empty</h4>
        <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">{emptyMessage}</p>
      </div>
    );
  }

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'DONATION_CREATED':
      case 'DELIVERY_CREATED':
        return <Sparkles className="w-4 h-4 text-emerald-600" />;
      case 'MATCH_SEARCH_INITIATED':
        return <Search className="w-4 h-4 text-blue-600" />;
      case 'NGO_ACCEPTED':
      case 'VOLUNTEER_ASSIGNED':
        return <CheckCircle2 className="w-4 h-4 text-purple-600" />;
      case 'PICKUP_COMPLETED':
      case 'PICKED_UP':
        return <Box className="w-4 h-4 text-amber-600" />;
      case 'IN_TRANSIT':
        return <Truck className="w-4 h-4 text-indigo-600" />;
      case 'DELIVERY_COMPLETED':
        return <CheckCircle2 className="w-4 h-4 text-teal-600" />;
      case 'DONATION_EXPIRED':
        return <AlertTriangle className="w-4 h-4 text-rose-500" />;
      case 'DONATION_CANCELLED':
      case 'DELIVERY_CANCELLED':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Layers className="w-4 h-4 text-slate-500" />;
    }
  };

  const getEventBg = (type: string) => {
    switch (type) {
      case 'DONATION_CREATED':
      case 'DELIVERY_CREATED':
        return 'bg-emerald-50 border-emerald-200 text-emerald-800';
      case 'MATCH_SEARCH_INITIATED':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'NGO_ACCEPTED':
      case 'VOLUNTEER_ASSIGNED':
        return 'bg-purple-50 border-purple-200 text-purple-800';
      case 'PICKUP_COMPLETED':
      case 'PICKED_UP':
        return 'bg-amber-50 border-amber-200 text-amber-800';
      case 'IN_TRANSIT':
        return 'bg-indigo-50 border-indigo-200 text-indigo-800';
      case 'DELIVERY_COMPLETED':
        return 'bg-teal-50 border-teal-200 text-teal-800';
      case 'DONATION_EXPIRED':
        return 'bg-rose-50 border-rose-200 text-rose-800';
      case 'DONATION_CANCELLED':
      case 'DELIVERY_CANCELLED':
        return 'bg-red-50 border-red-200 text-red-800';
      default:
        return 'bg-slate-50 border-slate-200 text-slate-700';
    }
  };

  const formatTimestamp = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return iso;
    }
  };

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
      {events.map((event, idx) => {
        const code = ('donationCode' in event ? event.donationCode : (event as DeliveryHistoryEvent).deliveryCode) || String(event.id);
        return (
          <div key={event.id || idx} className="relative group">
            {/* Dot marker */}
            <div className="absolute -left-6 top-1.5 w-6 h-6 rounded-full bg-white border-2 border-slate-300 group-hover:border-emerald-500 flex items-center justify-center shadow-xs transition-colors">
              <span className="w-2 h-2 rounded-full bg-slate-400 group-hover:bg-emerald-600 transition-colors" />
            </div>

            {/* Event Box */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs hover:border-slate-300 hover:shadow-sm transition-all">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${getEventBg(event.eventType)}`}>
                    {getEventIcon(event.eventType)}
                    <span>{event.eventType.replace(/_/g, ' ')}</span>
                  </span>
                  <span className="font-mono text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                    {code}
                  </span>
                </div>

                <div className="flex items-center space-x-2 text-[11px] text-slate-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{formatTimestamp(event.createdAt)}</span>
                </div>
              </div>

              {/* Status Transition Diff */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs font-medium my-2">
                <span className="text-slate-500">Status transition:</span>
                {event.previousStatus ? (
                  <>
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-mono text-[11px]">
                      {event.previousStatus}
                    </span>
                    <span className="text-slate-400 font-bold">→</span>
                  </>
                ) : (
                  <span className="text-slate-400 italic text-[11px]">Initial</span>
                )}
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono font-bold text-[11px]">
                  {event.newStatus}
                </span>
              </div>

              {/* Description */}
              {event.description && (
                <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 mt-2">
                  {event.description}
                </p>
              )}

              {/* Footer Meta: Actor & Correlation ID */}
              <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
                <div className="flex items-center space-x-2">
                  <span className="inline-flex items-center space-x-1 font-semibold text-slate-700">
                    <Shield className="w-3 h-3 text-slate-400" />
                    <span>Actor: {event.actorRole || 'SYSTEM'}</span>
                  </span>
                  {event.actorEmail && <span className="text-slate-400">({event.actorEmail})</span>}
                </div>

                <div className="flex items-center space-x-3">
                  {event.correlationId && (
                    <span className="font-mono text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded" title="Audit Correlation ID">
                      corr: {event.correlationId.substring(0, 12)}...
                    </span>
                  )}
                  {onSelectEvent && (
                    <button
                      onClick={() => onSelectEvent(event)}
                      className="inline-flex items-center space-x-1 text-emerald-600 hover:text-emerald-800 font-bold cursor-pointer transition-colors"
                    >
                      <span>Details</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
