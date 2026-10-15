import React, { useState } from 'react';
import { Input, type InputProps } from './Input';
import { Eye, EyeOff, Lock } from 'lucide-react';

export interface PasswordInputProps extends Omit<InputProps, 'type' | 'rightElement'> {}

export const PasswordInput: React.FC<PasswordInputProps> = (props) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <Input
      {...props}
      type={showPassword ? 'text' : 'password'}
      leftIcon={<Lock className="w-4 h-4" />}
      rightElement={
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="text-slate-400 hover:text-slate-600 focus:outline-none focus:text-emerald-600"
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      }
    />
  );
};
