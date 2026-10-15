import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { DonationAcceptanceRecord } from '../../types';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { CheckCircle2, Map } from 'lucide-react';

interface AcceptanceSuccessModalProps {
  record: DonationAcceptanceRecord | null;
  isOpen: boolean;
  onClose: () => void;
}

export const AcceptanceSuccessModal: React.FC<AcceptanceSuccessModalProps> = ({
  record,
  isOpen,
  onClose,
}) => {
  const navigate = useNavigate();
  if (!record) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="✓ Donation Accepted Successfully"
      description="Your organization has successfully claimed this surplus food donation."
      maxWidth="md"
    >
      <div className="space-y-5 text-xs text-slate-700">
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h4 className="text-lg font-black text-emerald-950">{record.foodName}</h4>
          <p className="text-xs font-bold text-emerald-800">
            Quantity: {record.acceptedQuantity} {record.capacityUnit}
          </p>
        </div>

        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 font-medium">
          <p className="flex justify-between">
            <span className="text-slate-500">Acceptance Record ID:</span>
            <strong className="font-mono text-slate-900">{record.id}</strong>
          </p>
          <p className="flex justify-between">
            <span className="text-slate-500">Accepted By:</span>
            <strong className="text-slate-900">{record.organizationName}</strong>
          </p>
          <p className="flex justify-between">
            <span className="text-slate-500">Timestamp:</span>
            <span className="font-bold text-slate-800">{new Date(record.acceptedAt).toLocaleString()}</span>
          </p>
        </div>

        <div className="flex items-center justify-end space-x-3 pt-2">
          <Button variant="outline" size="md" onClick={onClose}>
            Done
          </Button>
          <Button
            variant="primary"
            size="md"
            leftIcon={<Map className="w-4 h-4" />}
            onClick={() => {
              onClose();
              const mapId = record.deliveryId || record.id || record.donationId;
              navigate(`/deliveries/${mapId}/map`);
            }}
          >
            View Delivery Map
          </Button>
        </div>
      </div>
    </Modal>
  );
};
