import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../context/ToastContext';
import { Input } from '../components/common/Input';
import { PasswordInput } from '../components/common/PasswordInput';
import { Button } from '../components/common/Button';
import { PasswordStrengthMeter } from '../components/common/PasswordStrengthMeter';
import { isValidEmail, isValidPhone, checkPasswordStrength } from '../utils';
import { Building2, User, Mail, Phone, MapPin, Clock, ArrowRight } from 'lucide-react';

export const NGORegisterPage: React.FC = () => {
  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    ngoName: '',
    contactPerson: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    address: '',
    city: '',
    latitude: '40.7128',
    longitude: '-74.0060',
    foodCategories: ['Cooked Meals', 'Packaged Goods'],
    foodCapacityKg: '250',
    operatingHours: '08:00 AM - 08:00 PM',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const toggleCategory = (cat: string) => {
    setFormData((prev) => {
      const exists = prev.foodCategories.includes(cat);
      if (exists) {
        return { ...prev, foodCategories: prev.foodCategories.filter((c) => c !== cat) };
      }
      return { ...prev, foodCategories: [...prev.foodCategories, cat] };
    });
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.ngoName.trim()) errs.ngoName = 'NGO Organization Name is required';
    if (!formData.contactPerson.trim()) errs.contactPerson = 'Contact Person Name is required';
    if (!formData.email.trim()) {
      errs.email = 'Email is required';
    } else if (!isValidEmail(formData.email)) {
      errs.email = 'Invalid email address';
    }
    if (!formData.phone.trim() || !isValidPhone(formData.phone)) errs.phone = 'Valid phone is required';

    const str = checkPasswordStrength(formData.password);
    if (!formData.password) errs.password = 'Password is required';
    else if (str.score < 3) errs.password = 'Password too weak';

    if (formData.password !== formData.confirmPassword) errs.confirmPassword = 'Passwords mismatch';
    if (!formData.address.trim()) errs.address = 'Address is required';
    if (!formData.city.trim()) errs.city = 'City is required';
    if (formData.foodCategories.length === 0) errs.foodCategories = 'Select at least one food category';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      await register({
        role: 'NGO',
        name: formData.contactPerson,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        organizationName: formData.ngoName,
        address: formData.address,
        city: formData.city,
        location: `${formData.address}, ${formData.city}`,
        ngoCategory: formData.foodCategories,
        foodCapacityKg: Number(formData.foodCapacityKg) || 100,
        operatingHours: formData.operatingHours,
      });

      showToast('NGO Registration Initiated', 'OTP Sent to registered email', 'info');
      navigate('/verify');
    } catch (err: unknown) {
      const msg = (err as Error).message || 'Registration failed';
      setErrors({ api: msg });
      showToast('Error', msg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Register Your NGO</h2>
          <p className="text-xs text-slate-500 mt-0.5">For shelters, community kitchens & food banks</p>
        </div>
        <Link to="/register" className="text-xs text-emerald-700 font-semibold hover:underline">
          Change Role
        </Link>
      </div>

      {errors.api && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg font-medium">
          {errors.api}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Input
          label="NGO / Organization Name"
          placeholder="e.g. Hope Harvest Foundation"
          value={formData.ngoName}
          onChange={(e) => setFormData({ ...formData, ngoName: e.target.value })}
          error={errors.ngoName}
          leftIcon={<Building2 className="w-4 h-4" />}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Contact Person"
            placeholder="Sarah Jenkins"
            value={formData.contactPerson}
            onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
            error={errors.contactPerson}
            leftIcon={<User className="w-4 h-4" />}
            required
          />

          <Input
            label="Phone Number"
            placeholder="+1 555-0144"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            error={errors.phone}
            leftIcon={<Phone className="w-4 h-4" />}
            required
          />
        </div>

        <Input
          label="Email Address"
          type="email"
          placeholder="ngo@foodbridge.org"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          error={errors.email}
          leftIcon={<Mail className="w-4 h-4" />}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Address"
            placeholder="108 Compassion Ave"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            error={errors.address}
            leftIcon={<MapPin className="w-4 h-4" />}
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

        {/* Lat / Lng ready inputs */}
        <div className="p-3 bg-slate-100 rounded-lg border border-slate-200 text-xs space-y-2">
          <div className="flex items-center space-x-1 font-semibold text-slate-700">
            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
            <span>Geo-Location Coordinates (Backend Radius Expansion Service)</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-slate-500 font-medium">Latitude</label>
              <input
                type="text"
                value={formData.latitude}
                onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                className="w-full text-xs p-1.5 rounded border border-slate-300 bg-white"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-500 font-medium">Longitude</label>
              <input
                type="text"
                value={formData.longitude}
                onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                className="w-full text-xs p-1.5 rounded border border-slate-300 bg-white"
              />
            </div>
          </div>
        </div>

        {/* Categories Checkbox Selection */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
            Accepted Food Categories <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            {['Cooked Meals', 'Bakery & Bread', 'Packaged Goods', 'Fresh Produce'].map((cat) => {
              const checked = formData.foodCategories.includes(cat);
              return (
                <button
                  type="button"
                  key={cat}
                  onClick={() => toggleCategory(cat)}
                  className={`p-2 rounded-lg border text-xs font-medium text-left flex items-center justify-between transition-colors ${
                    checked
                      ? 'bg-emerald-50 border-emerald-600 text-emerald-900 font-bold'
                      : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>{cat}</span>
                  <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center text-[9px] ${
                    checked ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-400'
                  }`}>
                    {checked && '✓'}
                  </span>
                </button>
              );
            })}
          </div>
          {errors.foodCategories && (
            <p className="text-xs text-rose-600 font-medium mt-1">{errors.foodCategories}</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Approx. Capacity (kg)"
            type="number"
            placeholder="250"
            value={formData.foodCapacityKg}
            onChange={(e) => setFormData({ ...formData, foodCapacityKg: e.target.value })}
            required
          />
          <Input
            label="Operating Hours"
            placeholder="08:00 AM - 08:00 PM"
            value={formData.operatingHours}
            onChange={(e) => setFormData({ ...formData, operatingHours: e.target.value })}
            leftIcon={<Clock className="w-4 h-4" />}
            required
          />
        </div>

        <div>
          <PasswordInput
            label="Password"
            placeholder="Create password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            error={errors.password}
            required
          />
          <PasswordStrengthMeter password={formData.password} />
        </div>

        <PasswordInput
          label="Confirm Password"
          placeholder="Confirm password"
          value={formData.confirmPassword}
          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
          error={errors.confirmPassword}
          required
        />

        <Button
          type="submit"
          variant="primary"
          className="w-full py-3"
          isLoading={isLoading}
          rightIcon={<ArrowRight className="w-4 h-4" />}
        >
          Register NGO
        </Button>
      </form>
    </div>
  );
};
