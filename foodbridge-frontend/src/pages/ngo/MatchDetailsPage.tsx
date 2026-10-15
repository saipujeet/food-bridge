import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { DonationMatch } from '../../types';
import { matchingService } from '../../services/matchingService';
import { useAcceptance } from '../../hooks/useAcceptance';
import { MatchStatusBadge } from '../../components/matching/MatchStatusBadge';
import { DistanceBadge } from '../../components/matching/DistanceBadge';
import { CapacityIndicator } from '../../components/matching/CapacityIndicator';
import { FoodCompatibilityBadge } from '../../components/matching/FoodCompatibilityBadge';
import { AcceptDonationModal } from '../../components/matching/AcceptDonationModal';
import { RejectDonationModal } from '../../components/matching/RejectDonationModal';
import { AcceptanceSuccessModal } from '../../components/matching/AcceptanceSuccessModal';
import { AcceptanceConflictModal } from '../../components/matching/AcceptanceConflictModal';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useToast } from '../../context/ToastContext';
import { ArrowLeft, Building2, MapPin, Clock, CheckCircle2, XCircle } from 'lucide-react';

export const MatchDetailsPage: React.FC = () => {
  const { matchId } = useParams<{ matchId: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [match, setMatch] = useState<DonationMatch | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const {
    acceptanceRecord,
    isLoading: isAcceptanceLoading,
    conflictMessage,
    clearConflict,
    acceptDonation,
    rejectDonation,
  } = useAcceptance();

  const [isAcceptModalOpen, setIsAcceptModalOpen] = useState<boolean>(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState<boolean>(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState<boolean>(false);

  const loadMatch = async () => {
    if (!matchId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await matchingService.getMatchDetails(matchId);
      if (data) {
        setMatch(data);
      } else {
        setError(`Match specification #${matchId} was not found.`);
      }
    } catch {
      setError('Failed to retrieve match details.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMatch();
  }, [matchId]);

  const handleConfirmAccept = async (notes?: string) => {
    if (!matchId) return;
    const res = await acceptDonation(matchId, notes);
    setIsAcceptModalOpen(false);
    if (res && res.success) {
      setIsSuccessModalOpen(true);
      loadMatch();
    }
  };

  const handleConfirmReject = async (reason?: string) => {
    if (!matchId) return;
    const ok = await rejectDonation(matchId, reason);
    setIsRejectModalOpen(false);
    if (ok) {
      showToast('Offer Rejected', 'The matched donation offer has been removed.', 'info');
      navigate('/ngo/matches');
    }
  };

  if (isLoading) {
    return (
      <div className="py-12">
        <LoadingSpinner size="lg" text="Loading match specification details..." />
      </div>
    );
  }

  if (error || !match) {
    return (
      <div className="space-y-4 max-w-xl mx-auto py-12 text-center">
        <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs font-bold">
          {error || 'Match details unavailable.'}
        </div>
        <Button variant="secondary" size="sm" onClick={() => navigate('/ngo/matches')}>
          Return to Matched Donations
        </Button>
      </div>
    );
  }

  const isOffered = match.matchStatus === 'OFFERED';
  const isCapacitySufficient = match.availableCapacity >= match.donationQuantity;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* NAVIGATION BACK */}
      <button
        onClick={() => navigate('/ngo/matches')}
        className="inline-flex items-center space-x-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Matched Donations</span>
      </button>

      {/* HEADER CARD */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
              Module 6 NGO Acceptance Interface
            </span>
            <DistanceBadge distanceKm={match.distanceKm} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {match.foodName}
          </h1>
          <FoodCompatibilityBadge category={match.foodCategory} foodType={match.foodType} />
        </div>

        <div className="flex flex-col items-end space-y-3">
          <MatchStatusBadge status={match.matchStatus} size="lg" />

          {isOffered && (
            <div className="flex items-center space-x-2">
              <Button
                variant="danger"
                size="sm"
                onClick={() => setIsRejectModalOpen(true)}
                leftIcon={<XCircle className="w-4 h-4" />}
              >
                Reject
              </Button>
              <Button
                variant="primary"
                size="sm"
                disabled={!isCapacitySufficient}
                onClick={() => setIsAcceptModalOpen(true)}
                leftIcon={<CheckCircle2 className="w-4 h-4" />}
              >
                Accept Donation
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* DETAILED SPECIFICATIONS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* DONATION SPECIFICATIONS */}
        <Card>
          <CardHeader>
            <h3 className="text-base font-extrabold text-slate-900">Food Donation Specifications</h3>
          </CardHeader>
          <CardBody className="space-y-3 text-xs text-slate-700">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex justify-between border-b border-slate-200 pb-1.5">
                <span className="text-slate-500 font-medium">Offered Quantity:</span>
                <span className="font-extrabold text-slate-900 text-sm">
                  {match.donationQuantity} {match.donationUnit}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-1.5">
                <span className="text-slate-500 font-medium">Category:</span>
                <span className="font-bold text-slate-900">{match.foodCategory}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Food Type:</span>
                <span className="font-bold text-slate-900">{match.foodType}</span>
              </div>
            </div>

            <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl space-y-1">
              <div className="flex items-center space-x-1.5 font-bold text-amber-950">
                <Clock className="w-4 h-4 text-amber-700 shrink-0" />
                <span>Availability Window</span>
              </div>
              <p className="text-[11px] text-amber-900 font-medium">
                Offer valid until: <strong>{new Date(match.availableUntil).toLocaleString()}</strong>
              </p>
            </div>
          </CardBody>
        </Card>

        {/* DONOR & LOCATION */}
        <Card>
          <CardHeader>
            <h3 className="text-base font-extrabold text-slate-900">Donor & Pickup Location</h3>
          </CardHeader>
          <CardBody className="space-y-3 text-xs text-slate-700">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2 font-medium">
              <p className="flex items-center space-x-2">
                <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Donor: <strong>{match.donorName}</strong></span>
              </p>
              <p className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>Address: <strong>{match.pickupAddress}, {match.pickupCity || ''}</strong></span>
              </p>
            </div>

            <CapacityIndicator
              requiredQuantity={match.donationQuantity}
              availableCapacity={match.availableCapacity}
              capacityUnit={match.capacityUnit}
            />
          </CardBody>
        </Card>
      </div>

      {/* MODALS */}
      <AcceptDonationModal
        match={match}
        isOpen={isAcceptModalOpen}
        onClose={() => setIsAcceptModalOpen(false)}
        onConfirm={handleConfirmAccept}
        isLoading={isAcceptanceLoading}
      />

      <RejectDonationModal
        match={match}
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        onConfirm={handleConfirmReject}
        isLoading={isAcceptanceLoading}
      />

      <AcceptanceSuccessModal
        record={acceptanceRecord}
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
      />

      <AcceptanceConflictModal
        isOpen={!!conflictMessage}
        message={conflictMessage}
        onClose={clearConflict}
        onRefresh={loadMatch}
      />
    </div>
  );
};
