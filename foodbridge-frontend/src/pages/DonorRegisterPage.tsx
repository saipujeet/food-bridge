import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../context/ToastContext';
import { Input } from '../components/common/Input';
import { PasswordInput } from '../components/common/PasswordInput';
import { PasswordStrengthMeter } from '../components/common/PasswordStrengthMeter';
import { Button } from '../components/common/Button';
import { isValidEmail, isValidPhone, checkPasswordStrength } from '../utils';
import { Building, User, Mail, Phone, MapPin, ArrowRight } from 'lucide-react';

export const DonorRegisterPage: React.FC = () => {
  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    orgName: '',
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    address: '',
    city: '',
    location: '',
    acceptTerms: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    const newErr: Record<string, string> = {};
    if (!formData.orgName.trim()) newErr.orgName = 'Organization name is required';
    if (!formData.fullName.trim()) newErr.fullName = 'Contact person full name is required';
    if (!formData.email.trim()) {
      newErr.email = 'Email address is required';
    } else if (!isValidEmail(formData.email)) {
      newErr.email = 'Enter a valid email address';
    }
    if (!formData.phone.trim()) {
      newErr.phone = 'Phone number is required';
    } else if (!isValidPhone(formData.phone)) {
      newErr.phone = 'Enter a valid phone number';
    }

    const strength = checkPasswordStrength(formData.password);
    if (!formData.password) {
      newErr.password = 'Password is required';
    } else if (strength.score < 3) {
      newErr.password = 'Password is too weak. Meet requirements below.';
    }

    if (formData.password !== formData.confirmPassword) {
      newErr.confirmPassword = 'Passwords do not match';
    }

    if (!formData.address.trim()) newErr.address = 'Street address is required';
    if (!formData.city.trim()) newErr.city = 'City name is required';
    if (!formData.acceptTerms) newErr.acceptTerms = 'You must accept terms & conditions to proceed';

    setErrors(newErr);
    return Object.keys(newErr).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      await register({
        role: 'DONOR',
        name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        organizationName: formData.orgName,
        address: formData.address,
        city: formData.city,
        location: formData.location || `${formData.address}, ${formData.city}`,
      });

      showToast('Registration Initiated', 'Verification code sent to email', 'info');
      // Redirect to OTP Verification Page 8
      navigate('/verify');
    } catch (err: unknown) {
      const msg = (err as Error).message || 'Registration failed. Try again.';
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
          <h2 className="text-2xl font-bold text-slate-900">Create Donor Account</h2>
          <p className="text-xs text-slate-500 mt-0.5">For restaurants, hotels, canteens & event organizers</p>
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
          label="Organization / Restaurant Name"
          placeholder="e.g. Grand Hyatt Canteen"
          value={formData.orgName}
          onChange={(e) => setFormData({ ...formData, orgName: e.target.value })}
          error={errors.orgName}
          leftIcon={<Building className="w-4 h-4" />}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Contact Person Name"
            placeholder="Marcus Vance"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            error={errors.fullName}
            leftIcon={<User className="w-4 h-4" />}
            required
          />

          <Input
            label="Phone Number"
            placeholder="+1 555-0192"
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
          placeholder="donor@foodbridge.org"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          error={errors.email}
          leftIcon={<Mail className="w-4 h-4" />}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Street Address"
            placeholder="742 Evergreen Terrace"
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
          placeholder="Re-enter password"
          value={formData.confirmPassword}
          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
          error={errors.confirmPassword}
          required
        />

        <div className="pt-2">
          <label className="flex items-start space-x-2 cursor-pointer text-xs text-slate-600">
            <input
              type="checkbox"
              checked={formData.acceptTerms}
              onChange={(e) => setFormData({ ...formData, acceptTerms: e.target.checked })}
              className="mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-600 h-4 w-4"
            />
            <span>
              I agree to the <a href="#" className="text-emerald-700 font-semibold underline">Terms of Service</a> and confirm our surplus food complies with health and safety guidelines.
            </span>
          </label>
          {errors.acceptTerms && (
            <p className="text-xs text-rose-600 font-medium mt-1">{errors.acceptTerms}</p>
          )}
        </div>

        <Button
          type="submit"
          variant="primary"
          className="w-full py-3"
          isLoading={isLoading}
          rightIcon={<ArrowRight className="w-4 h-4" />}
        >
          Create Donor Account
        </Button>
      </form>
    </div>
  );
};
