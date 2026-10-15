import L from 'leaflet';
import type { DeliveryStatus, LocationPoint } from '../../types';

export interface RouteLineOptions {
  status: DeliveryStatus;
  pickup: LocationPoint;
  destination: LocationPoint;
  volunteer?: LocationPoint | null;
}

export const createRoutePolylines = ({
  status,
  pickup,
  destination,
  volunteer,
}: RouteLineOptions): L.Polyline[] => {
  const polylines: L.Polyline[] = [];

  const pickupPos: [number, number] = [pickup.latitude, pickup.longitude];
  const destPos: [number, number] = [destination.latitude, destination.longitude];
  const volPos: [number, number] | null = volunteer
    ? [volunteer.latitude, volunteer.longitude]
    : null;

  const redColor = '#dc2626'; // Red route line (#dc2626)

  if (status === 'DELIVERED') {
    // Delivery Completed: Solid Red/Emerald Line from Donor to NGO
    const completedPoly = L.polyline([pickupPos, destPos], {
      color: '#059669', // Completed route in solid emerald green
      weight: 5,
      opacity: 0.85,
    });
    polylines.push(completedPoly);
  } else if ((status === 'PICKUP_PENDING' || status === 'ACCEPTED' || status === 'ASSIGNED') && volPos) {
    // Stage 1: Heading to Pickup — Highlight Volunteer -> Donor in RED
    const volToDonorLine = L.polyline([volPos, pickupPos], {
      color: redColor,
      weight: 5,
      dashArray: '8, 8',
      opacity: 0.9,
    });
    // Secondary segment Donor -> NGO
    const donorToNgoLine = L.polyline([pickupPos, destPos], {
      color: '#94a3b8',
      weight: 3,
      dashArray: '4, 4',
      opacity: 0.5,
    });
    polylines.push(volToDonorLine, donorToNgoLine);
  } else if ((status === 'IN_TRANSIT' || status === 'PICKED_UP') && volPos) {
    // Stage 2: Food In Transit — Highlight Volunteer -> NGO in RED
    const volToNgoLine = L.polyline([volPos, destPos], {
      color: redColor,
      weight: 5,
      dashArray: '8, 8',
      opacity: 0.9,
    });
    // Completed segment Donor -> Volunteer
    const donorToVolLine = L.polyline([pickupPos, volPos], {
      color: '#059669',
      weight: 3,
      opacity: 0.6,
    });
    polylines.push(volToNgoLine, donorToVolLine);
  } else {
    // Stage 0: Pending Assignment or default — Highlight Donor -> NGO route in RED
    const donorToNgoLine = L.polyline([pickupPos, destPos], {
      color: redColor,
      weight: 4,
      dashArray: '6, 6',
      opacity: 0.75,
    });
    polylines.push(donorToNgoLine);
  }

  return polylines;
};
