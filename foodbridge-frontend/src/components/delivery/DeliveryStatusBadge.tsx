import React from 'react';
import type { DeliveryStatus } from '../../types';

interface DeliveryStatusBadgeProps {
  status: DeliveryStatus;
  className?: string;
}

export const DeliveryStatusBadge: React.FC<DeliveryStatusBadgeProps> = ({ status, className = '' }) => {
  const getBadgeStyle = () => {
    switch (status) {
      case 'PENDING_ASSIGNMENT':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'ASSIGNED':
      case 'ACCEPTED':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'PICKUP_PENDING':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'PICKED_UP':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'IN_TRANSIT':
        return 'bg-teal-50 text-teal-700 border-teal-200';
      case 'DELIVERED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'CANCELLED':
      case 'FAILED':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getLabel = () => {
    switch (status) {
      case 'PENDING_ASSIGNMENT':
        return 'Pending Assignment';
      case 'ASSIGNED':
        return 'Assigned';
      case 'ACCEPTED':
        return 'Task Accepted';
      case 'PICKUP_PENDING':
        return 'Pickup Pending';
      case 'PICKED_UP':
        return 'Food Picked Up';
      case 'IN_TRANSIT':
        return 'In Transit';
      case 'DELIVERED':
        return 'Delivered to NGO';
      case 'CANCELLED':
        return 'Cancelled';
      case 'FAILED':
        return 'Failed';
      default:
        return status;
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getBadgeStyle()} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5"></span>
      {getLabel()}
    </span>
  );
};
