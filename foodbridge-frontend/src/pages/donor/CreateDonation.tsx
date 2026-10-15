import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../context/ToastContext';
import { donationService } from '../../services/donationService';
import { DonationForm, type DonationFormData } from '../../components/donations/DonationForm';

export const CreateDonation: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: DonationFormData) => {
    setIsLoading(true);
    try {
      const created = await donationService.createDonation({
        donorId: user?.id || 'usr_donor_1',
        donorName: user?.organizationName || user?.name || 'Grand Hyatt Canteen',
        donorCity: data.city,
        donorPhone: user?.phone || '+1 555-0192',
        donorAddress: data.pickupAddress,
        latitude: Number(data.latitude) || 40.7128,
        longitude: Number(data.longitude) || -74.0060,

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

        imageUrl: data.imageUrl,
        specialInstructions: data.specialInstructions,
      });

      showToast('Donation created successfully.', `Published listing ${created.id}`, 'success');
      navigate(`/donor/donations/${created.id}`);
    } catch (err: unknown) {
      showToast('Error', (err as Error).message || 'Failed to create donation', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* HEADER */}
      <div className="space-y-1">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Create Food Donation</h1>
        <p className="text-xs text-slate-600">
          Tell us about the surplus food you would like to distribute.
        </p>
      </div>

      {/* FORM */}
      <DonationForm
        onSubmit={handleSubmit}
        onCancel={() => navigate('/donor/donations')}
        isLoading={isLoading}
      />
    </div>
  );
};
