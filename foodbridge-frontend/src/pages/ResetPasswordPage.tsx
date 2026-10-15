import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import { useToast } from '../context/ToastContext';
import { PasswordInput } from '../components/common/PasswordInput';
import { PasswordStrengthMeter } from '../components/common/PasswordStrengthMeter';
import { Button } from '../components/common/Button';
import { checkPasswordStrength } from '../utils';
import { CheckCircle2, ArrowRight } from 'lucide-react';

export const ResetPasswordPage: React.FC = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string; api?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validate = () => {
    const errs: { password?: string; confirmPassword?: string } = {};
    const strength = checkPasswordStrength(password);

    if (!password) {
      errs.password = 'New password is required';
    } else if (strength.score < 4) {
      errs.password = 'Password does not meet required strength rules';
    }

    if (password !== confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      await authService.resetPassword(password);
      setIsSuccess(true);
      showToast('Password Updated', 'Your password has been successfully reset', 'success');
    } catch (err: unknown) {
      const msg = (err as Error).message || 'Failed to reset password';
      setErrors({ api: msg });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-md mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Create a New Password</h2>
        <p className="text-xs text-slate-600 mt-1">
          Please enter your new strong password below to secure your FoodBridge account.
        </p>
      </div>

      {isSuccess ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-xs">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Password Reset Complete</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Your password has been successfully changed. You can now sign in with your new credentials.
          </p>
          <Button
            variant="primary"
            className="w-full py-2.5"
            onClick={() => navigate('/login')}
          >
            Sign In Now
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {errors.api && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg font-medium">
              {errors.api}
            </div>
          )}

          <div>
            <PasswordInput
              label="New Password"
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              required
            />
            <PasswordStrengthMeter password={password} />
          </div>

          <PasswordInput
            label="Confirm New Password"
            placeholder="Re-enter new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
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
            Reset Password
          </Button>
        </form>
      )}

      <div className="pt-2 text-center text-xs">
        <Link to="/login" className="text-emerald-700 font-semibold hover:underline">
          Back to Login
        </Link>
      </div>
    </div>
  );
};
