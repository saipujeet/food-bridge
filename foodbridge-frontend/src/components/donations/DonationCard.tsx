import React from 'react';
import type { FoodDonation } from '../../types';
import { isDonationEditable, isDonationCancellable } from '../../utils/donationStatus';
import { DonationStatusBadge } from './DonationStatusBadge';
import { Card, CardBody } from '../common/Card';
import { Button } from '../common/Button';
import { Eye, Edit3, XCircle, MapPin, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

interface DonationCardProps {
  donation: FoodDonation;
  onCancelClick?: (donation: FoodDonation) => void;
}

export const DonationCard: React.FC<DonationCardProps> = ({ donation, onCancelClick }) => {
  const editable = isDonationEditable(donation.status);
  const cancellable = isDonationCancellable(donation.status);

  return (
    <Card hoverable className="h-full flex flex-col justify-between border-slate-200">
      <CardBody className="p-5 space-y-4 flex flex-col justify-between h-full">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                {donation.id}
              </span>
              <h4 className="text-base font-bold text-slate-900 mt-1 line-clamp-1">
                {donation.foodName}
              </h4>
            </div>
            <DonationStatusBadge status={donation.status} />
          </div>

          {/* Quantity & Category Info */}
          <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs">
            <div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase block">Quantity</span>
              <span className="font-extrabold text-slate-900">
                {donation.quantity} {donation.unit}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase block">Category</span>
              <span className="font-semibold text-slate-800">{donation.foodCategory}</span>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-1.5 text-xs text-slate-600">
            <div className="flex items-center text-slate-500">
              <Clock className="w-3.5 h-3.5 mr-1.5 text-emerald-600 shrink-0" />
              <span>Available until: <strong className="text-slate-900">{donation.availableUntil}</strong></span>
            </div>
            <div className="flex items-center text-slate-500">
              <MapPin className="w-3.5 h-3.5 mr-1.5 text-slate-400 shrink-0" />
              <span className="truncate">{donation.donorAddress}, {donation.donorCity}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
          <Link to={`/donor/donations/${donation.id}`}>
            <Button variant="outline" size="sm" leftIcon={<Eye className="w-3.5 h-3.5" />}>
              View
            </Button>
          </Link>

          {editable && (
            <Link to={`/donor/donations/${donation.id}/edit`}>
              <Button variant="ghost" size="sm" leftIcon={<Edit3 className="w-3.5 h-3.5 text-emerald-700" />}>
                Edit
              </Button>
            </Link>
          )}

          {cancellable && onCancelClick && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onCancelClick(donation)}
              className="text-rose-600 hover:bg-rose-50"
              leftIcon={<XCircle className="w-3.5 h-3.5 text-rose-600" />}
            >
              Cancel
            </Button>
          )}
        </div>
      </CardBody>
    </Card>
  );
};
