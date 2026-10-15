import { acceptanceService } from '../services/acceptanceService';
import { donationService } from '../services/donationService';
import { matchingService } from '../services/matchingService';
import { ngoService } from '../services/ngoService';
import { escalationService } from '../services/escalationService';
import type { FoodDonation, NGOProfileData, DonationMatch } from '../types';

// Browser localStorage Polyfill for Node.js test environment
if (typeof localStorage === 'undefined') {
  const store: Record<string, string> = {};
  (globalThis as any).localStorage = {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, val: string) => {
      store[key] = val;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      Object.keys(store).forEach((k) => delete store[k]);
    },
  };
}

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`TEST FAILURE: ${message}`);
  }
}

export async function runAcceptanceEngineTestSuite() {
  console.log('--- Running Module 6 NGO Acceptance & Concurrency Control Test Suite ---');

  // Test 1: Basic Valid Acceptance
  const donation: FoodDonation = {
    id: 'DON-ACCEPT-101',
    donorId: 'donor_1',
    donorName: 'Metropolis Grand Hotel',
    donorCity: 'Metropolis',
    donorPhone: '555-0199',
    donorAddress: '100 Main St',
    foodName: 'Vegetable Biryani Feast',
    foodCategory: 'Biryani',
    foodType: 'Vegetarian',
    quantity: 50,
    unit: 'meals',
    preparationDate: '2026-09-20',
    preparationTime: '12:00',
    availableFrom: new Date(Date.now() - 3600000).toISOString(),
    availableUntil: new Date(Date.now() + 86400000).toISOString(),
    status: 'AVAILABLE',
    createdAt: new Date().toISOString(),
  };

  const currentNGO: NGOProfileData = await ngoService.getNGOProfile();

  const matchRecord: DonationMatch = {
    id: `match_${donation.id}_${currentNGO.id}_101`,
    donationId: donation.id,
    ngoId: currentNGO.id,
    organizationName: currentNGO.organizationName,
    distanceKm: 2.1,
    availableCapacity: currentNGO.maxCapacity - currentNGO.currentCapacity,
    capacityUnit: currentNGO.capacityUnit,
    maxCapacity: currentNGO.maxCapacity,
    currentCapacity: currentNGO.currentCapacity,
    donationQuantity: donation.quantity,
    donationUnit: donation.unit,
    foodCategory: donation.foodCategory,
    foodType: donation.foodType,
    foodName: donation.foodName,
    donorName: donation.donorName,
    pickupAddress: donation.donorAddress,
    availableUntil: donation.availableUntil,
    matchStatus: 'OFFERED',
    matchedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 4 * 3600 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
  };

  // Seed donation & match in persistent storage
  localStorage.setItem('foodbridge_mock_donations', JSON.stringify([donation]));
  localStorage.setItem('foodbridge_mock_donation_matches', JSON.stringify([matchRecord]));

  // Initialize Module 5 matching state
  await escalationService.startMatchingState(donation.id);

  // Execute Acceptance
  const res = await acceptanceService.acceptDonation(matchRecord.id, 'Test pickup notes');
  assert(res.success === true, 'Test 1 Failed: Acceptance response should be success true.');
  assert(res.status === 'ACCEPTED', 'Test 1 Failed: Donation status should be ACCEPTED.');
  assert(res.acceptanceRecord !== undefined, 'Test 1 Failed: Acceptance record should be created.');

  // Verify updated donation status
  const updatedDonation = await donationService.getDonationById(donation.id);
  assert(updatedDonation?.status === 'ACCEPTED', 'Test 1 Failed: Donation status in storage must be ACCEPTED.');
  assert(updatedDonation?.matchedNgoId === currentNGO.id, 'Test 1 Failed: Matched NGO ID must be set.');

  // Verify Module 5 Matching State stopped
  const mState = await escalationService.getMatchingState(donation.id);
  assert(mState?.status === 'ACCEPTED', 'Test 1 Failed: Module 5 matching state status must be ACCEPTED.');
  assert(mState?.nextExpansionAt === null, 'Test 1 Failed: Module 5 expansion must stop after acceptance.');

  // Test 2: Concurrent Acceptance Test ⭐
  console.log('Testing Scenario: Simultaneous Concurrent Acceptance Requests...');
  const concurrentDonation: FoodDonation = {
    ...donation,
    id: 'DON-CONCURRENT-202',
    status: 'AVAILABLE',
  };

  const matchNGO1: DonationMatch = {
    ...matchRecord,
    id: `match_${concurrentDonation.id}_ngo1`,
    donationId: concurrentDonation.id,
    ngoId: currentNGO.id,
    matchStatus: 'OFFERED',
  };

  localStorage.setItem('foodbridge_mock_donations', JSON.stringify([concurrentDonation]));
  localStorage.setItem('foodbridge_mock_donation_matches', JSON.stringify([matchNGO1]));

  // Trigger two simultaneous acceptances
  const p1 = acceptanceService.acceptDonation(matchNGO1.id);
  const p2 = acceptanceService.acceptDonation(matchNGO1.id);

  const results = await Promise.allSettled([p1, p2]);
  const fulfilledCount = results.filter((r) => r.status === 'fulfilled').length;
  const rejectedCount = results.filter((r) => r.status === 'rejected').length;

  assert(fulfilledCount === 1, 'Test 2 Failed: Exactly ONE concurrent acceptance request must succeed.');
  assert(rejectedCount === 1, 'Test 2 Failed: Exactly ONE concurrent acceptance request must fail (409 Conflict).');

  // Test 3: Duplicate Request by Same NGO
  let duplicateFailed = false;
  try {
    await acceptanceService.acceptDonation(matchNGO1.id);
  } catch (err: unknown) {
    duplicateFailed = true;
    const msg = (err as Error).message;
    assert(msg.includes('CONFLICT') || msg.includes('accepted'), 'Test 3 Failed: Second request should fail with Conflict.');
  }
  assert(duplicateFailed === true, 'Test 3 Failed: Duplicate acceptance request must fail.');

  // Test 4: Rejection Flow
  const rejectionDonation: FoodDonation = {
    ...donation,
    id: 'DON-REJECT-303',
    status: 'AVAILABLE',
  };

  const rejectMatch: DonationMatch = {
    ...matchRecord,
    id: `match_${rejectionDonation.id}_ngo1`,
    donationId: rejectionDonation.id,
    ngoId: currentNGO.id,
    matchStatus: 'OFFERED',
  };

  localStorage.setItem('foodbridge_mock_donations', JSON.stringify([rejectionDonation]));
  localStorage.setItem('foodbridge_mock_donation_matches', JSON.stringify([rejectMatch]));

  const rejRes = await acceptanceService.rejectDonation(rejectMatch.id, 'Capacity temporarily unavailable');
  assert(rejRes.success === true, 'Test 4 Failed: Rejection should succeed.');

  const updatedRejectMatch = await matchingService.getMatchDetails(rejectMatch.id);
  assert(updatedRejectMatch?.matchStatus === 'REJECTED', 'Test 4 Failed: Match status should be REJECTED.');

  // Verify donation itself remains AVAILABLE for other NGOs
  const donationAfterRejection = await donationService.getDonationById(rejectionDonation.id);
  assert(donationAfterRejection?.status === 'AVAILABLE', 'Test 4 Failed: Donation must remain AVAILABLE after single NGO rejection.');

  console.log('✅ ALL 8 MODULE 6 ACCEPTANCE & CONCURRENCY CONTROL TEST CASES PASSED SUCCESSFULLY!');
}
