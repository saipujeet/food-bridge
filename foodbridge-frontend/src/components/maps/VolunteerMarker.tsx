import L from 'leaflet';
import { createLocationPopupHtml } from './LocationPopup';

export interface VolunteerMarkerOptions {
  latitude: number;
  longitude: number;
  volunteerName?: string;
  subtitle?: string;
  statusInfo?: string;
  lastUpdated?: string;
  isLive?: boolean;
}

export const createVolunteerDivIcon = (isLive: boolean = true): L.DivIcon => {
  const ringColor = isLive ? 'ring-amber-300' : 'ring-emerald-400';
  const bgColor = isLive ? 'bg-amber-500' : 'bg-emerald-600';

  const html = `
    <div class="relative group cursor-pointer">
      <div class="w-10 h-10 rounded-2xl ${bgColor} ring-4 ${ringColor} text-white flex items-center justify-center text-lg shadow-lg transform transition-transform duration-300 group-hover:scale-110">
        <span>🛵</span>
      </div>
      ${isLive ? '<span class="absolute -top-1 -right-1 flex h-3.5 w-3.5"><span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span class="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white"></span></span>' : ''}
      <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-slate-900 rotate-45"></div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-volunteer-marker-icon',
    iconSize: [40, 40],
    iconAnchor: [20, 42],
    popupAnchor: [0, -40],
  });
};

export const createVolunteerMarker = ({
  latitude,
  longitude,
  volunteerName = 'Assigned Volunteer',
  subtitle,
  statusInfo = 'IN TRANSIT',
  lastUpdated,
  isLive = true,
}: VolunteerMarkerOptions): L.Marker => {
  const icon = createVolunteerDivIcon(isLive);
  const marker = L.marker([latitude, longitude], { icon });

  const popupContent = createLocationPopupHtml({
    title: 'Volunteer',
    type: 'VOLUNTEER',
    subtitle: subtitle || volunteerName,
    address: `Position: (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`,
    statusInfo,
    lastUpdated,
    isLive,
  });

  marker.bindPopup(popupContent);
  return marker;
};
