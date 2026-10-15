import React from 'react';
import type { DeliveryMapData } from '../../types';
import { Navigation, Truck, Clock, ShieldCheck, AlertCircle } from 'lucide-react';
import { Badge } from '../common/Badge';
import { calculateHaversineDistance, isValidCoordinate } from '../../utils/distanceUtils';

interface LocationSummaryProps {
  mapData: DeliveryMapData;
  isMapUnavailable?: boolean;
}

export const LocationSummary: React.FC<LocationSummaryProps> = ({ mapData, isMapUnavailable = false }) => {
  const getStatusBadgeVariant = () => {
    switch (mapData.status) {
      case 'DELIVERED':
        return 'success';
      case 'IN_TRANSIT':
      case 'PICKED_UP':
        return 'warning';
      case 'ACCEPTED':
      case 'PICKUP_PENDING':
      case 'ASSIGNED':
        return 'info';
      case 'CANCELLED':
      case 'FAILED':
        return 'danger';
      default:
        return 'neutral';
    }
  };

  // Calculate segment distances using Haversine algorithm
  const hasPickup = isValidCoordinate(mapData.pickup.latitude, mapData.pickup.longitude);
  const hasDest = isValidCoordinate(mapData.destination.latitude, mapData.destination.longitude);
  const hasVolunteer = mapData.volunteer && isValidCoordinate(mapData.volunteer.latitude, mapData.volunteer.longitude);

  // Volunteer -> Donor distance
  const distanceToPickupKm = hasVolunteer && hasPickup
    ? calculateHaversineDistance(
        mapData.volunteer!.latitude,
        mapData.volunteer!.longitude,
        mapData.pickup.latitude,
        mapData.pickup.longitude
      )
    : null;

  // Donor / Volunteer -> NGO distance
  const distanceToNgoKm = hasDest
    ? hasVolunteer && (mapData.status === 'IN_TRANSIT' || mapData.status === 'PICKED_UP')
      ? calculateHaversineDistance(
          mapData.volunteer!.latitude,
          mapData.volunteer!.longitude,
          mapData.destination.latitude,
          mapData.destination.longitude
        )
      : hasPickup
      ? calculateHaversineDistance(
          mapData.pickup.latitude,
          mapData.pickup.longitude,
          mapData.destination.latitude,
          mapData.destination.longitude
        )
      : null
    : null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
      {/* Offline / Map Unavailable Fallback Notice */}
      {isMapUnavailable && (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start space-x-3">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold">Map Tile Service Offline / Network Unavailable</h4>
            <p className="text-[11px] text-amber-800 mt-0.5">
              Interactive map rendering is temporarily unavailable, but full pickup, destination, and distance logistics remain operational below.
            </p>
          </div>
        </div>
      )}

      {/* Header Info */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center space-x-2">
          <Navigation className="w-4 h-4 text-emerald-600" />
          <h3 className="text-sm font-black text-slate-900 tracking-tight">Delivery Location Breakdown</h3>
        </div>
        <Badge variant={getStatusBadgeVariant()} size="sm">
          {mapData.status.replace(/_/g, ' ')}
        </Badge>
      </div>

      {/* Logistics Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Donor Pickup Point */}
        <div className="p-3.5 rounded-xl border border-slate-200 bg-emerald-50/40 space-y-1.5">
          <div className="flex items-center space-x-2 text-xs font-bold text-emerald-950">
            <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-black">
              P
            </span>
            <span>Pickup Point (Donor)</span>
          </div>
          <p className="text-xs font-bold text-slate-900">{mapData.donorName}</p>
          <p className="text-[11px] text-slate-600 line-clamp-2 leading-snug">{mapData.pickup.address || 'Address on file'}</p>
          <p className="text-[10px] font-mono text-slate-500 pt-1">
            📍 {mapData.pickup.latitude.toFixed(4)}, {mapData.pickup.longitude.toFixed(4)}
          </p>
        </div>

        {/* NGO Destination Point */}
        <div className="p-3.5 rounded-xl border border-slate-200 bg-blue-50/40 space-y-1.5">
          <div className="flex items-center space-x-2 text-xs font-bold text-blue-950">
            <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-black">
              D
            </span>
            <span>Destination (NGO)</span>
          </div>
          <p className="text-xs font-bold text-slate-900">{mapData.ngoName}</p>
          <p className="text-[11px] text-slate-600 line-clamp-2 leading-snug">{mapData.destination.address || 'Address on file'}</p>
          <p className="text-[10px] font-mono text-slate-500 pt-1">
            📍 {mapData.destination.latitude.toFixed(4)}, {mapData.destination.longitude.toFixed(4)}
          </p>
        </div>

        {/* Volunteer Live Position */}
        <div className="p-3.5 rounded-xl border border-slate-200 bg-amber-50/40 space-y-1.5">
          <div className="flex items-center space-x-2 text-xs font-bold text-amber-950">
            <Truck className="w-4 h-4 text-amber-600" />
            <span>Assigned Volunteer</span>
          </div>
          <p className="text-xs font-bold text-slate-900">{mapData.volunteerName || 'Pending Volunteer Assignment'}</p>
          {mapData.volunteer ? (
            <>
              <p className="text-[11px] text-slate-600 truncate">{mapData.volunteer.address || 'Live Location Active'}</p>
              <p className="text-[10px] font-mono text-slate-500 pt-1">
                📍 {mapData.volunteer.latitude.toFixed(4)}, {mapData.volunteer.longitude.toFixed(4)}
              </p>
            </>
          ) : (
            <p className="text-[11px] text-slate-500 italic">Location available after task acceptance</p>
          )}
        </div>
      </div>

      {/* Segment Distance Breakdown & Travel Time Stats */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs border-t border-slate-100 font-semibold text-slate-700">
        <div className="flex flex-wrap items-center gap-4">
          {distanceToPickupKm !== null && (
            <span className="flex items-center text-slate-900 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              <Navigation className="w-3.5 h-3.5 text-emerald-600 mr-1.5" />
              Distance to Pickup: <strong className="ml-1 text-emerald-700 font-black">{distanceToPickupKm} km</strong>
            </span>
          )}

          {distanceToNgoKm !== null && (
            <span className="flex items-center text-slate-900 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
              <Navigation className="w-3.5 h-3.5 text-blue-600 mr-1.5" />
              Distance to NGO: <strong className="ml-1 text-blue-700 font-black">{distanceToNgoKm} km</strong>
            </span>
          )}

          <span className="flex items-center text-slate-900">
            Direct Route: <strong className="ml-1 text-slate-900 font-black">{mapData.distanceKm} km</strong>
          </span>

          {mapData.estimatedTravelTimeMinutes !== undefined && (
            <span className="flex items-center text-slate-900">
              <Clock className="w-3.5 h-3.5 text-amber-600 mr-1.5" />
              Est. Travel Time: <strong className="ml-1 text-amber-700 font-black">~{mapData.estimatedTravelTimeMinutes} mins</strong>
            </span>
          )}
        </div>

        <div className="flex items-center space-x-1 text-[10px] font-mono text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Haversine Verified</span>
        </div>
      </div>
    </div>
  );
};
