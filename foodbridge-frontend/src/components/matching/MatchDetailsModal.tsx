import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { DonationMatch } from '../../types';
import { Modal } from '../common/Modal';
import { MatchStatusBadge } from './MatchStatusBadge';
import { DistanceBadge } from './DistanceBadge';
import { CapacityIndicator } from './CapacityIndicator';
import { FoodCompatibilityBadge } from './FoodCompatibilityBadge';
import { Button } from '../common/Button';
import { Building2, MapPin, Clock, Info, CheckCircle2, XCircle } from 'lucide-react';

interface MatchDetailsModalProps {
  match: DonationMatch | null;
  isOpen: boolean;
  onClose: () => void;
  onAccept?: (match: DonationMatch) => void;
  onReject?: (match: DonationMatch) => void;
}

export const MatchDetailsModal: React.FC<MatchDetailsModalProps> = ({
  match,
  isOpen,
  onClose,
  onAccept,
  onReject,
}) => {
  const navigate = useNavigate();
  if (!match) return null;

  const isOffered = match.matchStatus === 'OFFERED';
  const isCapacitySufficient = match.availableCapacity >= match.donationQuantity;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Surplus Food Match Specification"
      description={`System Offer ID: ${match.id}`}
      maxWidth="xl"
    >
      <div className="space-y-6 text-xs text-slate-700">
        {/* TOP SUMMARY */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <h4 className="text-base font-black text-slate-900">{match.foodName}</h4>
            <div className="flex items-center space-x-2">
              <FoodCompatibilityBadge category={match.foodCategory} foodType={match.foodType} />
              <DistanceBadge distanceKm={match.distanceKm} />
            </div>
          </div>
          <MatchStatusBadge status={match.matchStatus} size="lg" />
        </div>

        {/* DONATION SPECIFICATIONS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2">
            <span className="font-extrabold uppercase tracking-wider text-slate-400 text-[10px] block">
              Donation Details
            </span>
            <div className="space-y-1.5 font-medium text-slate-800">
              <p className="flex justify-between">
                <span className="text-slate-500">Offered Quantity:</span>
                <strong className="text-slate-900">{match.donationQuantity} {match.donationUnit}</strong>
              </p>
              <p className="flex justify-between">
                <span className="text-slate-500">Category:</span>
                <span className="font-bold">{match.foodCategory}</span>
              </p>
              <p className="flex justify-between">
                <span className="text-slate-500">Food Type:</span>
                <span className="font-bold">{match.foodType}</span>
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2">
            <span className="font-extrabold uppercase tracking-wider text-slate-400 text-[10px] block">
              Donor & Location
            </span>
            <div className="space-y-1.5 font-medium text-slate-800">
              <p className="flex items-center space-x-2">
                <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{match.donorName}</span>
              </p>
              <p className="flex items-start space-x-2">
                <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                <span>{match.pickupAddress}, {match.pickupCity || ''}</span>
              </p>
            </div>
          </div>
        </div>

        {/* CAPACITY & TIME STATUS */}
        <div className="space-y-3">
          <CapacityIndicator
            requiredQuantity={match.donationQuantity}
            availableCapacity={match.availableCapacity}
            capacityUnit={match.capacityUnit}
          />

          <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 flex items-center space-x-3">
            <Clock className="w-5 h-5 text-amber-700 shrink-0" />
            <div>
              <span className="font-bold text-amber-950 block text-xs">Availability Expiry Window</span>
              <p className="text-[11px] text-amber-900 font-medium">
                This donation offer is valid until <strong>{new Date(match.availableUntil).toLocaleString()}</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* SPECIAL INSTRUCTIONS */}
        {match.specialInstructions && (
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px] block">
              Donor Instructions / Notes
            </span>
            <p className="text-slate-600 italic text-[11px]">{match.specialInstructions}</p>
          </div>
        )}

        {/* MODULE 6 ACCEPTANCE & CONCURRENCY NOTICE */}
        <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl flex items-start space-x-3 text-blue-950 text-[11px]">
          <Info className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block">Module 6 Concurrency Control Notice</span>
            <span>
              Donation acceptance is executed transactionally. First verified NGO to accept receives confirmation; competing offers close automatically.
            </span>
          </div>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-200">
          <div className="flex items-center space-x-2">
            <Button variant="secondary" size="md" onClick={onClose}>
              Close
            </Button>
            <Button
              variant="outline"
              size="md"
              leftIcon={<MapPin className="w-4 h-4 text-emerald-700" />}
              onClick={() => {
                onClose();
                navigate(`/deliveries/${match.donationId}/map`);
              }}
              className="border-emerald-300 text-emerald-800 hover:bg-emerald-50 font-bold"
            >
              View Location Map
            </Button>
          </div>

          {isOffered && onAccept && onReject && (
            <div className="flex items-center space-x-2">
              <Button
                variant="danger"
                size="md"
                onClick={() => {
                  onClose();
                  onReject(match);
                }}
                leftIcon={<XCircle className="w-4 h-4" />}
              >
                Reject Offer
              </Button>
              <Button
                variant="primary"
                size="md"
                disabled={!isCapacitySufficient}
                onClick={() => {
                  onClose();
                  onAccept(match);
                }}
                leftIcon={<CheckCircle2 className="w-4 h-4" />}
              >
                Accept Donation
              </Button>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
