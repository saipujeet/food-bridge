import React from 'react';
import { LoadingSpinner } from '../common/LoadingSpinner';

interface MatchingLoaderProps {
  message?: string;
  radiusKm?: number;
}

export const MatchingLoader: React.FC<MatchingLoaderProps> = ({
  message = 'Finding suitable NGOs within search radius...',
  radiusKm = 5,
}) => {
  return (
    <div className="py-12 px-6 bg-white rounded-2xl border border-slate-200 text-center space-y-4 shadow-xs">
      <LoadingSpinner size="lg" text={message} />
      <p className="text-xs text-slate-500 font-medium max-w-md mx-auto">
        Evaluating verified NGO profiles, food category compatibility, current receiving capacity, and location proximity ({radiusKm} km radius).
      </p>
    </div>
  );
};
