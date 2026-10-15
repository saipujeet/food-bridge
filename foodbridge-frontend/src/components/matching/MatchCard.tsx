import React from 'react';
import { Link } from 'react-router-dom';
import type { DonationMatch } from '../../types';
import { MatchStatusBadge } from './MatchStatusBadge';
import { DistanceBadge } from './DistanceBadge';
import { CapacityIndicator } from './CapacityIndicator';
import { FoodCompatibilityBadge } from './FoodCompatibilityBadge';
import { Card, CardBody } from '../common/Card';
import { Button } from '../common/Button';
import { Clock, MapPin, Eye, Building2, CheckCircle2, XCircle } from 'lucide-react';

interface MatchCardProps {
  match: DonationMatch;
  onViewDetails: (match: DonationMatch) => void;
  onAccept?: (match: DonationMatch) => void;
  onReject?: (match: DonationMatch) => void;
}

export const MatchCard: React.FC<MatchCardProps> = ({ match, onViewDetails, onAccept, onReject }) => {
  const isOffered = match.matchStatus === 'OFFERED';
  const isCapacitySufficient = match.availableCapacity >= match.donationQuantity;

  return (
    <Card className="border-slate-200 hover:border-slate-300 shadow-xs transition-all flex flex-col justify-between">
      <CardBody className="p-5 space-y-4">
        {/* HEADER: Category, Distance & Status */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                Surplus Food Offer
              </span>
              <DistanceBadge distanceKm={match.distanceKm} />
            </div>
            <h3 className="text-base font-extrabold text-slate-900 leading-snug">
              {match.foodName}
            </h3>
          </div>
          <MatchStatusBadge status={match.matchStatus} size="sm" />
        </div>

        {/* COMPATIBILITY & QUANTITY */}
        <div className="space-y-2">
          <FoodCompatibilityBadge category={match.foodCategory} foodType={match.foodType} />

          <div className="flex items-center justify-between p-2.5 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs">
            <span className="font-bold text-slate-700">Donation Quantity:</span>
            <span className="text-sm font-black text-emerald-950">
              {match.donationQuantity} {match.donationUnit}
            </span>
          </div>
        </div>

        {/* CAPACITY INDICATOR */}
        <CapacityIndicator
          requiredQuantity={match.donationQuantity}
          availableCapacity={match.availableCapacity}
          capacityUnit={match.capacityUnit}
        />

        {/* DONOR & TIME DETAILS */}
        <div className="space-y-1.5 text-xs text-slate-600 pt-1">
          <p className="flex items-center space-x-2 truncate">
            <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>Donor: <strong>{match.donorName}</strong></span>
          </p>
          <p className="flex items-start space-x-2 truncate">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
            <span className="truncate">{match.pickupAddress}, {match.pickupCity || ''}</span>
          </p>
          <p className="flex items-center space-x-2 text-slate-700 font-semibold">
            <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>Available Until: {new Date(match.availableUntil).toLocaleString()}</span>
          </p>
        </div>

        {/* ACTION BUTTONS (MODULE 6 ACCEPT / REJECT / DETAILS / MAP) */}
        <div className="pt-2 border-t border-slate-100 space-y-2">
          {isOffered && onAccept && onReject ? (
            <div className="flex items-center space-x-2">
              <Button
                variant="primary"
                size="sm"
                className="flex-1"
                disabled={!isCapacitySufficient}
                onClick={() => onAccept(match)}
                leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
              >
                Accept Offer
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => onReject(match)}
                leftIcon={<XCircle className="w-3.5 h-3.5" />}
              >
                Reject
              </Button>
              <Link to={`/deliveries/${match.donationId}/map`}>
                <Button
                  variant="outline"
                  size="sm"
                  title="View Location Map (Volunteer, NGO, Donor)"
                  className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                >
                  <MapPin className="w-3.5 h-3.5" />
                </Button>
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onViewDetails(match)}
                title="View Match Details"
              >
                <Eye className="w-3.5 h-3.5 text-slate-600" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Button
                variant="secondary"
                size="sm"
                className="flex-1"
                onClick={() => onViewDetails(match)}
                leftIcon={<Eye className="w-4 h-4 text-slate-600" />}
              >
                View Match Details
              </Button>
              <Link to={`/deliveries/${match.donationId}/map`}>
                <Button
                  variant="outline"
                  size="sm"
                  title="View Location Map"
                  className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                >
                  <MapPin className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
};
