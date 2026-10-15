import React, { useState } from 'react';
import type { DeliveryTask } from '../../types';

interface AcceptDeliveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (notes?: string) => Promise<void>;
  task: DeliveryTask | null;
  isLoading: boolean;
  error?: string | null;
}

export const AcceptDeliveryModal: React.FC<AcceptDeliveryModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  task,
  isLoading,
  error,
}) => {
  const [notes, setNotes] = useState<string>('');

  if (!isOpen || !task) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onConfirm(notes);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl transform transition-all">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center space-x-2">
            <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
              🚚
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Accept Delivery Task</h3>
              <p className="text-xs text-gray-500">Confirm logistics assignment</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-start space-x-2">
            <span className="font-bold text-base">⚠️</span>
            <div>
              <p className="font-bold">Acceptance Conflict</p>
              <p>{error}</p>
            </div>
          </div>
        )}

        <div className="my-5 space-y-3 bg-gray-50 p-4 rounded-lg border border-gray-200 text-sm">
          <div className="flex justify-between items-center pb-2 border-b border-gray-200">
            <span className="text-gray-500 font-medium">Food Package:</span>
            <span className="font-bold text-gray-900">{task.foodName}</span>
          </div>

          <div className="flex justify-between items-center pb-2 border-b border-gray-200">
            <span className="text-gray-500 font-medium">Quantity:</span>
            <span className="font-semibold text-emerald-700">
              {task.quantity} {task.unit}
            </span>
          </div>

          <div className="flex justify-between items-start pb-2 border-b border-gray-200">
            <span className="text-gray-500 font-medium">Pickup Location:</span>
            <span className="font-medium text-gray-900 text-right max-w-[220px]">{task.pickupAddress}</span>
          </div>

          <div className="flex justify-between items-start pb-2 border-b border-gray-200">
            <span className="text-gray-500 font-medium">Drop Location:</span>
            <span className="font-medium text-blue-900 text-right max-w-[220px]">{task.dropAddress} ({task.ngoName})</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-500 font-medium">Est. Distance:</span>
            <span className="font-bold text-amber-700">📍 {task.distanceKm} km</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Optional Volunteer Notes / Arrival ETA:
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Arriving at donor spot in 15 mins..."
              className="w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 shadow-md flex items-center space-x-1"
            >
              {isLoading ? <span>Processing...</span> : <span>Confirm & Accept Task</span>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
