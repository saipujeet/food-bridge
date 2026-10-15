import React from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { AlertTriangle } from 'lucide-react';

interface CancelDonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isLoading?: boolean;
}

export const CancelDonationModal: React.FC<CancelDonationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Cancel this donation?"
      maxWidth="md"
    >
      <div className="space-y-4 text-left">
        <div className="flex items-start space-x-3 p-3.5 bg-rose-50 rounded-xl border border-rose-200 text-rose-900 text-xs">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Are you sure you want to cancel this food donation? This action cannot be used to restore the donation automatically.
          </p>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          Cancelling this listing will remove it from active matching notifications for nearby verified NGOs.
        </p>

        <div className="pt-4 border-t border-slate-200 flex items-center justify-end space-x-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="border-slate-300 text-slate-800 font-semibold"
          >
            Keep Donation
          </Button>
          <Button
            variant="danger"
            onClick={onConfirm}
            isLoading={isLoading}
            className="font-extrabold px-5"
          >
            Cancel Donation
          </Button>
        </div>
      </div>
    </Modal>
  );
};
