import React from 'react';
import { Card, CardBody } from '../common/Card';
import { MapPin, Info } from 'lucide-react';

interface MatchingEmptyStateProps {
  radiusKm?: number;
}

export const MatchingEmptyState: React.FC<MatchingEmptyStateProps> = ({ radiusKm = 5 }) => {
  return (
    <Card className="border-slate-200">
      <CardBody className="p-8 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
          <MapPin className="w-6 h-6 text-slate-500" />
        </div>

        <div className="space-y-1">
          <h3 className="text-base font-extrabold text-slate-900">
            No suitable NGO found within {radiusKm} km.
          </h3>
          <p className="text-xs text-slate-600 max-w-lg mx-auto leading-relaxed font-medium">
            No verified NGO currently meets the category, food type, capacity, and proximity criteria within the initial {radiusKm} km boundary.
          </p>
        </div>

        <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-950 max-w-md mx-auto space-y-1 text-left">
          <div className="flex items-center space-x-1.5 font-bold">
            <Info className="w-4 h-4 text-blue-700 shrink-0" />
            <span>Time-Aware Radius Expansion (Module 5)</span>
          </div>
          <p className="text-[11px] text-blue-800 leading-relaxed font-medium">
            The system will automatically expand search radius (5 km → 10 km → 15 km → 20 km) based on donation expiration time in Module 5.
          </p>
        </div>
      </CardBody>
    </Card>
  );
};
