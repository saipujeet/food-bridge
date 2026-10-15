import React, { useState } from 'react';
import type { DeliveryTask } from '../../types';

interface PickupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (notes?: string, proofImageUrl?: string) => Promise<void>;
  task: DeliveryTask | null;
  isLoading: boolean;
}

export const PickupModal: React.FC<PickupModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  task,
  isLoading,
}) => {
  const [notes, setNotes] = useState<string>('');
  const [proofImageUrl, setProofImageUrl] = useState<string>('');

  if (!isOpen || !task) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onConfirm(notes, proofImageUrl);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl transform transition-all">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center space-x-2">
            <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
              📦
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Confirm Food Pickup</h3>
              <p className="text-xs text-gray-500">Record pickup from Donor</p>
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

        <div className="my-4 bg-indigo-50 p-4 rounded-lg border border-indigo-100 text-xs text-indigo-900">
          <p className="font-bold text-sm mb-1">Donor Information</p>
          <p>
            <span className="font-semibold">Donor Name:</span> {task.donorName}
          </p>
          <p>
            <span className="font-semibold">Phone:</span> {task.donorPhone}
          </p>
          <p>
            <span className="font-semibold">Address:</span> {task.pickupAddress}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Pickup Notes (Optional):</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Food verified fresh, sealed in thermal containers..."
              className="w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Proof Photo URL (Optional):
            </label>
            <input
              type="url"
              value={proofImageUrl}
              onChange={(e) => setProofImageUrl(e.target.value)}
              placeholder="https://example.com/pickup-photo.jpg"
              className="w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
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
              className="px-5 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-md flex items-center space-x-1"
            >
              {isLoading ? <span>Updating...</span> : <span>Confirm Pickup</span>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
