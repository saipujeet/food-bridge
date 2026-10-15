import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDonations } from '../../hooks/useDonations';
import { DonationFilters } from '../../components/donations/DonationFilters';
import { DonationTable } from '../../components/donations/DonationTable';
import { CancelDonationModal } from '../../components/donations/CancelDonationModal';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { Card, CardBody } from '../../components/common/Card';
import { PlusCircle, Package } from 'lucide-react';
import type { FoodDonation } from '../../types';

export const MyDonations: React.FC = () => {
  const { filteredDonations, isLoading, error, filters, setFilters, cancelDonation } = useDonations();
  const navigate = useNavigate();

  const [cancelModalItem, setCancelModalItem] = useState<FoodDonation | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  const handleConfirmCancel = async () => {
    if (!cancelModalItem) return;
    setIsCancelling(true);
    try {
      await cancelDonation(cancelModalItem.id);
      setCancelModalItem(null);
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">My Donations</h1>
          <p className="text-xs text-slate-600 mt-1">
            Search, filter, and track status for all your surplus food listings.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => navigate('/donor/donations/create')}
          leftIcon={<PlusCircle className="w-4 h-4" />}
          className="font-extrabold bg-emerald-700 hover:bg-emerald-800 text-white"
        >
          Create Food Donation
        </Button>
      </div>

      {/* SEARCH & FILTERS */}
      <DonationFilters filters={filters} onChange={setFilters} />

      {/* DONATIONS LIST / TABLE */}
      <Card>
        <CardBody className="p-0">
          {isLoading ? (
            <LoadingSpinner text="Loading your donations..." />
          ) : error ? (
            <div className="p-6 text-center text-xs text-rose-600 font-bold">{error}</div>
          ) : filteredDonations.length === 0 ? (
            <EmptyState
              icon={<Package className="w-10 h-10 text-slate-400" />}
              title="No donations yet"
              description="Create your first food donation and help connect surplus food with nearby organizations."
              action={
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate('/donor/donations/create')}
                  leftIcon={<PlusCircle className="w-4 h-4" />}
                >
                  Create Food Donation
                </Button>
              }
            />
          ) : (
            <DonationTable
              donations={filteredDonations}
              onCancelClick={(donation) => setCancelModalItem(donation)}
            />
          )}
        </CardBody>
      </Card>

      {/* CANCEL MODAL */}
      <CancelDonationModal
        isOpen={!!cancelModalItem}
        onClose={() => setCancelModalItem(null)}
        onConfirm={handleConfirmCancel}
        isLoading={isCancelling}
      />
    </div>
  );
};
