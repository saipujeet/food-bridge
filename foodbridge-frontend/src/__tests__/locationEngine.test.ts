import { mapService } from '../services/mapService';
import { volunteerService } from '../services/volunteerService';
import { deliveryService } from '../services/deliveryService';
import { isValidCoordinate, calculateHaversineDistance } from '../utils/distanceUtils';
import type { FoodDonation, NGOProfileData, DonationAcceptanceRecord } from '../types';

declare const process: any;

// Mock localStorage polyfill for Node test runner execution
if (typeof globalThis.localStorage === 'undefined') {
  const store: Record<string, string> = {};
  globalThis.localStorage = {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      for (const k in store) delete store[k];
    },
    length: 0,
    key: () => null,
  };
}

export const runLocationEngineTestSuite = async () => {
  console.log('\n--- Running Module 9 Maps, Location & Delivery Tracking Test Suite ---');

  // Clear mock location storage
  localStorage.removeItem('foodbridge_mock_volunteer_location_history');

  // Test 1: Coordinate Validation Rules (-90 <= lat <= 90, -180 <= lon <= 180)
  console.log('Test 1: Validating Geographic Coordinate Bounds...');

  if (!isValidCoordinate(40.7128, -74.0060)) {
    throw new Error('Test 1 Failed: Valid coordinates (40.7128, -74.0060) were rejected!');
  }
  if (!isValidCoordinate(15.505, 80.049)) {
    throw new Error('Test 1 Failed: Valid coordinates (15.505, 80.049) were rejected!');
  }
  if (isValidCoordinate(999, 999)) {
    throw new Error('Test 1 Failed: Invalid coordinates (999, 999) were improperly accepted!');
  }
  if (isValidCoordinate(-95, 100)) {
    throw new Error('Test 1 Failed: Out of bounds latitude (-95) was improperly accepted!');
  }
  if (isValidCoordinate(45, 195)) {
    throw new Error('Test 1 Failed: Out of bounds longitude (195) was improperly accepted!');
  }
  console.log('✅ Test 1 Passed: Coordinate validation rules strictly enforced.');

  // Test 2: Haversine Distance Calculation
  console.log('Test 2: Verifying Haversine Distance Calculation...');
  const distSame = calculateHaversineDistance(15.505, 80.049, 15.505, 80.049);
  if (distSame !== 0) {
    throw new Error(`Test 2 Failed: Distance between identical points should be 0 km, got ${distSame}`);
  }

  // Distance between Ongole (15.505, 80.049) and Guntur (16.306, 80.436) ~ 98 km
  const distCalculated = calculateHaversineDistance(15.505, 80.049, 16.306, 80.436);
  if (distCalculated < 90 || distCalculated > 105) {
    throw new Error(`Test 2 Failed: Haversine distance calculation out of expected range: ${distCalculated} km`);
  }
  console.log(`✅ Test 2 Passed: Calculated non-hardcoded Haversine distance = ${distCalculated} km.`);

  // Test 3: Security-Scoped Volunteer Location Update
  console.log('Test 3: Testing Volunteer Live Location Updates & Security Scoping...');
  await volunteerService.getVolunteerProfile();
  const updatedVol = await volunteerService.updateLocation(15.520, 80.060);

  if (updatedVol.latitude !== 15.520 || updatedVol.longitude !== 80.060) {
    throw new Error('Test 3 Failed: Volunteer coordinates were not updated in profile.');
  }

  let updateError = '';
  try {
    // Attempting to update another volunteer's location without authorization
    await volunteerService.updateLocation(15.999, 80.999, 'vol_unauthorized_999');
  } catch (err: unknown) {
    updateError = (err as Error).message || '';
  }

  if (!updateError.includes('FORBIDDEN') && !updateError.includes('cannot update')) {
    throw new Error(`Test 3 Failed: Expected security restriction when updating another volunteer's location, got: ${updateError}`);
  }
  console.log('✅ Test 3 Passed: Security scoping enforced on volunteer location updates.');

  // Test 4: Map Payload Generation & Status-Aware Filtering
  console.log('Test 4: Testing Map Payload Generation & Location Breakdown...');

  const sampleDonation: FoodDonation = {
    id: 'don_mod9_test_001',
    donorId: 'donor_mod9_01',
    donorName: 'Metropolis Central Kitchen',
    donorCity: 'Metropolis',
    donorPhone: '+1 (555) 777-8888',
    donorAddress: '100 Main St, Metropolis',
    latitude: 15.500,
    longitude: 80.040,
    foodName: 'Fresh Packaged Meals',
    foodCategory: 'Cooked Meals',
    foodType: 'Vegetarian',
    quantity: 30,
    unit: 'meals',
    preparationDate: '2026-10-01',
    preparationTime: '10:00',
    availableFrom: new Date().toISOString(),
    availableUntil: new Date(Date.now() + 86400000).toISOString(),
    status: 'ACCEPTED',
    createdAt: new Date().toISOString(),
  };

  const sampleNGO: NGOProfileData = {
    id: 'ngo_mod9_test_001',
    organizationName: 'Care Foundation Shelter',
    registrationNumber: 'NGO-REG-12345',
    address: '50 NGO Lane, Sector 3',
    city: 'Metropolis',
    latitude: 15.510,
    longitude: 80.050,
    maxCapacity: 500,
    currentCapacity: 100,
    capacityUnit: 'meals',
    acceptedCategories: ['Cooked Meals'],
    acceptedFoodTypes: ['Vegetarian'],
    isCurrentlyAvailable: true,
    operatingSchedule: [],
    contactPerson: 'Sarah Jenkins',
    phone: '+1 (555) 999-0000',
    email: 'contact@carefoundation.org',
    verificationStatus: 'VERIFIED',
  };

  const sampleAcceptance: DonationAcceptanceRecord = {
    id: 'acc_mod9_test_001',
    donationId: sampleDonation.id,
    ngoId: sampleNGO.id,
    matchId: 'match_mod9_001',
    organizationName: sampleNGO.organizationName,
    contactPerson: sampleNGO.contactPerson,
    phone: sampleNGO.phone,
    email: sampleNGO.email,
    acceptedQuantity: 30,
    capacityUnit: 'meals',
    foodName: sampleDonation.foodName,
    acceptedAt: new Date().toISOString(),
    status: 'CONFIRMED',
    createdAt: new Date().toISOString(),
  };

  // Create delivery task for map testing
  const deliveryTask = await deliveryService.createDeliveryTaskForAcceptedDonation(
    sampleDonation,
    sampleNGO,
    sampleAcceptance
  );

  const mapData = await mapService.getDeliveryMapData(deliveryTask.id, 'donor_mod9_01', 'DONOR');

  if (!mapData.pickup || mapData.pickup.latitude !== 15.500 || mapData.pickup.longitude !== 80.040) {
    throw new Error('Test 4 Failed: Pickup coordinates mismatch in map payload.');
  }
  if (!mapData.destination || mapData.destination.latitude !== 15.510 || mapData.destination.longitude !== 80.050) {
    throw new Error('Test 4 Failed: NGO destination coordinates mismatch in map payload.');
  }
  if (mapData.distanceKm <= 0) {
    throw new Error('Test 4 Failed: Distance calculation must be greater than 0.');
  }
  console.log(`✅ Test 4 Passed: Map payload generated cleanly with distance = ${mapData.distanceKm} km.`);

  // Test 5: Location Privacy Authorization Check (Unrelated User Blocked)
  console.log('Test 5: Testing Location Privacy & Authorization Checks...');
  let authError = '';
  try {
    await mapService.getDeliveryMapData(deliveryTask.id, 'unauthorized_user_999', 'DONOR');
  } catch (err: unknown) {
    authError = (err as Error).message || '';
  }

  if (!authError.includes('FORBIDDEN') && !authError.includes('do not have permission')) {
    throw new Error(`Test 5 Failed: Expected FORBIDDEN access block for unrelated user, got: ${authError}`);
  }
  console.log('✅ Test 5 Passed: Unauthorized users blocked from accessing private delivery location map.');

  console.log('✅ ALL MODULE 9 MAPS, LOCATION & DELIVERY TRACKING TEST CASES PASSED SUCCESSFULLY!\n');
};
