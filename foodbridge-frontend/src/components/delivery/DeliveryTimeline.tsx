import React from 'react';
import type { DeliveryStatus, DeliveryTask } from '../../types';

interface DeliveryTimelineProps {
  task: DeliveryTask;
}

interface TimelineStep {
  key: string;
  title: string;
  subtitle?: string;
  status: DeliveryStatus[];
  timestamp?: string | null;
}

export const DeliveryTimeline: React.FC<DeliveryTimelineProps> = ({ task }) => {
  const steps: TimelineStep[] = [
    {
      key: 'created',
      title: 'Task Created',
      subtitle: 'Awaiting volunteer assignment',
      status: ['PENDING_ASSIGNMENT', 'ASSIGNED', 'ACCEPTED', 'PICKUP_PENDING', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED'],
      timestamp: task.createdAt,
    },
    {
      key: 'accepted',
      title: 'Task Accepted',
      subtitle: task.volunteerName ? `Assigned to ${task.volunteerName}` : 'Volunteer assigned',
      status: ['ACCEPTED', 'PICKUP_PENDING', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED'],
      timestamp: task.acceptedAt || task.assignedAt,
    },
    {
      key: 'picked_up',
      title: 'Food Picked Up',
      subtitle: 'Collected from donor location',
      status: ['PICKED_UP', 'IN_TRANSIT', 'DELIVERED'],
      timestamp: task.pickedUpAt,
    },
    {
      key: 'in_transit',
      title: 'In Transit',
      subtitle: 'En route to NGO drop-off',
      status: ['IN_TRANSIT', 'DELIVERED'],
      timestamp: task.inTransitAt,
    },
    {
      key: 'delivered',
      title: 'Delivered',
      subtitle: 'Handed over to NGO',
      status: ['DELIVERED'],
      timestamp: task.deliveredAt,
    },
  ];

  const getStepState = (stepStatuses: DeliveryStatus[]) => {
    if (task.status === 'CANCELLED' || task.status === 'FAILED') {
      return 'failed';
    }
    const currentIndex = steps.findIndex((s) => s.status.includes(task.status));
    const stepIndex = steps.findIndex((s) => s.status === stepStatuses);

    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'upcoming';
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' });
  };

  return (
    <div className="py-4">
      <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center justify-between">
        <span>Delivery Lifecycle Progress</span>
        <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded">ID: {task.id}</span>
      </h4>

      <div className="relative">
        {steps.map((step, idx) => {
          const state = getStepState(step.status);
          const isLast = idx === steps.length - 1;

          return (
            <div key={step.key} className="relative flex items-start mb-6 last:mb-0 group">
              {/* Vertical Connecting Line */}
              {!isLast && (
                <div
                  className={`absolute left-3.5 top-7 bottom-0 w-0.5 -ml-px ${
                    state === 'completed' ? 'bg-emerald-500' : 'bg-gray-200'
                  }`}
                  aria-hidden="true"
                />
              )}

              {/* Icon Node */}
              <div className="relative flex items-center justify-center flex-shrink-0">
                {state === 'completed' ? (
                  <span className="h-7 w-7 rounded-full bg-emerald-500 flex items-center justify-center text-white ring-4 ring-white shadow-sm">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                ) : state === 'current' ? (
                  <span className="h-7 w-7 rounded-full bg-blue-600 flex items-center justify-center text-white ring-4 ring-blue-100 shadow-md animate-pulse">
                    <span className="h-2.5 w-2.5 rounded-full bg-white" />
                  </span>
                ) : (
                  <span className="h-7 w-7 rounded-full bg-gray-100 border-2 border-gray-300 flex items-center justify-center text-gray-400">
                    <span className="h-2 w-2 rounded-full bg-gray-300" />
                  </span>
                )}
              </div>

              {/* Step Content */}
              <div className="ml-4 min-w-0 flex-1 pt-0.5">
                <div className="flex items-center justify-between text-xs">
                  <p
                    className={`font-semibold ${
                      state === 'completed'
                        ? 'text-emerald-900'
                        : state === 'current'
                        ? 'text-blue-900 font-bold'
                        : 'text-gray-400'
                    }`}
                  >
                    {step.title}
                  </p>
                  {step.timestamp && (
                    <time className="text-gray-500 font-mono text-[11px]">{formatDate(step.timestamp)}</time>
                  )}
                </div>
                {step.subtitle && (
                  <p className={`text-xs mt-0.5 ${state === 'current' ? 'text-blue-700' : 'text-gray-500'}`}>
                    {step.subtitle}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
