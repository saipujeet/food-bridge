import React, { useState } from 'react';
import type { FoodDonation, FoodCategory, FoodType, QuantityUnit } from '../../types';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Textarea } from '../common/Select';
import { Button } from '../common/Button';
import { FoodImageUploader } from './FoodImageUploader';
import { Utensils, Clock, MapPin, Info, ArrowRight, Save, Scale } from 'lucide-react';
import { LocationSelector } from '../maps/LocationSelector';

export interface DonationFormData {
  foodName: string;
  foodCategory: FoodCategory;
  foodType: FoodType;
  quantity: string;
  unit: QuantityUnit;
  description: string;
  preparationDate: string;
  preparationTime: string;
  availableFrom: string;
  availableUntil: string;
  pickupAddress: string;
  city: string;
  latitude: string;
  longitude: string;
  imageUrl: string;
  specialInstructions: string;
}

interface DonationFormProps {
  initialValues?: Partial<FoodDonation>;
  onSubmit: (data: DonationFormData) => Promise<void>;
  onCancel: () => void;
  isEditMode?: boolean;
  isLoading?: boolean;
}

export const DonationForm: React.FC<DonationFormProps> = ({
  initialValues,
  onSubmit,
  onCancel,
  isEditMode = false,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<DonationFormData>({
    foodName: initialValues?.foodName || '',
    foodCategory: initialValues?.foodCategory || 'Cooked Meals',
    foodType: initialValues?.foodType || 'Vegetarian',
    quantity: initialValues?.quantity ? String(initialValues.quantity) : '10',
    unit: initialValues?.unit || 'kg',
    description: initialValues?.description || '',
    preparationDate: initialValues?.preparationDate || new Date().toISOString().split('T')[0],
    preparationTime: initialValues?.preparationTime || '18:00',
    availableFrom: initialValues?.availableFrom || new Date().toISOString().slice(0, 16),
    availableUntil: initialValues?.availableUntil || new Date(Date.now() + 14400000).toISOString().slice(0, 16),
    pickupAddress: initialValues?.donorAddress || '742 Evergreen Terrace, Sector 4',
    city: initialValues?.donorCity || 'Metropolis',
    latitude: initialValues?.latitude ? String(initialValues.latitude) : '40.7128',
    longitude: initialValues?.longitude ? String(initialValues.longitude) : '-74.0060',
    imageUrl: initialValues?.imageUrl || 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=60',
    specialInstructions: initialValues?.specialInstructions || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!formData.foodName.trim()) {
      errs.foodName = 'Food name is required.';
    }

    if (!formData.quantity || Number(formData.quantity) <= 0) {
      errs.quantity = 'Quantity must be greater than 0.';
    }

    if (!formData.unit) {
      errs.unit = 'Unit is required.';
    }

    if (!formData.availableUntil.trim()) {
      errs.availableUntil = 'Please enter a valid available-until time.';
    }

    if (!formData.pickupAddress.trim()) {
      errs.pickupAddress = 'Pickup address is required.';
    }

    if (!formData.city.trim()) {
      errs.city = 'City name is required.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit(formData);
  };

  const categoryOptions = [
    { value: 'Cooked Meals', label: 'Cooked Meals' },
    { value: 'Rice', label: 'Rice' },
    { value: 'Biryani', label: 'Biryani' },
    { value: 'Vegetables', label: 'Vegetables' },
    { value: 'Fruits', label: 'Fruits' },
    { value: 'Bakery', label: 'Bakery' },
    { value: 'Dairy', label: 'Dairy' },
    { value: 'Packaged Food', label: 'Packaged Food' },
    { value: 'Other', label: 'Other' },
  ];

  const foodTypeOptions = [
    { value: 'Vegetarian', label: 'Vegetarian' },
    { value: 'Non-Vegetarian', label: 'Non-Vegetarian' },
    { value: 'Other', label: 'Other' },
  ];

  const unitOptions = [
    { value: 'kg', label: 'Kilograms (kg)' },
    { value: 'litres', label: 'Litres' },
    { value: 'packets', label: 'Packets' },
    { value: 'meals', label: 'Meals / Servings' },
    { value: 'boxes', label: 'Boxes' },
    { value: 'pieces', label: 'Pieces' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-8" noValidate>
      {/* SECTION 1 — FOOD INFORMATION */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center space-x-2 text-xs font-extrabold uppercase tracking-wider text-slate-900 pb-3 border-b border-slate-200">
          <Utensils className="w-4 h-4 text-emerald-700" />
          <span>Section 1 — Food Information</span>
        </div>

        <Input
          label="Food Name"
          placeholder="e.g. Fresh Vegetable Biryani & Raita Meals"
          value={formData.foodName}
          onChange={(e) => setFormData({ ...formData, foodName: e.target.value })}
          error={errors.foodName}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Food Category"
            value={formData.foodCategory}
            onChange={(e) => setFormData({ ...formData, foodCategory: e.target.value as FoodCategory })}
            options={categoryOptions}
            required
          />

          <Select
            label="Food Type"
            value={formData.foodType}
            onChange={(e) => setFormData({ ...formData, foodType: e.target.value as FoodType })}
            options={foodTypeOptions}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Quantity"
            type="number"
            min="1"
            placeholder="e.g. 25"
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
            error={errors.quantity}
            leftIcon={<Scale className="w-4 h-4 text-slate-500" />}
            required
          />

          <Select
            label="Unit of Measurement"
            value={formData.unit}
            onChange={(e) => setFormData({ ...formData, unit: e.target.value as QuantityUnit })}
            options={unitOptions}
            error={errors.unit}
            required
          />
        </div>

        <Textarea
          label="Food Description"
          placeholder="Describe the surplus food items, ingredients, packaging, or storage status..."
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </div>

      {/* SECTION 2 — TIME INFORMATION */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center space-x-2 text-xs font-extrabold uppercase tracking-wider text-slate-900 pb-3 border-b border-slate-200">
          <Clock className="w-4 h-4 text-emerald-700" />
          <span>Section 2 — Time Information</span>
        </div>

        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 flex items-start space-x-2">
          <Info className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Available Until</strong> tells FoodBridge how long this donation can be offered for distribution before expiry.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Preparation Date"
            type="date"
            value={formData.preparationDate}
            onChange={(e) => setFormData({ ...formData, preparationDate: e.target.value })}
            required
          />
          <Input
            label="Preparation Time"
            type="time"
            value={formData.preparationTime}
            onChange={(e) => setFormData({ ...formData, preparationTime: e.target.value })}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Available From"
            type="datetime-local"
            value={formData.availableFrom}
            onChange={(e) => setFormData({ ...formData, availableFrom: e.target.value })}
            required
          />
          <Input
            label="Available Until"
            type="datetime-local"
            value={formData.availableUntil}
            onChange={(e) => setFormData({ ...formData, availableUntil: e.target.value })}
            error={errors.availableUntil}
            required
          />
        </div>
      </div>

      {/* SECTION 3 — PICKUP LOCATION */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center space-x-2 text-xs font-extrabold uppercase tracking-wider text-slate-900 pb-3 border-b border-slate-200">
          <MapPin className="w-4 h-4 text-emerald-700" />
          <span>Section 3 — Pickup Location</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Pickup Address"
            placeholder="742 Evergreen Terrace, Sector 4"
            value={formData.pickupAddress}
            onChange={(e) => setFormData({ ...formData, pickupAddress: e.target.value })}
            error={errors.pickupAddress}
            leftIcon={<MapPin className="w-4 h-4 text-slate-500" />}
            required
          />
          <Input
            label="City"
            placeholder="Metropolis"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            error={errors.city}
            required
          />
        </div>

        {/* INTERACTIVE MAP PICKUP SELECTOR */}
        <LocationSelector
          initialLatitude={Number(formData.latitude) || 15.500}
          initialLongitude={Number(formData.longitude) || 80.040}
          initialAddress={formData.pickupAddress}
          title="Select Pickup Point on Map"
          subtitle="Click on the map or drag the pin to set the exact food collection coordinates."
          onLocationSelect={(loc) => {
            setFormData({
              ...formData,
              latitude: String(loc.latitude),
              longitude: String(loc.longitude),
              pickupAddress: loc.address || formData.pickupAddress,
            });
          }}
        />
      </div>

      {/* SECTION 4 — FOOD IMAGE */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <FoodImageUploader
          value={formData.imageUrl}
          onChange={(url) => setFormData({ ...formData, imageUrl: url })}
        />
      </div>

      {/* SECTION 5 — ADDITIONAL INFORMATION */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <Textarea
          label="Special Instructions"
          placeholder="Add pickup or handling information (e.g., collect from loading dock B, ask for chefMarcus)..."
          value={formData.specialInstructions}
          onChange={(e) => setFormData({ ...formData, specialInstructions: e.target.value })}
        />
      </div>

      {/* FORM ACTIONS */}
      <div className="flex items-center justify-end space-x-4 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
          className="border-slate-300 text-slate-700 font-semibold px-6"
        >
          Cancel
        </Button>

        <Button
          type="submit"
          variant="primary"
          isLoading={isLoading}
          leftIcon={isEditMode ? <Save className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
          className="px-8 py-3 font-extrabold shadow-md bg-emerald-700 hover:bg-emerald-800 text-white"
        >
          {isLoading
            ? isEditMode
              ? 'Saving Changes...'
              : 'Creating Donation...'
            : isEditMode
            ? 'Save Changes'
            : 'Create Donation'}
        </Button>
      </div>
    </form>
  );
};
