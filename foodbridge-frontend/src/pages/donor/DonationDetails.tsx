import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { donationService } from '../../services/donationService';
import { acceptanceService } from '../../services/acceptanceService';
import { useToast } from '../../context/ToastContext';
import type { FoodDonation, DonationAcceptanceRecord } from '../../types';
import { isDonationEditable, isDonationCancellable } from '../../utils/donationStatus';
import { DonationStatusBadge } from '../../components/donations/DonationStatusBadge';
import { DonationTimeline } from '../../components/donations/DonationTimeline';
import { CancelDonationModal } from '../../components/donations/CancelDonationModal';
import { DonorMatchingStatus } from '../../components/matching/DonorMatchingStatus';
import { DeliveryTimeline } from '../../components/delivery/DeliveryTimeline';
import { deliveryService } from '../../services/deliveryService';
import type { DeliveryTask } from '../../types';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ArrowLeft, Edit3, XCircle, MapPin, Clock, Calendar, Info, CheckCircle2, Building2, Phone } from 'lucide-react';

export const DonationDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [donation, setDonation] = useState<FoodDonation | null>(null);
  const [acceptanceRecord, setAcceptanceRecord] = useState<DonationAcceptanceRecord | null>(null);
  const [deliveryTask, setDeliveryTask] = useState<DeliveryTask | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const fetchDonation = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await donationService.getDonationById(id);
      setDonation(data);

      if (data && (data.status === 'ACCEPTED' || data.status === 'PICKUP_PENDING' || data.status === 'PICKED_UP' || data.status === 'IN_TRANSIT' || data.status === 'DELIVERED')) {
        const acc = await acceptanceService.getDonationAcceptance(id);
        setAcceptanceRecord(acc);
        const del = await deliveryService.getDeliveryByDonationId(id);
        setDeliveryTask(del);
      }
    } catch (err: unknown) {
      setError((err as Error).message || 'This donation could not be found.');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDonation();
  }, [fetchDonation]);

  const handleCancelConfirm = async () => {
    if (!id) return;
    setIsCancelling(true);
    try {
      await donationService.cancelDonation(id);
      showToast('Donation cancelled successfully.', '', 'success');
      setIsCancelModalOpen(false);
      fetchDonation();
    } catch {
      showToast('Error', 'Unable to cancel donation', 'error');
    } finally {
      setIsCancelling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-12">
        <LoadingSpinner size="lg" text="Fetching donation details..." />
      </div>
    );
  }

  if (error || !donation) {
    return (
      <div className="space-y-4 max-w-lg mx-auto py-12 text-center">
        <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs font-bold">
          {error || 'This donation could not be found.'}
        </div>
        <Button variant="outline" onClick={() => navigate('/donor/donations')} leftIcon={<ArrowLeft className="w-4 h-4" />}>
          Back to My Donations
        </Button>
      </div>
    );
  }

  const editable = isDonationEditable(donation.status);
  const cancellable = isDonationCancellable(donation.status);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* TOP BACK LINK & HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <Link to="/donor/donations" className="inline-flex items-center space-x-1.5 text-xs text-emerald-700 font-bold hover:underline mb-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to My Donations</span>
          </Link>
          <div className="flex items-center space-x-3">
            <span className="font-mono font-bold text-slate-500 bg-slate-200/80 px-2.5 py-0.5 rounded text-xs">
              {donation.id}
            </span>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">{donation.foodName}</h1>
            <DonationStatusBadge status={donation.status} size="md" />
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex items-center space-x-2">
          <Link to={`/deliveries/${donation.id}/map`}>
            <Button
              variant="outline"
              className="border-emerald-300 text-emerald-800 hover:bg-emerald-50 font-bold"
              leftIcon={<MapPin className="w-4 h-4 text-emerald-700" />}
            >
              View Location Map
            </Button>
          </Link>

          {editable && (
            <Link to={`/donor/donations/${donation.id}/edit`}>
              <Button variant="outline" leftIcon={<Edit3 className="w-4 h-4 text-emerald-700" />}>
                Edit Donation
              </Button>
            </Link>
          )}

          {cancellable && (
            <Button
              variant="danger"
              onClick={() => setIsCancelModalOpen(true)}
              leftIcon={<XCircle className="w-4 h-4" />}
            >
              Cancel Donation
            </Button>
          )}
        </div>
      </div>

      {/* MODULE 6 ACCEPTED NGO SUMMARY BANNER */}
      {donation.status === 'ACCEPTED' && (
        <Card className="border-emerald-300 bg-emerald-50/70 shadow-xs">
          <CardBody className="p-6 space-y-3">
            <div className="flex items-center space-x-2 text-emerald-950 font-black text-base">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
              <span>Donation Accepted by Relief Organization</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-medium text-slate-800 pt-1">
              <div className="p-3 bg-white border border-emerald-200 rounded-xl space-y-1">
                <span className="text-slate-400 font-bold uppercase text-[10px] block">Accepting NGO</span>
                <p className="font-extrabold text-emerald-950 text-sm flex items-center space-x-1.5">
                  <Building2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>{donation.matchedNgoName || acceptanceRecord?.organizationName || 'Verified Relief NGO'}</span>
                </p>
              </div>

              {acceptanceRecord && (
                <div className="p-3 bg-white border border-emerald-200 rounded-xl space-y-1">
                  <span className="text-slate-400 font-bold uppercase text-[10px] block">NGO Contact Person</span>
                  <p className="font-bold text-slate-900">{acceptanceRecord.contactPerson}</p>
                  <p className="text-[11px] text-slate-600 flex items-center space-x-1">
                    <Phone className="w-3 h-3 text-slate-400" />
                    <span>{acceptanceRecord.phone}</span>
                  </p>
                </div>
              )}

              <div className="p-3 bg-white border border-emerald-200 rounded-xl space-y-1">
                <span className="text-slate-400 font-bold uppercase text-[10px] block">Accepted Timestamp</span>
                <p className="font-bold text-slate-900">
                  {acceptanceRecord?.acceptedAt ? new Date(acceptanceRecord.acceptedAt).toLocaleString() : 'Confirmed'}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* MODULE 7 LIVE DELIVERY TIMELINE */}
      {deliveryTask && (
        <Card className="border-2 border-blue-200 bg-blue-50/20">
          <CardHeader className="bg-blue-50/50 border-b border-blue-100">
            <h3 className="text-sm font-extrabold text-blue-900 flex items-center space-x-2">
              <span>🚚 Live Delivery Status Tracking</span>
            </h3>
          </CardHeader>
          <CardBody>
            <DeliveryTimeline task={deliveryTask} />
          </CardBody>
        </Card>
      )}

      {/* DYNAMIC MATCHING ENGINE STATUS WIDGET (MODULE 4 & 5) */}
      {(donation.status === 'AVAILABLE' || donation.status === 'MATCHING') && (
        <DonorMatchingStatus donationId={donation.id} />
      )}

      {/* GRID LAYOUT: LEFT MAIN DETAILS, RIGHT TIMELINE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN — MAIN DETAILS */}
        <div className="lg:col-span-8 space-y-6">
          {/* FOOD IMAGE PREVIEW */}
          {donation.imageUrl && (
            <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <img
                src={donation.imageUrl}
                alt={donation.foodName}
                className="w-full h-64 sm:h-80 object-cover rounded-xl"
              />
            </div>
          )}

          {/* MAIN INFO CARD */}
          <Card>
            <CardHeader>
              <h3 className="text-sm font-extrabold text-slate-900">Food & Quantity Overview</h3>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Category</span>
                  <span className="font-extrabold text-slate-900">{donation.foodCategory}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Food Type</span>
                  <span className="font-extrabold text-slate-900">{donation.foodType}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Quantity</span>
                  <span className="font-extrabold text-slate-900">{donation.quantity} {donation.unit}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Status</span>
                  <span className="font-extrabold text-emerald-700">{donation.status}</span>
                </div>
              </div>

              {donation.description && (
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Description</h4>
                  <p className="text-xs text-slate-600 leading-relaxed bg-white p-3 rounded-lg border border-slate-200">
                    {donation.description}
                  </p>
                </div>
              )}
            </CardBody>
          </Card>

          {/* LOGISTICS & TIME INFO */}
          <Card>
            <CardHeader>
              <h3 className="text-sm font-extrabold text-slate-900">Time & Pickup Location Information</h3>
            </CardHeader>
            <CardBody className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="flex items-center space-x-1.5 text-slate-900 font-bold">
                    <Clock className="w-4 h-4 text-emerald-600" />
                    <span>Preparation Time:</span>
                  </div>
                  <p className="text-slate-700 pl-5 font-medium">{donation.preparationDate} at {donation.preparationTime}</p>
                </div>

                <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 space-y-1">
                  <div className="flex items-center space-x-1.5 text-amber-900 font-bold">
                    <Calendar className="w-4 h-4 text-amber-600" />
                    <span>Available Until:</span>
                  </div>
                  <p className="text-amber-800 pl-5 font-bold">{donation.availableUntil}</p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center space-x-1.5 text-slate-900 font-bold">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  <span>Pickup Location:</span>
                </div>
                <p className="text-slate-700 pl-5 font-medium">
                  {donation.donorAddress}, {donation.donorCity}
                </p>
              </div>

              {donation.specialInstructions && (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="flex items-center space-x-1.5 text-slate-900 font-bold">
                    <Info className="w-4 h-4 text-slate-600" />
                    <span>Special Pickup Instructions:</span>
                  </div>
                  <p className="text-slate-600 pl-5 leading-relaxed">{donation.specialInstructions}</p>
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        {/* RIGHT COLUMN — STATUS TIMELINE */}
        <div className="lg:col-span-4">
          <Card className="sticky top-24">
            <CardBody className="p-6">
              <DonationTimeline donation={donation} />
            </CardBody>
          </Card>
        </div>
      </div>

      {/* CANCEL MODAL */}
      <CancelDonationModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={handleCancelConfirm}
        isLoading={isCancelling}
      />
    </div>
  );
};
