import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../context/ToastContext';
import { Input } from '../components/common/Input';
import { PasswordInput } from '../components/common/PasswordInput';
import { Button } from '../components/common/Button';
import { isValidEmail } from '../utils';
import { Mail, ArrowRight, AlertCircle } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const [errors, setErrors] = useState<{ email?: string; password?: string; api?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    const errs: { email?: string; password?: string } = {};
    if (!email.trim()) {
      errs.email = 'Email address is required';
    } else if (!isValidEmail(email)) {
      errs.email = 'Please enter a valid email address';
    }

    if (!password) {
      errs.password = 'Password is required';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!validate()) return;

    setIsLoading(true);
    try {
      const loggedUser = await login({ email, password });
      showToast('Welcome back!', `Signed in as ${loggedUser.name}`, 'success');
      navigate('/auth-success', { state: { role: loggedUser.role, user: loggedUser } });
    } catch (err: unknown) {
      const msg = (err as Error).message || 'Unable to connect to the server. Please try again.';
      setErrors({ api: msg });
      showToast('Authentication Error', msg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Welcome Back</h2>
        <p className="text-xs text-slate-600 mt-1 font-medium">
          Sign in to access your Donor, NGO, or Volunteer Portal
        </p>
      </div>

      {/* Global API Error Alert */}
      {errors.api && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start space-x-2.5 text-rose-800 text-xs font-medium">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <span>{errors.api}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Input
          label="Email Address"
          type="email"
          placeholder="donor@foodbridge.org / ngo@foodbridge.org"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          leftIcon={<Mail className="w-4 h-4" />}
          required
        />

        <PasswordInput
          label="Password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          required
        />

        <div className="flex items-center justify-between text-xs pt-1">
          <label className="flex items-center space-x-2 cursor-pointer text-slate-600">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-600 h-4 w-4"
            />
            <span>Remember me</span>
          </label>

          <Link
            to="/forgot-password"
            className="text-emerald-700 hover:text-emerald-800 font-bold focus:outline-none"
          >
            Forgot password?
          </Link>
        </div>

        <Button
          type="submit"
          variant="primary"
          className="w-full py-3"
          isLoading={isLoading}
          rightIcon={<ArrowRight className="w-4 h-4" />}
        >
          Sign In
        </Button>
      </form>

      {/* Footer Link */}
      <div className="pt-4 border-t border-slate-200 text-center">
        <p className="text-xs text-slate-600">
          Don't have an account?{' '}
          <Link to="/register" className="text-emerald-700 font-bold hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
};
