import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/common/Button';
import { Mail, CheckCircle2, AlertCircle } from 'lucide-react';

export const OTPVerifyPage: React.FC = () => {
  const { verifyOtp } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const email = sessionStorage.getItem('pending_verification_email') || 'donor@foodbridge.org';

  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [timer, setTimer] = useState<number>(60);
  const [canResend, setCanResend] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [resendSuccess, setResendSuccess] = useState<boolean>(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Timer Countdown Effect
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Auto move focus next
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join('');
    setError(null);

    if (code.length < 6) {
      setError('Please enter all 6 digits of the verification code.');
      return;
    }

    if (canResend && timer === 0) {
      setError('The verification code has expired. Click "Resend OTP" to generate a new code.');
      return;
    }

    setIsLoading(true);
    try {
      const verifiedUser = await verifyOtp(email, code);
      showToast('Verification Successful!', 'Your FoodBridge account is now verified.', 'success');
      navigate('/auth-success', { state: { role: verifiedUser.role, user: verifiedUser } });
    } catch (err: unknown) {
      const msg = (err as Error).message || 'Invalid verification code. Please check and try again.';
      setError(msg);
      showToast('Verification Failed', msg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = () => {
    setOtp(['', '', '', '', '', '']);
    setTimer(60);
    setCanResend(false);
    setError(null);
    setResendSuccess(true);
    showToast('Code Resent', `A new verification code was sent to ${email}`, 'info');
    setTimeout(() => setResendSuccess(false), 5000);
    inputRefs.current[0]?.focus();
  };

  return (
    <div className="space-y-6 max-w-md mx-auto text-center">
      <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center mx-auto">
        <Mail className="w-6 h-6" />
      </div>

      <div>
        <h2 className="text-2xl font-bold text-slate-900">Verify Your Account</h2>
        <p className="text-xs text-slate-600 mt-1 max-w-xs mx-auto">
          We've sent a 6-digit verification code to <span className="font-semibold text-slate-900">{email}</span>
        </p>
      </div>

      {resendSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs rounded-lg font-medium flex items-center justify-center space-x-1.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>New verification code sent successfully!</span>
        </div>
      )}

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-900 text-xs rounded-lg font-medium flex items-center justify-center space-x-1.5">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleVerify} className="space-y-6">
        {/* 6 Digit Inputs */}
        <div className="flex justify-center space-x-2 sm:space-x-3">
          {otp.map((digit, idx) => (
            <input
              key={idx}
              ref={(el) => {
                inputRefs.current[idx] = el;
              }}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-extrabold rounded-lg border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 bg-white text-slate-900 focus:outline-none transition-all"
            />
          ))}
        </div>

        {/* Countdown Timer */}
        <div className="text-xs text-slate-500 font-medium">
          {timer > 0 ? (
            <span>Code expires in <strong className="text-emerald-700">{timer}s</strong></span>
          ) : (
            <span className="text-rose-600 font-semibold">Verification code expired</span>
          )}
        </div>

        <Button
          type="submit"
          variant="primary"
          className="w-full py-3"
          isLoading={isLoading}
        >
          Verify Account
        </Button>
      </form>

      {/* Resend Action */}
      <div className="pt-2 text-xs text-slate-600">
        Didn't receive the code?{' '}
        <button
          type="button"
          onClick={handleResend}
          disabled={!canResend}
          className={`font-bold focus:outline-none ${
            canResend
              ? 'text-emerald-700 hover:underline cursor-pointer'
              : 'text-slate-400 cursor-not-allowed'
          }`}
        >
          Resend OTP
        </button>
      </div>
    </div>
  );
};
