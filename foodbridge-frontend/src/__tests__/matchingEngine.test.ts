import { evaluateNGOMatch, runMatchingEngine, INITIAL_MATCHING_RADIUS_KM } from '../utils/matchingEngine';
import type { FoodDonation, NGOProfileData, DonationMatch } from '../types';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`TEST FAILURE: ${message}`);
  }
}

export function runMatchingEngineTestSuite() {
  console.log('--- Running Module 4 Dynamic Matching Engine Test Suite ---');

  const baseDonation: FoodDonation = {
    id: 'DON-TEST-1',
    donorId: 'donor_1',
    donorName: 'Grand Hyatt Metro Canteen',
    donorCity: 'Metropolis',
    donorPhone: '555-0100',
    donorAddress: '100 Main St',
    latitude: 40.7128,
    longitude: -74.0060,
    foodName: 'Vegetable Biryani',
    foodCategory: 'Biryani',
    foodType: 'Vegetarian',
    quantity: 100,
    unit: 'meals',
    preparationDate: '2026-09-19',
    preparationTime: '12:00',
    availableFrom: new Date(Date.now() - 3600000).toISOString(),
    availableUntil: new Date(Date.now() + 86400000).toISOString(),
    status: 'AVAILABLE',
    createdAt: new Date().toISOString(),
  };

  const baseNGO: NGOProfileData = {
    id: 'ngo_1',
    organizationName: 'Helping Hands NGO',
    registrationNumber: 'REG-101',
    contactPerson: 'Jane Doe',
    email: 'jane@ngo.org',
    phone: '555-0200',
    address: '105 Main St',
    city: 'Metropolis',
    latitude: 40.7200,
    longitude: -74.0000,
    acceptedCategories: ['Cooked Meals', 'Biryani', 'Rice'],
    acceptedFoodTypes: ['Vegetarian', 'Non-Vegetarian'],
    maxCapacity: 200,
    currentCapacity: 50,
    capacityUnit: 'meals',
    isCurrentlyAvailable: true,
    operatingSchedule: [],
    verificationStatus: 'VERIFIED',
  };

  // Test 1: Positive match
  const res1 = evaluateNGOMatch(baseDonation, baseNGO, INITIAL_MATCHING_RADIUS_KM);
  assert(res1.isEligible === true, 'Test 1 Failed: Should match verified nearby NGO with matching category & capacity.');
  assert(res1.distanceKm !== undefined && res1.distanceKm <= 5, 'Test 1 Failed: Distance should be <= 5km.');

  // Test 2: Unverified NGO
  const unverifiedNGO: NGOProfileData = { ...baseNGO, verificationStatus: 'PENDING' };
  const res2 = evaluateNGOMatch(baseDonation, unverifiedNGO);
  assert(res2.isEligible === false, 'Test 2 Failed: Unverified NGO must not match.');

  // Test 3: Wrong food category
  const wrongCategoryNGO: NGOProfileData = { ...baseNGO, acceptedCategories: ['Bakery', 'Dairy'] };
  const res3 = evaluateNGOMatch(baseDonation, wrongCategoryNGO);
  assert(res3.isEligible === false, 'Test 3 Failed: Mismatched category must not match.');

  // Test 4: Wrong food type
  const wrongTypeNGO: NGOProfileData = { ...baseNGO, acceptedFoodTypes: ['Non-Vegetarian'] };
  const res4 = evaluateNGOMatch(baseDonation, wrongTypeNGO);
  assert(res4.isEligible === false, 'Test 4 Failed: Mismatched food type must not match.');

  // Test 5: Insufficient capacity
  const fullNGO: NGOProfileData = { ...baseNGO, maxCapacity: 200, currentCapacity: 180 };
  const res5 = evaluateNGOMatch(baseDonation, fullNGO);
  assert(res5.isEligible === false, 'Test 5 Failed: NGO with insufficient capacity must not match.');

  // Test 6: Unavailable NGO
  const unavailableNGO: NGOProfileData = { ...baseNGO, isCurrentlyAvailable: false };
  const res6 = evaluateNGOMatch(baseDonation, unavailableNGO);
  assert(res6.isEligible === false, 'Test 6 Failed: Unavailable NGO must not match.');

  // Test 7: Distance > 5km
  const farNGO: NGOProfileData = { ...baseNGO, latitude: 40.8500, longitude: -73.8500 };
  const res7 = evaluateNGOMatch(baseDonation, farNGO, 5);
  assert(res7.isEligible === false, 'Test 7 Failed: NGO outside 5km radius must not match.');

  // Test 8: Expired donation
  const expiredDonation: FoodDonation = { ...baseDonation, availableUntil: '2020-01-01 10:00' };
  const res8 = evaluateNGOMatch(expiredDonation, baseNGO);
  assert(res8.isEligible === false, 'Test 8 Failed: Expired donation must not match.');

  // Test 9: Missing coordinates
  const missingCoordDonation: FoodDonation = { ...baseDonation, latitude: undefined, longitude: undefined };
  const res9 = evaluateNGOMatch(missingCoordDonation, baseNGO);
  assert(res9.isEligible === false, 'Test 9 Failed: Donation with missing location must fail matching.');

  // Test 10: Duplicate match prevention
  const existingMatch: DonationMatch = {
    id: 'match_DON-TEST-1_ngo_1_100',
    donationId: baseDonation.id,
    ngoId: baseNGO.id,
    organizationName: baseNGO.organizationName,
    distanceKm: 1.05,
    availableCapacity: 150,
    capacityUnit: 'meals',
    maxCapacity: 200,
    currentCapacity: 50,
    donationQuantity: 100,
    donationUnit: 'meals',
    foodCategory: 'Biryani',
    foodType: 'Vegetarian',
    foodName: baseDonation.foodName,
    donorName: baseDonation.donorName,
    pickupAddress: baseDonation.donorAddress,
    availableUntil: baseDonation.availableUntil,
    matchStatus: 'OFFERED',
    matchedAt: new Date().toISOString(),
    expiresAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };

  const matches = runMatchingEngine(baseDonation, [baseNGO], [existingMatch], 5);
  assert(matches.length === 1, 'Test 10 Failed: Should not duplicate active match.');
  assert(matches[0].id === existingMatch.id, 'Test 10 Failed: Existing active match must be preserved.');

  console.log('✅ ALL 10 MODULE 4 MATCHING ENGINE TEST CASES PASSED SUCCESSFULLY!');
}
