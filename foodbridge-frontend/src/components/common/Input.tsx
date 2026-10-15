import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightElement?: React.ReactNode;
  required?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, leftIcon, rightElement, required, className = '', id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-extrabold uppercase tracking-wider text-slate-900 mb-1.5">
            {label}
            {required && <span className="text-rose-600 ml-1 font-bold" aria-hidden="true">*</span>}
          </label>
        )}
        <div className="relative rounded-lg shadow-xs">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`w-full rounded-lg border text-sm font-medium transition-all duration-150 py-2.5 px-3.5 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 ${
              leftIcon ? 'pl-10' : ''
            } ${rightElement ? 'pr-10' : ''} ${
              error
                ? 'border-rose-400 focus:border-rose-600 focus:ring-rose-600/20'
                : 'border-slate-300 focus:border-emerald-700 focus:ring-emerald-700/20'
            } ${className}`}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
            {...props}
          />
          {rightElement && (
            <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center">
              {rightElement}
            </div>
          )}
        </div>
        {error ? (
          <p id={`${inputId}-error`} className="mt-1 text-xs text-rose-600 font-bold">
            {error}
          </p>
        ) : helperText ? (
          <p id={`${inputId}-helper`} className="mt-1 text-[11px] text-slate-600 font-medium">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
