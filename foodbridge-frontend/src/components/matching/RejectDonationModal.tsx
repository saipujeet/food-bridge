import React, { useState } from 'react';
import type { DonationMatch } from '../../types';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { XCircle, Info } from 'lucide-react';

interface RejectDonationModalProps {
  match: DonationMatch | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason?: string) => void;
  isLoading: boolean;
}

export const RejectDonationModal: React.FC<RejectDonationModalProps> = ({
  match,
  isOpen,
  onClose,
  onConfirm,
  isLoading,
}) => {
  const [reason, setReason] = useState<string>('');

  if (!match) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(reason);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Reject Matched Food Offer?"
      description="Decline this surplus food match offer for your organization."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs text-slate-700">
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl space-y-1">
          <h4 className="font-extrabold text-rose-950 text-sm">{match.foodName}</h4>
          <p className="text-rose-800 text-[11px]">
            Donor: <strong>{match.donorName}</strong> ({match.donationQuantity} {match.donationUnit})
          </p>
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-bold text-slate-700">
            Rejection Reason (Optional)
          </label>
          <Input
            placeholder="e.g. Current storage capacity is unavailable this evening."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>

        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start space-x-2 text-[11px] text-slate-600">
          <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          <p>
            Rejecting this match offer removes it from your NGO queue. The donation remains available for other eligible nearby NGOs.
          </p>
        </div>

        <div className="flex items-center justify-end space-x-3 pt-2 border-t border-slate-200">
          <Button variant="secondary" size="sm" onClick={onClose} type="button" disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="danger"
            size="sm"
            type="submit"
            isLoading={isLoading}
            leftIcon={<XCircle className="w-4 h-4" />}
          >
            Confirm Rejection
          </Button>
        </div>
      </form>
    </Modal>
  );
};
