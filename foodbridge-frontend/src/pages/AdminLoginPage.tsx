import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../context/ToastContext';
import { Input } from '../components/common/Input';
import { PasswordInput } from '../components/common/PasswordInput';
import { Button } from '../components/common/Button';
import { isValidEmail } from '../utils';
import { ShieldCheck, Mail, ArrowRight, AlertCircle, Lock } from 'lucide-react';

export const AdminLoginPage: React.FC = () => {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('admin@foodbridge.org');
  const [password, setPassword] = useState('password123');

  const [errors, setErrors] = useState<{ email?: string; password?: string; api?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    const errs: { email?: string; password?: string } = {};
    if (!email.trim()) {
      errs.email = 'Admin email is required';
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
      if (loggedUser.role !== 'ADMIN') {
        throw new Error('FORBIDDEN: You must be a verified system administrator to access the Admin Portal.');
      }
      showToast('Admin Portal Access Granted', `Authenticated as ${loggedUser.name}`, 'success');
      navigate('/admin/dashboard');
    } catch (err: unknown) {
      const msg = (err as Error).message || 'Admin authentication failed. Please check credentials.';
      setErrors({ api: msg });
      showToast('Admin Security Error', msg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-6 text-white">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
        {/* Admin Branding Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-md">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">FoodBridge Admin Portal</h1>
          <p className="text-xs text-slate-400 font-medium">
            Platform Operations, Verification & Security Console
          </p>
        </div>

        {/* Global API Error Alert */}
        {errors.api && (
          <div className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-800 flex items-start space-x-2.5 text-rose-300 text-xs font-medium">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{errors.api}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <Input
            label="Admin Email"
            type="email"
            placeholder="admin@foodbridge.org"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
            required
            className="bg-slate-800 border-slate-700 text-white"
          />

          <PasswordInput
            label="Security Password"
            placeholder="Enter admin password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            required
            className="bg-slate-800 border-slate-700 text-white"
          />

          <div className="bg-slate-800/60 border border-slate-800 p-3 rounded-xl text-[11px] text-slate-400 space-y-1">
            <p className="font-bold text-slate-300 flex items-center space-x-1">
              <Lock className="w-3 h-3 text-emerald-400 mr-1" /> Default Demo Admin Account
            </p>
            <p className="font-mono text-emerald-400">Email: admin@foodbridge.org</p>
            <p className="font-mono text-emerald-400">Password: password123</p>
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black"
            isLoading={isLoading}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Access Admin Console
          </Button>
        </form>

        {/* Return to Public Portal */}
        <div className="pt-4 border-t border-slate-800 text-center">
          <Link
            to="/login"
            className="text-xs font-bold text-slate-400 hover:text-white transition-colors"
          >
            ← Return to Public FoodBridge Login
          </Link>
        </div>
      </div>
    </div>
  );
};
