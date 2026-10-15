import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDelivery } from '../../hooks/useDelivery';
import type { DeliveryTask } from '../../types';
import { AcceptDeliveryModal } from '../../components/delivery/AcceptDeliveryModal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Navigation } from 'lucide-react';

export const AvailableDeliveries: React.FC = () => {
  const navigate = useNavigate();
  const { availableDeliveries, isLoading, error: fetchError, fetchAvailableDeliveries, acceptDelivery } = useDelivery();
  const [selectedTask, setSelectedTask] = useState<DeliveryTask | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchAvailableDeliveries();
  }, [fetchAvailableDeliveries]);

  const handleOpenAcceptModal = (task: DeliveryTask) => {
    setSelectedTask(task);
    setActionError(null);
    setIsModalOpen(true);
  };

  const handleConfirmAccept = async (notes?: string) => {
    if (!selectedTask) return;
    setIsSubmitting(true);
    setActionError(null);
    try {
      const acceptedTask = await acceptDelivery(selectedTask.id, notes);
      setIsModalOpen(false);
      setSelectedTask(null);
      // Immediately open Delivery Map App!
      navigate(`/deliveries/${acceptedTask.id}/map`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to accept delivery task';
      setActionError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading && availableDeliveries.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner text="Searching for eligible delivery tasks..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Available Delivery Tasks</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Redistribute surplus food from donors to verified recipient NGOs in your service area
            </p>
          </div>
          <button
            onClick={() => fetchAvailableDeliveries()}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-lg transition-all flex items-center space-x-1 self-start sm:self-auto cursor-pointer"
          >
            <span>🔄 Refresh Tasks</span>
          </button>
        </div>

        {fetchError && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">{fetchError}</div>
        )}

        {availableDeliveries.length === 0 ? (
          <div className="bg-white p-12 rounded-xl border border-gray-200 text-center shadow-sm">
            <div className="text-4xl mb-3">📍</div>
            <h3 className="text-lg font-bold text-gray-900">No Available Delivery Tasks</h3>
            <p className="text-xs text-gray-500 max-w-md mx-auto mt-1">
              There are currently no unassigned food delivery tasks matching your service area. Please check back shortly as new donation acceptances arrive!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableDeliveries.map((task) => (
              <div
                key={task.id}
                className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-extrabold text-emerald-700 uppercase bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {task.foodCategory}
                      </span>
                      <h3 className="text-lg font-bold text-gray-900 mt-1">{task.foodName}</h3>
                    </div>
                    <span className="text-xs font-black text-amber-700 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200">
                      📍 {task.distanceKm} km
                    </span>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-lg text-xs space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-500 font-medium">Quantity:</span>
                      <span className="font-bold text-gray-900">
                        {task.quantity} {task.unit}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-500 font-medium">Pickup Area:</span>
                      <span className="font-medium text-gray-900 text-right truncate max-w-[160px]">
                        {task.pickupAddress}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-500 font-medium">Drop NGO:</span>
                      <span className="font-semibold text-blue-900 text-right truncate max-w-[160px]">
                        {task.ngoName}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-500 font-medium">Pickup Deadline:</span>
                      <span className="font-mono text-rose-700 font-semibold">
                        {new Date(task.availableUntil).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 mt-4 flex items-center space-x-2">
                  <button
                    onClick={() => handleOpenAcceptModal(task)}
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow transition-all flex items-center justify-center space-x-1 cursor-pointer"
                  >
                    <span>Accept Delivery Task</span>
                  </button>
                  <button
                    onClick={() => navigate(`/deliveries/${task.id}/map`)}
                    className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg transition-all flex items-center justify-center space-x-1 cursor-pointer"
                    title="View Three-Point Delivery Map"
                  >
                    <Navigation className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Map</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AcceptDeliveryModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedTask(null);
        }}
        onConfirm={handleConfirmAccept}
        task={selectedTask}
        isLoading={isSubmitting}
        error={actionError}
      />
    </div>
  );
};
