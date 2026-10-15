import React from 'react';
import { checkPasswordStrength } from '../../utils';
import { Check, X } from 'lucide-react';

interface PasswordStrengthMeterProps {
  password: string;
}

export const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({ password }) => {
  if (!password) return null;

  const strength = checkPasswordStrength(password);

  const getBarColor = (score: number) => {
    if (score <= 1) return 'bg-rose-500';
    if (score === 2) return 'bg-amber-500';
    if (score === 3) return 'bg-yellow-500';
    if (score === 4) return 'bg-emerald-500';
    return 'bg-emerald-600';
  };

  const requirements = [
    { label: 'At least 8 characters', met: strength.hasMinLength },
    { label: 'One uppercase letter (A-Z)', met: strength.hasUpper },
    { label: 'One lowercase letter (a-z)', met: strength.hasLower },
    { label: 'One number (0-9)', met: strength.hasNumber },
    { label: 'One special character (!@#$%^&*)', met: strength.hasSpecial },
  ];

  return (
    <div className="mt-2 space-y-2">
      {/* Strength Bar */}
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-600 font-medium">Password Strength:</span>
        <span className="font-semibold text-slate-800">{strength.label}</span>
      </div>
      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex gap-1">
        {[1, 2, 3, 4, 5].map((level) => (
          <div
            key={level}
            className={`h-full flex-1 transition-all duration-300 ${
              level <= strength.score ? getBarColor(strength.score) : 'bg-slate-200'
            }`}
          />
        ))}
      </div>

      {/* Criteria checklist */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 pt-1 text-xs text-slate-600">
        {requirements.map((req, idx) => (
          <div key={idx} className="flex items-center space-x-1.5">
            {req.met ? (
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            ) : (
              <X className="w-3.5 h-3.5 text-slate-300 shrink-0" />
            )}
            <span className={req.met ? 'text-slate-800 font-medium' : 'text-slate-400'}>
              {req.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
