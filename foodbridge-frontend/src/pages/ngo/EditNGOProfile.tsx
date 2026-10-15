import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useNGOProfile } from '../../hooks/useNGOProfile';
import { useToast } from '../../context/ToastContext';
import { Input } from '../../components/common/Input';
import { Textarea } from '../../components/common/Select';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Building2, User, Phone, MapPin, Save, ArrowLeft, FileText } from 'lucide-react';

export const EditNGOProfile: React.FC = () => {
  const { profile, isLoading, updateProfile } = useNGOProfile();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [orgName, setOrgName] = useState('');
  const [regNum, setRegNum] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [description, setDescription] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setOrgName(profile.organizationName || '');
      setRegNum(profile.registrationNumber || '');
      setContactPerson(profile.contactPerson || '');
      setPhone(profile.phone || '');
      setAddress(profile.address || '');
      setCity(profile.city || '');
      setDescription(profile.description || '');
    }
  }, [profile]);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!orgName.trim()) errs.orgName = 'Organization name is required.';
    if (!contactPerson.trim()) errs.contactPerson = 'Contact person name is required.';
    if (!phone.trim()) errs.phone = 'Phone number is required.';
    if (!address.trim()) errs.address = 'Street address is required.';
    if (!city.trim()) errs.city = 'City name is required.';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSaving(true);
    try {
      await updateProfile({
        organizationName: orgName,
        registrationNumber: regNum,
        contactPerson,
        phone,
        address,
        city,
        description,
      });

      showToast('Profile Updated', 'NGO organization profile changes saved successfully.', 'success');
      navigate('/ngo/profile');
    } catch {
      showToast('Error', 'Unable to update profile.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-12">
        <LoadingSpinner size="lg" text="Loading profile form..." />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* HEADER */}
      <div className="space-y-1">
        <Link to="/ngo/profile" className="inline-flex items-center space-x-1.5 text-xs text-emerald-700 font-bold hover:underline mb-1">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Profile</span>
        </Link>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Edit NGO Profile</h1>
        <p className="text-xs text-slate-600">
          Update organization contact person, phone, street address, and description.
        </p>
      </div>

      {/* FORM */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6" noValidate>
        <div className="flex items-center space-x-2 text-xs font-extrabold uppercase tracking-wider text-slate-900 pb-3 border-b border-slate-200">
          <Building2 className="w-4 h-4 text-emerald-700" />
          <span>Organization Information</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Organization Name"
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
            error={errors.orgName}
            leftIcon={<Building2 className="w-4 h-4 text-slate-500" />}
            required
          />

          <Input
            label="Registration / Reference Number"
            placeholder="e.g. NGO-METRO-2024-8849"
            value={regNum}
            onChange={(e) => setRegNum(e.target.value)}
            leftIcon={<FileText className="w-4 h-4 text-slate-500" />}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Contact Person Name"
            value={contactPerson}
            onChange={(e) => setContactPerson(e.target.value)}
            error={errors.contactPerson}
            leftIcon={<User className="w-4 h-4 text-slate-500" />}
            required
          />

          <Input
            label="Phone Contact Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            error={errors.phone}
            leftIcon={<Phone className="w-4 h-4 text-slate-500" />}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Street Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            error={errors.address}
            leftIcon={<MapPin className="w-4 h-4 text-slate-500" />}
            required
          />

          <Input
            label="City"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            error={errors.city}
            required
          />
        </div>

        <Textarea
          label="Organization Description"
          placeholder="Describe your organization mission, community shelters, feeding capacity, or distribution center..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <div className="pt-4 border-t border-slate-200 flex items-center justify-end space-x-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/ngo/profile')}
            disabled={isSaving}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            variant="primary"
            isLoading={isSaving}
            leftIcon={<Save className="w-4 h-4" />}
            className="px-8 py-2.5 font-extrabold shadow-md bg-emerald-700 hover:bg-emerald-800 text-white"
          >
            Save Profile Changes
          </Button>
        </div>
      </form>
    </div>
  );
};
