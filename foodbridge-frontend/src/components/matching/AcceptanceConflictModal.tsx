import React from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface AcceptanceConflictModalProps {
  isOpen: boolean;
  message: string | null;
  onClose: () => void;
  onRefresh: () => void;
}

export const AcceptanceConflictModal: React.FC<AcceptanceConflictModalProps> = ({
  isOpen,
  message,
  onClose,
  onRefresh,
}) => {
  if (!isOpen) return null;

  const handleRefreshClick = () => {
    onClose();
    onRefresh();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Donation No Longer Available"
      description="HTTP 409 Conflict — Concurrent Acceptance Control"
      maxWidth="md"
    >
      <div className="space-y-4 text-xs text-slate-700">
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-2 text-center">
          <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h4 className="text-base font-extrabold text-amber-950">
            This donation has already been accepted by another NGO.
          </h4>
          <p className="text-xs text-amber-800 leading-relaxed font-medium">
            {message || 'Another verified relief organization claimed this surplus donation a moment ago.'}
          </p>
        </div>

        <p className="text-slate-600 text-center leading-relaxed">
          FoodBridge concurrency protection guarantees that each surplus donation is claimed by at most one organization.
        </p>

        <div className="flex items-center justify-end space-x-3 pt-2">
          <Button variant="secondary" size="md" onClick={onClose}>
            Close
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={handleRefreshClick}
            leftIcon={<RefreshCw className="w-4 h-4" />}
          >
            Refresh Available Matches
          </Button>
        </div>
      </div>
    </Modal>
  );
};
