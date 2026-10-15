import React, { useState } from 'react';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { MapPin, Save, Compass } from 'lucide-react';
import { LocationSelector } from '../maps/LocationSelector';

interface LocationFormProps {
  initialAddress: string;
  initialCity: string;
  initialLat: number;
  initialLng: number;
  onSubmit: (address: string, city: string, lat: number, lng: number) => Promise<void>;
  isLoading?: boolean;
}

export const LocationForm: React.FC<LocationFormProps> = ({
  initialAddress,
  initialCity,
  initialLat,
  initialLng,
  onSubmit,
  isLoading = false,
}) => {
  const [address, setAddress] = useState(initialAddress || '');
  const [city, setCity] = useState(initialCity || 'Metropolis');
  const [latitude, setLatitude] = useState(String(initialLat || 40.7128));
  const [longitude, setLongitude] = useState(String(initialLng || -74.0060));

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!address.trim()) errs.address = 'Street address is required.';
    if (!city.trim()) errs.city = 'City is required.';

    const latNum = Number(latitude);
    const lngNum = Number(longitude);

    if (isNaN(latNum) || latNum < -90 || latNum > 90) {
      errs.latitude = 'Latitude must be a valid number between -90 and 90.';
    }

    if (isNaN(lngNum) || lngNum < -180 || lngNum > 180) {
      errs.longitude = 'Longitude must be a valid number between -180 and 180.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    await onSubmit(address, city, Number(latitude), Number(longitude));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {/* ADDRESS & CITY */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center space-x-2 text-xs font-extrabold uppercase tracking-wider text-slate-900 pb-3 border-b border-slate-200">
          <MapPin className="w-4 h-4 text-emerald-700" />
          <span>NGO Physical Address & City</span>
        </div>

        <p className="text-xs text-slate-600">
          Your location helps FoodBridge identify nearby commercial food donation opportunities.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Street Address"
            placeholder="e.g. 108 Compassion Ave, Shelter Sector 2"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            error={errors.address}
            leftIcon={<MapPin className="w-4 h-4 text-slate-500" />}
            required
          />

          <Input
            label="City"
            placeholder="e.g. Metropolis"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            error={errors.city}
            required
          />
        </div>
      </div>

      {/* LAT & LNG GPS COORDINATES */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center space-x-2 text-xs font-extrabold uppercase tracking-wider text-slate-900 pb-3 border-b border-slate-200">
          <Compass className="w-4 h-4 text-emerald-700" />
          <span>GPS Coordinates (For Radius Matching Engine)</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Latitude"
            type="text"
            placeholder="e.g. 40.7128"
            value={latitude}
            onChange={(e) => setLatitude(e.target.value)}
            error={errors.latitude}
            required
          />

          <Input
            label="Longitude"
            type="text"
            placeholder="e.g. -74.0060"
            value={longitude}
            onChange={(e) => setLongitude(e.target.value)}
            error={errors.longitude}
            required
          />
        </div>
      </div>

      {/* INTERACTIVE MAP SELECTION */}
      <LocationSelector
        initialLatitude={Number(latitude) || 15.510}
        initialLongitude={Number(longitude) || 80.050}
        initialAddress={address}
        title="NGO Location Map Selector"
        subtitle="Click or drag pin on the map to set your organization's exact GPS location for matching."
        onLocationSelect={(loc) => {
          setLatitude(String(loc.latitude));
          setLongitude(String(loc.longitude));
          if (loc.address) setAddress(loc.address);
        }}
      />

      <div className="flex justify-end">
        <Button
          type="submit"
          variant="primary"
          isLoading={isLoading}
          leftIcon={<Save className="w-4 h-4" />}
          className="px-8 py-2.5 font-extrabold shadow-md bg-emerald-700 hover:bg-emerald-800 text-white"
        >
          Save Location
        </Button>
      </div>
    </form>
  );
};
