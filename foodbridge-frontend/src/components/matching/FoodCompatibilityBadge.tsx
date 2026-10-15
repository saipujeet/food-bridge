import React from 'react';
import type { FoodCategory, FoodType } from '../../types';
import { Utensils, Check } from 'lucide-react';

interface FoodCompatibilityBadgeProps {
  category: FoodCategory;
  foodType: FoodType;
}

export const FoodCompatibilityBadge: React.FC<FoodCompatibilityBadgeProps> = ({
  category,
  foodType,
}) => {
  return (
    <div className="flex flex-wrap items-center gap-1.5 text-xs">
      <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md bg-blue-50 text-blue-900 border border-blue-200 font-bold">
        <Utensils className="w-3 h-3 text-blue-600" />
        <span>{category}</span>
      </span>

      <span
        className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-md border font-bold ${
          foodType === 'Vegetarian'
            ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
            : 'bg-amber-50 text-amber-900 border-amber-200'
        }`}
      >
        <Check className="w-3 h-3" />
        <span>{foodType}</span>
      </span>
    </div>
  );
};
