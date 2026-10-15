import React from 'react';

interface ProgressBarProps {
  progress: number; // 0 to 100
  label?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress, label }) => {
  const clamped = Math.min(100, Math.max(0, progress));

  return (
    <div className="w-full space-y-1.5">
      <div className="flex justify-between items-center text-xs font-semibold text-slate-700">
        <span>{label || 'Profile Completion'}</span>
        <span className="text-emerald-700">{clamped}%</span>
      </div>
      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-emerald-600 transition-all duration-500 rounded-full"
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
};
