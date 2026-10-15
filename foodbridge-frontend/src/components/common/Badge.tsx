import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'info' | 'neutral' | 'danger';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'neutral', size = 'sm', className = '' }) => {
  const variantStyles = {
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    info: 'bg-blue-50 text-blue-700 border-blue-200',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs font-medium',
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-md border ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {children}
    </span>
  );
};
