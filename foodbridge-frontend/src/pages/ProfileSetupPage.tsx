import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../context/ToastContext';
import { ProgressBar } from '../components/common/ProgressBar';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { Card, CardBody } from '../components/common/Card';
import { Building, Building2, Truck, ArrowRight } from 'lucide-react';

export const ProfileSetupPage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [orgName, setOrgName] = useState(user?.organizationName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');
  const [city, setCity] = useState(user?.city || 'Metropolis');
  const [capacity, setCapacity] = useState(String(user?.foodCapacityKg || 200));
  const [operatingHours, setOperatingHours] = useState(user?.operatingHours || '08:00 AM - 08:00 PM');
  const [preferredArea, setPreferredArea] = useState(user?.preferredArea || 'Central & North District');
  const [isAvailable, setIsAvailable] = useState(user?.isAvailable ?? true);

  const [isLoading, setIsLoading] = useState(false);

  const getDashboardPath = () => {
    switch (user?.role) {
      case 'DONOR': return '/dashboard/donor';
      case 'NGO': return '/dashboard/ngo';
      case 'VOLUNTEER': return '/dashboard/volunteer';
      case 'ADMIN': return '/dashboard/admin';
      default: return '/dashboard/donor';
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await updateProfile({
        organizationName: orgName,
        phone,
        address,
        city,
        foodCapacityKg: Number(capacity) || 100,
        operatingHours,
        preferredArea,
        isAvailable,
        profileCompleted: true,
      });

      showToast('Profile Updated', 'Your FoodBridge profile details are saved', 'success');
      navigate(getDashboardPath());
    } catch {
      showToast('Error', 'Unable to save profile changes', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = async () => {
    try {
      await updateProfile({ profileCompleted: true });
    } catch {
      /* ignore */
    }
    navigate(getDashboardPath());
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 space-y-6">
      <Card className="border-slate-200">
        <CardBody className="p-6 space-y-6">
          {/* Header */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-900">Complete Your FoodBridge Profile</h2>
              <span className="text-xs font-bold px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded-md border border-emerald-200">
                Role: {user?.role || 'DONOR'}
              </span>
            </div>

            {/* Progress Bar 60% */}
            <ProgressBar progress={60} label="Profile Completion" />
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            {/* Donor Form Fields */}
            {user?.role === 'DONOR' && (
              <div className="space-y-4 pt-2">
                <Input
                  label="Organization / Restaurant Name"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  leftIcon={<Building className="w-4 h-4" />}
                  required
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Phone Contact"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                  <Input
                    label="City"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                  />
                </div>
                <Input
                  label="Physical Pickup Address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />
              </div>
            )}

            {/* NGO Form Fields */}
            {user?.role === 'NGO' && (
              <div className="space-y-4 pt-2">
                <Input
                  label="NGO Name"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  leftIcon={<Building2 className="w-4 h-4" />}
                  required
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Storage Capacity (kg)"
                    type="number"
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    required
                  />
                  <Input
                    label="Operating Hours"
                    value={operatingHours}
                    onChange={(e) => setOperatingHours(e.target.value)}
                    required
                  />
                </div>
                <Input
                  label="Distribution Center Address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />
              </div>
            )}

            {/* Volunteer Form Fields */}
            {user?.role === 'VOLUNTEER' && (
              <div className="space-y-4 pt-2">
                <Input
                  label="Preferred Transport Area"
                  value={preferredArea}
                  onChange={(e) => setPreferredArea(e.target.value)}
                  leftIcon={<Truck className="w-4 h-4" />}
                  required
                />
                <Input
                  label="Primary Operating City"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                />
                <div className="flex items-center space-x-3 pt-2">
                  <label className="text-xs font-semibold text-slate-700">Availability Status:</label>
                  <button
                    type="button"
                    onClick={() => setIsAvailable(!isAvailable)}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-bold ${
                      isAvailable ? 'bg-emerald-700 text-white' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {isAvailable ? 'Available for Pickups' : 'Currently Unavailable'}
                  </button>
                </div>
              </div>
            )}

            {/* Admin Form Fields */}
            {user?.role === 'ADMIN' && (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700">
                System Administrator profile settings are managed via Spring Security environment configurations.
              </div>
            )}

            {/* Form CTAs */}
            <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={handleSkip}
                className="w-full sm:w-auto"
              >
                Skip for Now
              </Button>

              <Button
                type="submit"
                variant="primary"
                isLoading={isLoading}
                rightIcon={<ArrowRight className="w-4 h-4" />}
                className="w-full sm:w-auto px-6"
              >
                Save & Continue
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
};
