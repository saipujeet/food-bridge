import React from 'react';
import type { FoodDonation } from '../../types';
import { isDonationEditable, isDonationCancellable } from '../../utils/donationStatus';
import { DonationStatusBadge } from './DonationStatusBadge';
import { DonationCard } from './DonationCard';
import { Button } from '../common/Button';
import { Eye, Edit3, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface DonationTableProps {
  donations: FoodDonation[];
  onCancelClick?: (donation: FoodDonation) => void;
}

export const DonationTable: React.FC<DonationTableProps> = ({ donations, onCancelClick }) => {
  return (
    <div>
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
              <th className="p-3.5">Donation ID</th>
              <th className="p-3.5">Food Item</th>
              <th className="p-3.5">Quantity & Unit</th>
              <th className="p-3.5">Created Date</th>
              <th className="p-3.5">Available Until</th>
              <th className="p-3.5">Status</th>
              <th className="p-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
            {donations.map((item) => {
              const editable = isDonationEditable(item.status);
              const cancellable = isDonationCancellable(item.status);

              return (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3.5">
                    <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                      {item.id}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <div className="font-bold text-slate-900">{item.foodName}</div>
                    <div className="text-[11px] text-slate-500">{item.foodCategory} • {item.foodType}</div>
                  </td>
                  <td className="p-3.5 font-bold text-slate-900">
                    {item.quantity} {item.unit}
                  </td>
                  <td className="p-3.5 text-slate-600">
                    {new Date(item.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="p-3.5 font-semibold text-amber-700">
                    {item.availableUntil}
                  </td>
                  <td className="p-3.5">
                    <DonationStatusBadge status={item.status} />
                  </td>
                  <td className="p-3.5 text-right space-x-1">
                    <Link to={`/donor/donations/${item.id}`}>
                      <Button variant="outline" size="sm" leftIcon={<Eye className="w-3.5 h-3.5" />}>
                        View
                      </Button>
                    </Link>

                    {editable && (
                      <Link to={`/donor/donations/${item.id}/edit`}>
                        <Button variant="ghost" size="sm" leftIcon={<Edit3 className="w-3.5 h-3.5 text-emerald-700" />}>
                          Edit
                        </Button>
                      </Link>
                    )}

                    {cancellable && onCancelClick && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onCancelClick(item)}
                        className="text-rose-600 hover:bg-rose-50"
                        leftIcon={<XCircle className="w-3.5 h-3.5 text-rose-600" />}
                      >
                        Cancel
                      </Button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card List View */}
      <div className="md:hidden grid grid-cols-1 gap-4">
        {donations.map((item) => (
          <DonationCard key={item.id} donation={item} onCancelClick={onCancelClick} />
        ))}
      </div>
    </div>
  );
};
