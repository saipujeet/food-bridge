import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../context/ToastContext';
import { Input } from '../components/common/Input';
import { PasswordInput } from '../components/common/PasswordInput';
import { PasswordStrengthMeter } from '../components/common/PasswordStrengthMeter';
import { Button } from '../components/common/Button';
import { isValidEmail, isValidPhone, checkPasswordStrength } from '../utils';
import { User, Mail, Phone, MapPin, ArrowRight } from 'lucide-react';

export const VolunteerRegisterPage: React.FC = () => {
  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    city: 'Metropolis',
    preferredArea: 'Downtown & Central Sector',
    isAvailable: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.fullName.trim()) errs.fullName = 'Full name is required';
    if (!formData.email.trim() || !isValidEmail(formData.email)) errs.email = 'Valid email is required';
    if (!formData.phone.trim() || !isValidPhone(formData.phone)) errs.phone = 'Valid phone is required';

    const str = checkPasswordStrength(formData.password);
    if (!formData.password) errs.password = 'Password is required';
    else if (str.score < 3) errs.password = 'Password too weak';

    if (formData.password !== formData.confirmPassword) errs.confirmPassword = 'Passwords mismatch';
    if (!formData.city.trim()) errs.city = 'City is required';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      await register({
        role: 'VOLUNTEER',
        name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        city: formData.city,
        preferredArea: formData.preferredArea,
        isAvailable: formData.isAvailable,
      });

      showToast('Volunteer Account Initiated', 'Verification OTP sent to email', 'info');
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
          <h2 className="text-2xl font-bold text-slate-900">Become a FoodBridge Volunteer</h2>
          <p className="text-xs text-slate-500 mt-0.5">Assist with local pickup logistics and delivery</p>
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
          label="Full Name"
          placeholder="David Miller"
          value={formData.fullName}
          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
          error={errors.fullName}
          leftIcon={<User className="w-4 h-4" />}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="volunteer@foodbridge.org"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            error={errors.email}
            leftIcon={<Mail className="w-4 h-4" />}
            required
          />

          <Input
            label="Phone Number"
            placeholder="+1 555-0188"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            error={errors.phone}
            leftIcon={<Phone className="w-4 h-4" />}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="City"
            placeholder="Metropolis"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            error={errors.city}
            required
          />

          <Input
            label="Preferred Pickup Area"
            placeholder="Downtown & Central"
            value={formData.preferredArea}
            onChange={(e) => setFormData({ ...formData, preferredArea: e.target.value })}
            leftIcon={<MapPin className="w-4 h-4" />}
          />
        </div>

        {/* Availability Selection */}
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
            Initial Availability Status
          </label>
          <div className="flex items-center space-x-4">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, isAvailable: true })}
              className={`flex-1 py-2 px-3 rounded-lg border text-xs font-bold transition-all ${
                formData.isAvailable
                  ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-300'
              }`}
            >
              Available for Pickup
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, isAvailable: false })}
              className={`flex-1 py-2 px-3 rounded-lg border text-xs font-bold transition-all ${
                !formData.isAvailable
                  ? 'bg-slate-800 text-white border-slate-800 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-300'
              }`}
            >
              Currently Unavailable
            </button>
          </div>
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
          Create Volunteer Account
        </Button>
      </form>
    </div>
  );
};
