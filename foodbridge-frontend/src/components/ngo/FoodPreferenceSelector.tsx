import React, { useState } from 'react';
import type { FoodCategory, FoodType } from '../../types';
import { Button } from '../common/Button';
import { Utensils, Check, Save, Info } from 'lucide-react';

interface FoodPreferenceSelectorProps {
  initialCategories: FoodCategory[];
  initialFoodTypes: FoodType[];
  onSubmit: (categories: FoodCategory[], types: FoodType[]) => Promise<void>;
  isLoading?: boolean;
}

export const FoodPreferenceSelector: React.FC<FoodPreferenceSelectorProps> = ({
  initialCategories,
  initialFoodTypes,
  onSubmit,
  isLoading = false,
}) => {
  const [categories, setCategories] = useState<FoodCategory[]>(initialCategories || []);
  const [types, setTypes] = useState<FoodType[]>(initialFoodTypes || []);

  const allCategories: FoodCategory[] = [
    'Cooked Meals',
    'Rice',
    'Biryani',
    'Vegetables',
    'Fruits',
    'Bakery',
    'Dairy',
    'Packaged Food',
    'Other',
  ];

  const allTypes: FoodType[] = ['Vegetarian', 'Non-Vegetarian', 'Other'];

  const toggleCategory = (cat: FoodCategory) => {
    setCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const toggleType = (t: FoodType) => {
    setTypes((prev) =>
      prev.includes(t) ? prev.filter((item) => item !== t) : [...prev, t]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(categories, types);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {/* CATEGORIES SELECTION */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center space-x-2 text-xs font-extrabold uppercase tracking-wider text-slate-900 pb-3 border-b border-slate-200">
          <Utensils className="w-4 h-4 text-emerald-700" />
          <span>Accepted Food Categories (Multiple Selection)</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {allCategories.map((cat) => {
            const isSelected = categories.includes(cat);
            return (
              <button
                type="button"
                key={cat}
                onClick={() => toggleCategory(cat)}
                className={`p-3.5 rounded-xl border text-xs font-bold text-left flex items-center justify-between transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-50 border-emerald-600 text-emerald-950 ring-2 ring-emerald-600/20 shadow-xs'
                    : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>{cat}</span>
                <span
                  className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] font-black ${
                    isSelected ? 'bg-emerald-700 border-emerald-700 text-white' : 'border-slate-300'
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* FOOD TYPES SELECTION */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center space-x-2 text-xs font-extrabold uppercase tracking-wider text-slate-900 pb-3 border-b border-slate-200">
          <Info className="w-4 h-4 text-emerald-700" />
          <span>Accepted Dietary Food Types</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {allTypes.map((t) => {
            const isSelected = types.includes(t);
            return (
              <button
                type="button"
                key={t}
                onClick={() => toggleType(t)}
                className={`p-3.5 rounded-xl border text-xs font-bold text-left flex items-center justify-between transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-50 border-emerald-600 text-emerald-950 ring-2 ring-emerald-600/20 shadow-xs'
                    : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>{t}</span>
                <span
                  className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] font-black ${
                    isSelected ? 'bg-emerald-700 border-emerald-700 text-white' : 'border-slate-300'
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          variant="primary"
          isLoading={isLoading}
          leftIcon={<Save className="w-4 h-4" />}
          className="px-8 py-2.5 font-extrabold shadow-md bg-emerald-700 hover:bg-emerald-800 text-white"
        >
          Save Preferences
        </Button>
      </div>
    </form>
  );
};
