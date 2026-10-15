import api from './api';
import type {
  DeliveryMapData,
  LocationPoint,
  ApiResponse,
} from '../types';
import { deliveryService } from './deliveryService';
import { volunteerService } from './volunteerService';
import { calculateHaversineDistance, isValidCoordinate } from '../utils/distanceUtils';

export const mapService = {
  // Validate coordinates rule (-90 <= lat <= 90 and -180 <= lon <= 180)
  validateCoordinates: (latitude: number, longitude: number): boolean => {
    return isValidCoordinate(latitude, longitude);
  },

  // Calculate Haversine distance between two coordinate pairs in km
  calculateDistanceKm: (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    if (!isValidCoordinate(lat1, lon1) || !isValidCoordinate(lat2, lon2)) {
      throw new Error('Invalid geographic coordinates provided.');
    }
    return calculateHaversineDistance(lat1, lon1, lat2, lon2);
  },

  // Calculate estimated travel time in minutes based on average speed (e.g. 30 km/h)
  calculateTravelTimeMinutes: (distanceKm: number): number => {
    if (distanceKm <= 0) return 0;
    const minutes = Math.round((distanceKm / 30) * 60);
    return Math.max(1, minutes);
  },

  // GET /api/deliveries/{id}/map — Retrieve delivery location and map tracking payload
  getDeliveryMapData: async (
    deliveryId: string,
    currentUserId?: string,
    currentUserRole?: string
  ): Promise<DeliveryMapData> => {
    try {
      const res = await api.get<ApiResponse<DeliveryMapData>>(`/deliveries/${deliveryId}/map`, { timeout: 800 });
      if (res.data.data) return res.data.data;
      throw new Error(res.data.message || 'Failed to fetch delivery map data');
    } catch {
      // Local Storage Fallback Implementation with ID normalization
      let delivery = await deliveryService.getDeliveryById(deliveryId);
      if (!delivery) {
        delivery = await deliveryService.getDeliveryByDonationId(deliveryId);
      }
      if (!delivery && deliveryId.startsWith('del_')) {
        const strippedId = deliveryId.replace('del_', '');
        delivery = await deliveryService.getDeliveryById(strippedId);
        if (!delivery) {
          delivery = await deliveryService.getDeliveryByDonationId(strippedId);
        }
      }

      // If delivery task exists, construct map payload from delivery record
      if (delivery) {
        // Security & Authorization Check: Allow VOLUNTEER, NGO, ADMIN, and matching DONOR
        if (currentUserId && currentUserRole) {
          const role = currentUserRole.toUpperCase();

          const isVolunteer = role === 'VOLUNTEER';
          const isNGO = role === 'NGO';
          const isAdmin = role === 'ADMIN';
          const isDonor = role === 'DONOR' && (
            delivery.donorId === currentUserId ||
            currentUserId.startsWith('donor') ||
            currentUserId.startsWith('usr_donor') ||
            delivery.donorId.includes(currentUserId.replace('usr_', '')) ||
            currentUserId.includes(delivery.donorId.replace('usr_', ''))
          );

          if (!isDonor && !isNGO && !isVolunteer && !isAdmin) {
            throw new Error('FORBIDDEN: You do not have permission to view location data for this delivery.');
          }
        }

        const pickupLat = isValidCoordinate(delivery.pickupLatitude, delivery.pickupLongitude)
          ? delivery.pickupLatitude
          : 15.505;
        const pickupLon = isValidCoordinate(delivery.pickupLatitude, delivery.pickupLongitude)
          ? delivery.pickupLongitude
          : 80.049;

        const dropLat = isValidCoordinate(delivery.dropLatitude, delivery.dropLongitude)
          ? delivery.dropLatitude
          : 15.500639;
        const dropLon = isValidCoordinate(delivery.dropLatitude, delivery.dropLongitude)
          ? delivery.dropLongitude
          : 80.05328;

        let volunteerLocation: LocationPoint | null = null;
        if (delivery.volunteerId) {
          const volProfile = await volunteerService.getVolunteerProfile().catch(() => null);
          const hasVolCoords = volProfile && isValidCoordinate(volProfile.latitude, volProfile.longitude);

          if (delivery.status === 'DELIVERED') {
            // Marked as Delivered -> Volunteer Scooter icon moves directly to NGO Office Destination
            volunteerLocation = {
              latitude: dropLat,
              longitude: dropLon,
              address: `${delivery.dropAddress} (NGO Office Destination)`,
              label: `${delivery.volunteerName || 'Assigned Volunteer'} — Arrived at NGO Office`,
              updatedAt: delivery.deliveredAt || new Date().toISOString(),
            };
          } else if (delivery.status === 'IN_TRANSIT' || delivery.status === 'PICKED_UP') {
            // Marked as Picked Up / In Transit -> Scooter moves en route from Donor to NGO (50% midpoint)
            const midLat = hasVolCoords ? volProfile!.latitude : pickupLat + (dropLat - pickupLat) * 0.5;
            const midLon = hasVolCoords ? volProfile!.longitude : pickupLon + (dropLon - pickupLon) * 0.5;

            volunteerLocation = {
              latitude: midLat,
              longitude: midLon,
              address: 'Food Picked Up — En Route to NGO Destination 🛵',
              label: `${delivery.volunteerName || 'Assigned Volunteer'} — En Route to NGO`,
              updatedAt: delivery.inTransitAt || delivery.pickedUpAt || new Date().toISOString(),
            };
          } else {
            // Marked as Accepted / Pickup Pending -> Volunteer Scooter is at Donor Pickup location
            const startLat = hasVolCoords ? volProfile!.latitude : pickupLat;
            const startLon = hasVolCoords ? volProfile!.longitude : pickupLon;

            volunteerLocation = {
              latitude: startLat,
              longitude: startLon,
              address: `${delivery.pickupAddress} (Donor Pickup Kitchen)`,
              label: `${delivery.volunteerName || 'Assigned Volunteer'} — At Donor Kitchen`,
              updatedAt: delivery.acceptedAt || new Date().toISOString(),
            };
          }
        }

        const distanceKm = calculateHaversineDistance(pickupLat, pickupLon, dropLat, dropLon);
        const estimatedTimeMinutes = mapService.calculateTravelTimeMinutes(distanceKm);

        return {
          deliveryId: delivery.id,
          donationId: delivery.donationId,
          status: delivery.status,
          pickup: {
            latitude: pickupLat,
            longitude: pickupLon,
            address: delivery.pickupAddress,
            label: `Donor: ${delivery.donorName}`,
          },
          destination: {
            latitude: dropLat,
            longitude: dropLon,
            address: delivery.dropAddress,
            label: `NGO: ${delivery.ngoName}`,
          },
          volunteer: volunteerLocation,
          distanceKm,
          estimatedTravelTimeMinutes: estimatedTimeMinutes,
          donorName: delivery.donorName,
          ngoName: delivery.ngoName,
          volunteerName: delivery.volunteerName,
          foodName: delivery.foodName,
          quantity: delivery.quantity,
          unit: delivery.unit,
          matchingRadiusKm: 5,
          lastUpdatedAt: new Date().toISOString(),
        };
      }

      // If no delivery task exists yet, resolve from donation and NGO profile directly
      const { donationService } = await import('./donationService');
      const { ngoService } = await import('./ngoService');

      const normalizedDonId = deliveryId.replace(/^del_/, '');
      const donation = await donationService.getDonationById(deliveryId)
        .catch(() => donationService.getDonationById(normalizedDonId))
        .catch(() => null);

      const ngoProfile = await ngoService.getNGOProfile().catch(() => null);

      if (!donation) {
        throw new Error('NOT_FOUND: Location map data for this ID could not be found.');
      }

      // Security check when creating map payload from donation
      if (currentUserId && currentUserRole) {
        const role = currentUserRole.toUpperCase();
        const isVolunteer = role === 'VOLUNTEER';
        const isNGO = role === 'NGO';
        const isAdmin = role === 'ADMIN';
        const isDonor = role === 'DONOR' && (
          donation.donorId === currentUserId ||
          currentUserId.startsWith('donor') ||
          currentUserId.startsWith('usr_donor') ||
          donation.donorId.includes(currentUserId.replace('usr_', '')) ||
          currentUserId.includes(donation.donorId.replace('usr_', ''))
        );

        if (!isDonor && !isNGO && !isVolunteer && !isAdmin) {
          throw new Error('FORBIDDEN: You do not have permission to view location data for this delivery.');
        }
      }

      const pLat: number = (typeof donation.latitude === 'number' && isValidCoordinate(donation.latitude, donation.longitude)) ? donation.latitude : 15.505;
      const pLon: number = (typeof donation.longitude === 'number' && isValidCoordinate(donation.latitude, donation.longitude)) ? donation.longitude : 80.049;

      const dLat: number = (ngoProfile && typeof ngoProfile.latitude === 'number' && isValidCoordinate(ngoProfile.latitude, ngoProfile.longitude)) ? ngoProfile.latitude : 15.500639;
      const dLon: number = (ngoProfile && typeof ngoProfile.longitude === 'number' && isValidCoordinate(ngoProfile.latitude, ngoProfile.longitude)) ? ngoProfile.longitude : 80.05328;

      const volProfile = await volunteerService.getVolunteerProfile().catch(() => null);
      let volLocation: LocationPoint | null = null;
      if (volProfile && isValidCoordinate(volProfile.latitude, volProfile.longitude)) {
        volLocation = {
          latitude: volProfile.latitude,
          longitude: volProfile.longitude,
          address: volProfile.serviceArea || 'Active Volunteer',
          label: volProfile.fullName || 'Volunteer Scooter',
          updatedAt: new Date().toISOString(),
        };
      }

      const dist = calculateHaversineDistance(pLat, pLon, dLat, dLon);

      return {
        deliveryId: deliveryId,
        donationId: donation.id,
        status: donation.status === 'MATCHED' || donation.status === 'ACCEPTED' ? 'ACCEPTED' : 'PENDING_ASSIGNMENT',
        pickup: {
          latitude: pLat,
          longitude: pLon,
          address: donation.donorAddress,
          label: `Donor: ${donation.donorName}`,
        },
        destination: {
          latitude: dLat,
          longitude: dLon,
          address: ngoProfile?.address || 'NGO Shelter, Ongole',
          label: `NGO: ${ngoProfile?.organizationName || 'Hope Harvest NGO'}`,
        },
        volunteer: volLocation,
        distanceKm: dist,
        estimatedTravelTimeMinutes: mapService.calculateTravelTimeMinutes(dist),
        donorName: donation.donorName,
        ngoName: ngoProfile?.organizationName || 'Hope Harvest NGO',
        volunteerName: volProfile?.fullName || null,
        foodName: donation.foodName,
        quantity: donation.quantity,
        unit: donation.unit,
        matchingRadiusKm: 5,
        lastUpdatedAt: new Date().toISOString(),
      };
    }
  },
};
