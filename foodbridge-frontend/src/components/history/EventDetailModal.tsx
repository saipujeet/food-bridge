import React from 'react';
import type { DonationHistoryEvent, DeliveryHistoryEvent } from '../../types';
import { X, ShieldCheck, Clock, Hash } from 'lucide-react';

interface EventDetailModalProps {
  event: (DonationHistoryEvent | DeliveryHistoryEvent) | null;
  onClose: () => void;
}

export const EventDetailModal: React.FC<EventDetailModalProps> = ({ event, onClose }) => {
  if (!event) return null;

  const code = ('donationCode' in event ? event.donationCode : (event as DeliveryHistoryEvent).deliveryCode) || String(event.id);
  const resourceType = 'donationCode' in event ? 'Food Donation' : 'Volunteer Delivery';

  const formatFullDate = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleString('en-IN', {
        dateStyle: 'full',
        timeStyle: 'medium',
      });
    } catch {
      return iso;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white w-full max-w-lg rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">Historical Event Detail</h3>
              <p className="text-[11px] text-slate-500">{resourceType} • {code}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-200/60 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 text-xs overflow-y-auto max-h-[75vh]">
          {/* Tamper Resistance Notice */}
          <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex items-start space-x-2 text-emerald-900">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-[11px]">
              <span className="font-bold">Cryptographically Timestamped Record:</span> This event is permanently recorded in the immutable audit log and cannot be modified or purged.
            </div>
          </div>

          {/* Key Attribute Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Event Type</span>
              <span className="font-bold text-slate-800 font-mono text-[11px]">{event.eventType}</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Resource Code</span>
              <span className="font-bold text-slate-800 font-mono text-[11px]">{code}</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Actor Role</span>
              <span className="font-bold text-indigo-700 font-mono text-[11px]">{event.actorRole || 'SYSTEM'}</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Actor Identity</span>
              <span className="font-semibold text-slate-700 truncate block text-[11px]" title={event.actorEmail || 'N/A'}>
                {event.actorEmail || 'Automated System Scheduler'}
              </span>
            </div>
          </div>

          {/* Status Transition Diff */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Lifecycle State Change</span>
            <div className="flex items-center space-x-2 font-mono">
              <span className="px-2.5 py-1 rounded-lg bg-slate-200 text-slate-700 text-[11px]">
                {event.previousStatus || 'ORIGIN'}
              </span>
              <span className="text-slate-400 font-black">→</span>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[11px]">
                {event.newStatus}
              </span>
            </div>
          </div>

          {/* Description */}
          {event.description && (
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Audit Description / Memo</span>
              <p className="text-slate-700 leading-relaxed font-sans">{event.description}</p>
            </div>
          )}

          {/* Timestamp & Correlation ID */}
          <div className="space-y-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
            <div className="flex items-center justify-between">
              <span className="flex items-center space-x-1.5 text-slate-400">
                <Clock className="w-3.5 h-3.5" />
                <span>Recorded Timestamp:</span>
              </span>
              <span className="font-medium text-slate-700">{formatFullDate(event.createdAt)}</span>
            </div>

            {event.correlationId && (
              <div className="flex items-center justify-between">
                <span className="flex items-center space-x-1.5 text-slate-400">
                  <Hash className="w-3.5 h-3.5" />
                  <span>Correlation Trace ID:</span>
                </span>
                <span className="font-mono text-[10px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                  {event.correlationId}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
