import L from 'leaflet';
import { createLocationPopupHtml } from './LocationPopup';

export interface NGOMarkerOptions {
  latitude: number;
  longitude: number;
  ngoName: string;
  destinationAddress?: string;
}

export const createNGODivIcon = (): L.DivIcon => {
  const html = `
    <div class="relative group cursor-pointer">
      <div class="w-10 h-10 rounded-2xl bg-blue-600 ring-4 ring-blue-300 text-white flex items-center justify-center text-lg shadow-lg transform transition-transform duration-300 group-hover:scale-110">
        <span>🏛️</span>
      </div>
      <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-slate-900 rotate-45"></div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-ngo-marker-icon',
    iconSize: [40, 40],
    iconAnchor: [20, 42],
    popupAnchor: [0, -40],
  });
};

export const createNGOMarker = ({
  latitude,
  longitude,
  ngoName,
  destinationAddress,
}: NGOMarkerOptions): L.Marker => {
  const icon = createNGODivIcon();
  const marker = L.marker([latitude, longitude], { icon });

  const popupContent = createLocationPopupHtml({
    title: 'NGO Destination',
    type: 'NGO',
    subtitle: ngoName,
    address: destinationAddress,
  });

  marker.bindPopup(popupContent);
  return marker;
};
