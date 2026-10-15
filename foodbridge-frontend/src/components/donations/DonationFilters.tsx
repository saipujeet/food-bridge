import React from 'react';
import type { DonationFiltersState } from '../../hooks/useDonations';
import type { DonationStatus, FoodCategory } from '../../types';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Search } from 'lucide-react';

interface DonationFiltersProps {
  filters: DonationFiltersState;
  onChange: (filters: DonationFiltersState) => void;
}

export const DonationFilters: React.FC<DonationFiltersProps> = ({ filters, onChange }) => {
  const statusOptions: { value: DonationStatus | 'ALL'; label: string }[] = [
    { value: 'ALL', label: 'All Statuses' },
    { value: 'AVAILABLE', label: 'AVAILABLE' },
    { value: 'MATCHING', label: 'MATCHING' },
    { value: 'ACCEPTED', label: 'ACCEPTED' },
    { value: 'PICKUP_PENDING', label: 'PICKUP PENDING' },
    { value: 'PICKED_UP', label: 'PICKED UP' },
    { value: 'DELIVERED', label: 'DELIVERED' },
    { value: 'CANCELLED', label: 'CANCELLED' },
    { value: 'EXPIRED', label: 'EXPIRED' },
  ];

  const categoryOptions: { value: FoodCategory | 'ALL'; label: string }[] = [
    { value: 'ALL', label: 'All Categories' },
    { value: 'Cooked Meals', label: 'Cooked Meals' },
    { value: 'Rice', label: 'Rice' },
    { value: 'Biryani', label: 'Biryani' },
    { value: 'Vegetables', label: 'Vegetables' },
    { value: 'Fruits', label: 'Fruits' },
    { value: 'Bakery', label: 'Bakery' },
    { value: 'Dairy', label: 'Dairy' },
    { value: 'Packaged Food', label: 'Packaged Food' },
    { value: 'Other', label: 'Other' },
  ];

  const sortOptions = [
    { value: 'newest', label: 'Sort by: Newest First' },
    { value: 'oldest', label: 'Sort by: Oldest First' },
    { value: 'expiry', label: 'Sort by: Expiry Safe Time' },
  ];

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3 md:space-y-0 md:flex md:items-center md:justify-between md:gap-4">
      {/* Search Input */}
      <div className="flex-1 min-w-[200px]">
        <Input
          placeholder="Search by food name, ID, or category..."
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          leftIcon={<Search className="w-4 h-4 text-slate-400" />}
        />
      </div>

      {/* Dropdown Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:w-auto">
        <Select
          value={filters.status}
          onChange={(e) => onChange({ ...filters, status: e.target.value as DonationStatus | 'ALL' })}
          options={statusOptions}
        />
        <Select
          value={filters.category}
          onChange={(e) => onChange({ ...filters, category: e.target.value as FoodCategory | 'ALL' })}
          options={categoryOptions}
        />
        <Select
          value={filters.sortBy}
          onChange={(e) => onChange({ ...filters, sortBy: e.target.value as 'newest' | 'oldest' | 'expiry' })}
          options={sortOptions}
        />
      </div>
    </div>
  );
};
