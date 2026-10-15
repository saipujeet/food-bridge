import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { donationService } from '../../services/donationService';
import { useToast } from '../../context/ToastContext';
import type { FoodDonation } from '../../types';
import { isDonationEditable } from '../../utils/donationStatus';
import { DonationForm, type DonationFormData } from '../../components/donations/DonationForm';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Button } from '../../components/common/Button';
import { ArrowLeft, AlertOctagon } from 'lucide-react';

export const EditDonation: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [donation, setDonation] = useState<FoodDonation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDonation = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await donationService.getDonationById(id);
      setDonation(data);
    } catch (err: unknown) {
      setError((err as Error).message || 'This donation could not be found.');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDonation();
  }, [fetchDonation]);

  const handleSubmit = async (data: DonationFormData) => {
    if (!id || !donation) return;

    if (!isDonationEditable(donation.status)) {
      showToast('Edit Restricted', 'This donation can no longer be edited.', 'error');
      return;
    }

    setIsSaving(true);
    try {
      await donationService.updateDonation(id, {
        foodName: data.foodName,
        foodCategory: data.foodCategory,
        foodType: data.foodType,
        quantity: Number(data.quantity),
        unit: data.unit,
        description: data.description,

        preparationDate: data.preparationDate,
        preparationTime: data.preparationTime,
        availableFrom: data.availableFrom,
        availableUntil: data.availableUntil,

        donorAddress: data.pickupAddress,
        donorCity: data.city,
        latitude: Number(data.latitude) || 40.7128,
        longitude: Number(data.longitude) || -74.0060,

        imageUrl: data.imageUrl,
        specialInstructions: data.specialInstructions,
      });

      showToast('Donation updated successfully.', '', 'success');
      navigate(`/donor/donations/${id}`);
    } catch (err: unknown) {
      showToast('Error', (err as Error).message || 'Failed to save changes.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-12">
        <LoadingSpinner size="lg" text="Loading donation information..." />
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

  // Mandatory Business Rule Check: Only AVAILABLE status can be edited
  const editable = isDonationEditable(donation.status);

  if (!editable) {
    return (
      <div className="space-y-6 max-w-xl mx-auto py-12 text-center">
        <div className="p-6 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900 space-y-3">
          <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
            <AlertOctagon className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-extrabold text-slate-900">Editing Unavailable</h2>
          <p className="text-xs leading-relaxed font-semibold">
            This donation can no longer be edited because its current status (<strong>{donation.status}</strong>) does not allow changes.
          </p>
        </div>

        <div className="flex justify-center space-x-3">
          <Link to={`/donor/donations/${id}`}>
            <Button variant="outline" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Back to Donation Details
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* HEADER */}
      <div className="space-y-1">
        <Link to={`/donor/donations/${id}`} className="inline-flex items-center space-x-1.5 text-xs text-emerald-700 font-bold hover:underline mb-1">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Details</span>
        </Link>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Edit Food Donation ({donation.id})</h1>
        <p className="text-xs text-slate-600">
          Update surplus meal parameters before NGO matching begins.
        </p>
      </div>

      {/* EDIT FORM */}
      <DonationForm
        initialValues={donation}
        onSubmit={handleSubmit}
        onCancel={() => navigate(`/donor/donations/${id}`)}
        isEditMode
        isLoading={isSaving}
      />
    </div>
  );
};
