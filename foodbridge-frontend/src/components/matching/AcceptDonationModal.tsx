import React, { useState } from 'react';
import type { DonationMatch } from '../../types';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { CapacityIndicator } from './CapacityIndicator';
import { CheckCircle2, ShieldCheck, Building2 } from 'lucide-react';

interface AcceptDonationModalProps {
  match: DonationMatch | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (notes?: string) => void;
  isLoading: boolean;
}

export const AcceptDonationModal: React.FC<AcceptDonationModalProps> = ({
  match,
  isOpen,
  onClose,
  onConfirm,
  isLoading,
}) => {
  const [notes, setNotes] = useState<string>('');

  if (!match) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(notes);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Confirm Donation Acceptance"
      description="Review specifications before accepting full surplus food responsibility."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5 text-xs text-slate-700">
        {/* FOOD SUMMARY BOX */}
        <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1.5">
          <div className="flex items-center justify-between">
            <h4 className="text-base font-extrabold text-emerald-950">{match.foodName}</h4>
            <span className="text-xs font-black text-emerald-900 bg-emerald-100 px-2.5 py-0.5 rounded border border-emerald-300">
              {match.donationQuantity} {match.donationUnit}
            </span>
          </div>
          <p className="text-emerald-800 text-[11px] font-medium flex items-center space-x-2">
            <Building2 className="w-3.5 h-3.5 shrink-0" />
            <span>Donor: <strong>{match.donorName}</strong> ({match.pickupAddress})</span>
          </p>
        </div>

        {/* CAPACITY INDICATOR */}
        <CapacityIndicator
          requiredQuantity={match.donationQuantity}
          availableCapacity={match.availableCapacity}
          capacityUnit={match.capacityUnit}
        />

        {/* RECEPTION NOTES INPUT */}
        <div className="space-y-1">
          <label className="block text-xs font-bold text-slate-700">
            Reception & Pickup Notes (Optional)
          </label>
          <Input
            placeholder="e.g. Our van will pick up at 6:30 PM. Vehicle Reg # 8812."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        {/* IMPORTANT CONCURRENCY NOTICE */}
        <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl flex items-start space-x-2.5 text-[11px] text-blue-950">
          <ShieldCheck className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            By accepting, you commit to receiving this entire donation. The FoodBridge backend will execute an atomic transaction to secure your acceptance and close competing offers.
          </p>
        </div>

        {/* ACTIONS */}
        <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-200">
          <Button variant="secondary" size="md" onClick={onClose} type="button" disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="md"
            type="submit"
            isLoading={isLoading}
            leftIcon={<CheckCircle2 className="w-4 h-4" />}
          >
            Confirm Acceptance
          </Button>
        </div>
      </form>
    </Modal>
  );
};
