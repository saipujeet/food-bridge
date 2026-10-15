import React from 'react';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
  helperText?: string;
  required?: boolean;
}

export const Select: React.FC<SelectProps> = ({
  label,
  options,
  error,
  helperText,
  required,
  className = '',
  id,
  ...props
}) => {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={selectId} className="block text-xs font-extrabold uppercase tracking-wider text-slate-900 mb-1.5">
          {label}
          {required && <span className="text-rose-600 ml-1 font-bold" aria-hidden="true">*</span>}
        </label>
      )}
      <select
        id={selectId}
        className={`w-full rounded-lg border text-sm font-medium transition-all duration-150 py-2.5 px-3.5 bg-white text-slate-900 focus:outline-none focus:ring-2 ${
          error
            ? 'border-rose-400 focus:border-rose-600 focus:ring-rose-600/20'
            : 'border-slate-300 focus:border-emerald-700 focus:ring-emerald-700/20'
        } ${className}`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="text-slate-900 font-medium py-1">
            {opt.label}
          </option>
        ))}
      </select>
      {error ? (
        <p className="mt-1 text-xs text-rose-600 font-bold">{error}</p>
      ) : helperText ? (
        <p className="mt-1 text-[11px] text-slate-600 font-medium">{helperText}</p>
      ) : null}
    </div>
  );
};

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
}

export const Textarea: React.FC<TextareaProps> = ({
  label,
  error,
  helperText,
  required,
  className = '',
  id,
  ...props
}) => {
  const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={textareaId} className="block text-xs font-extrabold uppercase tracking-wider text-slate-900 mb-1.5">
          {label}
          {required && <span className="text-rose-600 ml-1 font-bold" aria-hidden="true">*</span>}
        </label>
      )}
      <textarea
        id={textareaId}
        rows={3}
        className={`w-full rounded-lg border text-sm font-medium transition-all duration-150 py-2.5 px-3.5 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 ${
          error
            ? 'border-rose-400 focus:border-rose-600 focus:ring-rose-600/20'
            : 'border-slate-300 focus:border-emerald-700 focus:ring-emerald-700/20'
        } ${className}`}
        {...props}
      />
      {error ? (
        <p className="mt-1 text-xs text-rose-600 font-bold">{error}</p>
      ) : helperText ? (
        <p className="mt-1 text-[11px] text-slate-600 font-medium">{helperText}</p>
      ) : null}
    </div>
  );
};
