import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDelivery } from '../../hooks/useDelivery';
import { DeliveryTimeline } from '../../components/delivery/DeliveryTimeline';
import { DeliveryStatusBadge } from '../../components/delivery/DeliveryStatusBadge';
import { PickupModal } from '../../components/delivery/PickupModal';
import { DeliveryProofModal } from '../../components/delivery/DeliveryProofModal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Navigation, MapPin } from 'lucide-react';

export const DeliveryDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { currentDelivery, isLoading, error, confirmPickup, startDelivery, completeDelivery } =
    useDelivery(id);

  const [isPickupModalOpen, setIsPickupModalOpen] = useState(false);
  const [isProofModalOpen, setIsProofModalOpen] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  if (isLoading || !currentDelivery) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner text="Loading delivery details..." />
      </div>
    );
  }

  const handleConfirmPickup = async (notes?: string, proofImageUrl?: string) => {
    if (!id) return;
    setIsActionLoading(true);
    setActionError(null);
    try {
      await confirmPickup(id, notes, proofImageUrl);
      setIsPickupModalOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to confirm pickup';
      setActionError(msg);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleStartTransit = async () => {
    if (!id) return;
    setIsActionLoading(true);
    setActionError(null);
    try {
      await startDelivery(id);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to start delivery';
      setActionError(msg);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleCompleteDelivery = async (notes?: string, proofImageUrl?: string) => {
    if (!id) return;
    setIsActionLoading(true);
    setActionError(null);
    try {
      await completeDelivery(id, notes, proofImageUrl);
      setIsProofModalOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to complete delivery';
      setActionError(msg);
    } finally {
      setIsActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link to="/volunteer/dashboard" className="text-xs font-semibold text-emerald-700 hover:text-emerald-900">
            ← Back to Volunteer Dashboard
          </Link>
          <div className="flex items-center space-x-2">
            <Link
              to={`/deliveries/${currentDelivery.id}/map`}
              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>View Interactive Delivery Map 🗺️</span>
            </Link>
            <DeliveryStatusBadge status={currentDelivery.status} />
          </div>
        </div>

        {error && <div className="p-4 bg-rose-50 text-rose-700 text-xs rounded-xl">{error}</div>}
        {actionError && <div className="p-4 bg-rose-50 text-rose-700 text-xs rounded-xl font-bold">{actionError}</div>}

        {/* PROMINENT DELIVERY MAP BANNER FOR VOLUNTEERS */}
        <div className="bg-gradient-to-r from-emerald-900 to-slate-900 text-white p-5 rounded-2xl border border-emerald-800 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <MapPin className="w-4 h-4" />
              <span>Live Three-Point Navigation Map</span>
            </div>
            <h3 className="text-base font-extrabold text-white">
              Donor → Volunteer → NGO Delivery Route
            </h3>
            <p className="text-xs text-slate-300">
              Track live coordinates, distance breakdown, and GPS route guidance for task #{currentDelivery.id}
            </p>
          </div>
          <Link
            to={`/deliveries/${currentDelivery.id}/map`}
            className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow transition-all shrink-0 text-center"
          >
            Open Live Map App 🗺️
          </Link>
        </div>

        {/* Timeline Widget */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <DeliveryTimeline task={currentDelivery} />
        </div>

        {/* Action Controller Panel */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 space-y-4">
          <h3 className="text-sm font-bold text-gray-900 border-b pb-2">Logistics Action Controller</h3>

          {(currentDelivery.status === 'ACCEPTED' || currentDelivery.status === 'PICKUP_PENDING') && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-indigo-50 p-4 rounded-lg border border-indigo-200">
              <div>
                <p className="text-sm font-bold text-indigo-950">Step 1: Confirm Food Pickup</p>
                <p className="text-xs text-indigo-700">Collect food package from Donor at pickup location</p>
              </div>
              <button
                onClick={() => setIsPickupModalOpen(true)}
                disabled={isActionLoading}
                className="w-full sm:w-auto px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg shadow transition-all cursor-pointer"
              >
                Mark as Picked Up 📦
              </button>
            </div>
          )}

          {currentDelivery.status === 'PICKED_UP' && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-purple-50 p-4 rounded-lg border border-purple-200">
              <div>
                <p className="text-sm font-bold text-purple-950">Step 2: Start Transport</p>
                <p className="text-xs text-purple-700">Food picked up! Begin transport towards NGO location</p>
              </div>
              <button
                onClick={handleStartTransit}
                disabled={isActionLoading}
                className="w-full sm:w-auto px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-lg shadow transition-all cursor-pointer"
              >
                {isActionLoading ? 'Starting...' : 'Start Delivery (In Transit) 🛵'}
              </button>
            </div>
          )}

          {currentDelivery.status === 'IN_TRANSIT' && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-teal-50 p-4 rounded-lg border border-teal-200">
              <div>
                <p className="text-sm font-bold text-teal-950">Step 3: Handover to NGO</p>
                <p className="text-xs text-teal-700">Arrived at NGO! Confirm food handover to complete task</p>
              </div>
              <button
                onClick={() => setIsProofModalOpen(true)}
                disabled={isActionLoading}
                className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow transition-all cursor-pointer"
              >
                Mark as Delivered ✅
              </button>
            </div>
          )}

          {currentDelivery.status === 'DELIVERED' && (
            <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">🎉</span>
                <div>
                  <p className="font-bold text-sm">Delivery Completed Successfully!</p>
                  <p>
                    Delivered at:{' '}
                    <span className="font-mono">{new Date(currentDelivery.deliveredAt!).toLocaleString()}</span>
                  </p>
                </div>
              </div>
              <Link
                to={`/deliveries/${currentDelivery.id}/map`}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-xs transition-all"
              >
                View Final Map Route
              </Link>
            </div>
          )}
        </div>

        {/* Location & Food Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pickup Card */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 space-y-3">
            <h4 className="text-xs font-bold text-indigo-700 uppercase tracking-wider">Pickup Details (Donor)</h4>
            <div className="space-y-1 text-sm">
              <p className="font-bold text-gray-900">{currentDelivery.donorName}</p>
              <p className="text-gray-600 text-xs">📞 Phone: {currentDelivery.donorPhone}</p>
              <p className="text-gray-700 text-xs font-medium bg-gray-50 p-2.5 rounded-lg border border-gray-200 mt-2">
                📍 {currentDelivery.pickupAddress}
              </p>
            </div>
          </div>

          {/* Drop Card */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 space-y-3">
            <h4 className="text-xs font-bold text-blue-700 uppercase tracking-wider">Drop Details (Recipient NGO)</h4>
            <div className="space-y-1 text-sm">
              <p className="font-bold text-gray-900">{currentDelivery.ngoName}</p>
              <p className="text-gray-600 text-xs">📞 Phone: {currentDelivery.ngoPhone}</p>
              <p className="text-gray-700 text-xs font-medium bg-blue-50 p-2.5 rounded-lg border border-blue-200 mt-2">
                📍 {currentDelivery.dropAddress}
              </p>
            </div>
          </div>
        </div>
      </div>

      <PickupModal
        isOpen={isPickupModalOpen}
        onClose={() => setIsPickupModalOpen(false)}
        onConfirm={handleConfirmPickup}
        task={currentDelivery}
        isLoading={isActionLoading}
      />

      <DeliveryProofModal
        isOpen={isProofModalOpen}
        onClose={() => setIsProofModalOpen(false)}
        onConfirm={handleCompleteDelivery}
        task={currentDelivery}
        isLoading={isActionLoading}
      />
    </div>
  );
};
