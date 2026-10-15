import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { useToast } from '../context/ToastContext';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { isValidEmail } from '../utils';
import { Mail, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('Email address is required');
      return;
    }
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    try {
      await authService.forgotPassword(email);
      setIsSubmitted(true);
      showToast('Reset Link Dispatched', `Instructions sent to ${email}`, 'info');
    } catch (err: unknown) {
      setError((err as Error).message || 'Unable to send password reset email.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-md mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Forgot Your Password?</h2>
        <p className="text-xs text-slate-600 mt-1">
          Enter your registered email address and we'll help you reset your password.
        </p>
      </div>

      {isSubmitted ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 space-y-3 text-emerald-900 text-xs text-left">
          <div className="flex items-center space-x-2 font-bold text-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>Check Your Email Inbox</span>
          </div>
          <p className="leading-relaxed">
            We have sent password reset instructions to <strong>{email}</strong>. Please follow the link in the message to set a new password.
          </p>
          <div className="pt-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => navigate('/reset-password')}
            >
              Proceed to Reset Password Page
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <Input
            label="Registered Email Address"
            type="email"
            placeholder="name@organization.org"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={error || undefined}
            leftIcon={<Mail className="w-4 h-4" />}
            required
          />

          <Button
            type="submit"
            variant="primary"
            className="w-full py-3"
            isLoading={isLoading}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Send Reset Link
          </Button>
        </form>
      )}

      <div className="pt-2 text-center text-xs">
        <Link to="/login" className="inline-flex items-center space-x-1.5 text-slate-600 font-semibold hover:text-slate-900">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Login</span>
        </Link>
      </div>
    </div>
  );
};
