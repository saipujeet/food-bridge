import L from 'leaflet';
import { createLocationPopupHtml } from './LocationPopup';

export interface DonorMarkerOptions {
  latitude: number;
  longitude: number;
  donorName: string;
  pickupAddress?: string;
  foodName?: string;
  quantity?: number;
  unit?: string;
}

export const createDonorDivIcon = (): L.DivIcon => {
  const html = `
    <div class="relative group cursor-pointer">
      <div class="w-10 h-10 rounded-2xl bg-emerald-600 ring-4 ring-emerald-300 text-white flex items-center justify-center text-lg shadow-lg transform transition-transform duration-300 group-hover:scale-110">
        <span>📦</span>
      </div>
      <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-slate-900 rotate-45"></div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-donor-marker-icon',
    iconSize: [40, 40],
    iconAnchor: [20, 42],
    popupAnchor: [0, -40],
  });
};

export const createDonorMarker = ({
  latitude,
  longitude,
  donorName,
  pickupAddress,
  foodName,
  quantity,
  unit,
}: DonorMarkerOptions): L.Marker => {
  const icon = createDonorDivIcon();
  const marker = L.marker([latitude, longitude], { icon });

  const foodInfo = foodName ? `${foodName}${quantity ? ` (${quantity} ${unit || ''})` : ''}` : undefined;

  const popupContent = createLocationPopupHtml({
    title: 'Donor Pickup',
    type: 'DONOR',
    subtitle: donorName,
    address: pickupAddress,
    foodInfo,
  });

  marker.bindPopup(popupContent);
  return marker;
};
