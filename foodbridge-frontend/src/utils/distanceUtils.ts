/**
 * Distance utilities for FoodBridge matching engine using the Haversine formula.
 * Calculates precise geographic distance in kilometers between two lat/lng points.
 */

export const EARTH_RADIUS_KM = 6371.0088;

/**
 * Converts degrees to radians.
 */

export function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Validates if latitude and longitude are valid numbers within coordinate bounds.
 */
export function isValidCoordinate(latitude?: number | null, longitude?: number | null): boolean {
  if (latitude === undefined || latitude === null || isNaN(latitude)) return false;
  if (longitude === undefined || longitude === null || isNaN(longitude)) return false;
  if (latitude < -90 || latitude > 90) return false;
  if (longitude < -180 || longitude > 180) return false;
  return true;
}

/**
 * Calculates the great-circle distance between two points on the Earth's surface
 * using the Haversine formula.
 * Returns distance in kilometers rounded to 2 decimal places.
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  if (!isValidCoordinate(lat1, lon1) || !isValidCoordinate(lat2, lon2)) {
    throw new Error('Invalid coordinates provided for distance calculation.');
  }

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const radLat1 = toRadians(lat1);
  const radLat2 = toRadians(lat2);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(radLat1) * Math.cos(radLat2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distanceKm = EARTH_RADIUS_KM * c;
  return Math.round(distanceKm * 100) / 100;
}
