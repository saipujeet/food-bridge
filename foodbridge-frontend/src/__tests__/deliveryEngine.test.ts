import { deliveryService } from '../services/deliveryService';
import { volunteerService } from '../services/volunteerService';
import type { FoodDonation, NGOProfileData, DonationAcceptanceRecord, VolunteerProfile } from '../types';

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

export const runDeliveryTestSuite = async () => {
  console.log('\n--- Running Module 7 Volunteer & Delivery Management Test Suite ---');

  // Setup Test Data
  const sampleDonation: FoodDonation = {
    id: 'don_mod7_test_001',
    donorId: 'donor_001',
    donorName: 'Fresh Harvest Restaurant',
    donorCity: 'Ongole',
    donorPhone: '+1 (555) 111-2222',
    donorAddress: '123 Main St, Ongole',
    foodName: 'Hot Meals',
    foodCategory: 'Cooked Meals',
    foodType: 'Vegetarian',
    quantity: 50,
    unit: 'meals',
    preparationDate: '2026-09-21',
    preparationTime: '12:00',
    availableFrom: new Date().toISOString(),
    availableUntil: new Date(Date.now() + 86400000).toISOString(),
    status: 'ACCEPTED',
    createdAt: new Date().toISOString(),
  };

  const sampleNGO: NGOProfileData = {
    id: 'ngo_mod7_test_001',
    organizationName: 'Hope Foundation Relief',
    registrationNumber: 'REG-88219',
    contactPerson: 'David Miller',
    email: 'contact@hopefoundation.org',
    phone: '+1 (555) 999-0000',
    address: '45 Community Lane, Ongole',
    city: 'Ongole',
    latitude: 15.51,
    longitude: 80.05,
    acceptedCategories: ['Cooked Meals'],
    acceptedFoodTypes: ['Vegetarian'],
    maxCapacity: 500,
    currentCapacity: 100,
    capacityUnit: 'meals',
    isCurrentlyAvailable: true,
    operatingSchedule: [],
    verificationStatus: 'VERIFIED',
  };

  const sampleAcceptance: DonationAcceptanceRecord = {
    id: 'acc_mod7_test_001',
    donationId: sampleDonation.id,
    ngoId: sampleNGO.id,
    matchId: 'match_001',
    organizationName: sampleNGO.organizationName,
    contactPerson: sampleNGO.contactPerson,
    phone: sampleNGO.phone,
    email: sampleNGO.email,
    acceptedQuantity: 50,
    capacityUnit: 'meals',
    foodName: sampleDonation.foodName,
    acceptedAt: new Date().toISOString(),
    status: 'CONFIRMED',
    createdAt: new Date().toISOString(),
  };

  // Clear mock storage before test run
  localStorage.clear();

  // Test 1: Volunteer Profile & Availability Management
  console.log('Test 1: Testing Volunteer Profile & Availability Status...');
  const volProfile: VolunteerProfile = await volunteerService.getVolunteerProfile();
  if (!volProfile || volProfile.verificationStatus !== 'VERIFIED') {
    throw new Error('Test 1 Failed: Volunteer profile default verification status is invalid.');
  }
  const updatedAvail = await volunteerService.updateAvailability('AVAILABLE');
  if (updatedAvail.availabilityStatus !== 'AVAILABLE') {
    throw new Error('Test 1 Failed: Availability status update failed.');
  }
  console.log('✅ Test 1 Passed: Volunteer profile & availability status verified.');

  // Test 2: Automatic Delivery Task Creation on NGO Acceptance
  console.log('Test 2: Testing Automatic Delivery Task Creation...');
  const deliveryTask = await deliveryService.createDeliveryTaskForAcceptedDonation(
    sampleDonation,
    sampleNGO,
    sampleAcceptance
  );
  if (!deliveryTask || deliveryTask.status !== 'PENDING_ASSIGNMENT' || deliveryTask.donationId !== sampleDonation.id) {
    throw new Error('Test 2 Failed: Automatic delivery task creation failed.');
  }
  console.log('✅ Test 2 Passed: Delivery task created with status PENDING_ASSIGNMENT.');

  // Test 3: Idempotent Duplicate Delivery Task Prevention
  console.log('Test 3: Testing Duplicate Delivery Task Prevention (ONE ACCEPTED DONATION -> ONE DELIVERY)...');
  const duplicateTask = await deliveryService.createDeliveryTaskForAcceptedDonation(
    sampleDonation,
    sampleNGO,
    sampleAcceptance
  );
  if (duplicateTask.id !== deliveryTask.id) {
    throw new Error('Test 3 Failed: Duplicate delivery task was improperly created.');
  }
  console.log('✅ Test 3 Passed: Duplicate delivery creation safely prevented.');

  // Test 4: Task Discovery for Eligible Volunteers
  console.log('Test 4: Testing Volunteer Task Discovery...');
  const availableTasks = await deliveryService.getAvailableDeliveries();
  if (!availableTasks.some((t) => t.id === deliveryTask.id)) {
    throw new Error('Test 4 Failed: Created delivery task not listed in available deliveries.');
  }
  console.log('✅ Test 4 Passed: Task discovery listed eligible unassigned delivery.');

  // Test 5: Simultaneous Concurrent Acceptance Protection (Mutex & 409 Conflict)
  console.log('Test 5: Testing Concurrent Delivery Task Acceptance...');
  let errorMsg = '';
  try {
    const p1 = deliveryService.acceptDeliveryTask(deliveryTask.id);
    const p2 = deliveryService.acceptDeliveryTask(deliveryTask.id);
    await Promise.all([p1, p2]);
  } catch (err: unknown) {
    errorMsg = (err as Error).message || '';
  }
  if (!errorMsg.includes('CONFLICT') && !errorMsg.includes('already been accepted') && !errorMsg.includes('BUSY')) {
    throw new Error(`Test 5 Failed: Expected 409 Conflict error for concurrent acceptance, got: ${errorMsg}`);
  }
  console.log('✅ Test 5 Passed: Concurrent acceptance handled safely with concurrency lock / BUSY check!');

  // Test 6: Verify Accepted Task & Volunteer BUSY status transition
  console.log('Test 6: Verifying Accepted State & Volunteer BUSY status...');
  const currentTask = await deliveryService.getDeliveryById(deliveryTask.id);
  if (!currentTask || currentTask.status !== 'ACCEPTED' || !currentTask.volunteerId) {
    throw new Error('Test 6 Failed: Delivery task status should be ACCEPTED with volunteer assigned.');
  }
  const currentVol = await volunteerService.getVolunteerProfile();
  if (currentVol.availabilityStatus !== 'BUSY') {
    throw new Error('Test 6 Failed: Volunteer availability status should transition to BUSY.');
  }
  console.log('✅ Test 6 Passed: Task is ACCEPTED and Volunteer is BUSY.');

  // Test 7: Pickup & In-Transit State Transitions
  console.log('Test 7: Testing Pickup and In-Transit Transitions...');
  const pickedUpTask = await deliveryService.confirmPickup(currentTask.id, 'Fresh food collected.');
  if (pickedUpTask.status !== 'PICKED_UP' || !pickedUpTask.pickedUpAt) {
    throw new Error('Test 7 Failed: Pickup confirmation state transition failed.');
  }

  const transitTask = await deliveryService.startDelivery(currentTask.id);
  if (transitTask.status !== 'IN_TRANSIT' || !transitTask.inTransitAt) {
    throw new Error('Test 7 Failed: Start delivery in-transit state transition failed.');
  }
  console.log('✅ Test 7 Passed: Successfully transitioned PICKUP_PENDING -> PICKED_UP -> IN_TRANSIT.');

  // Test 8: Delivery Completion & Final System State
  console.log('Test 8: Testing Delivery Completion & Final System State...');

  // Save sample donation to local storage so completeDelivery can update donation.status
  localStorage.setItem('foodbridge_mock_donations', JSON.stringify([sampleDonation]));

  const completedTask = await deliveryService.completeDelivery(currentTask.id, 'Handed over to NGO kitchen.');
  if (completedTask.status !== 'DELIVERED' || !completedTask.deliveredAt) {
    throw new Error('Test 8 Failed: Completion state transition failed.');
  }

  const finalVol = await volunteerService.getVolunteerProfile();
  if (finalVol.availabilityStatus !== 'AVAILABLE') {
    throw new Error('Test 8 Failed: Volunteer availability status should reset to AVAILABLE upon delivery completion.');
  }

  const rawDonations = localStorage.getItem('foodbridge_mock_donations');
  if (rawDonations) {
    const donationsList: FoodDonation[] = JSON.parse(rawDonations);
    const updatedDonation = donationsList.find((d) => d.id === sampleDonation.id);
    if (!updatedDonation || updatedDonation.status !== 'DELIVERED') {
      throw new Error('Test 8 Failed: Final donation status was not updated to DELIVERED.');
    }
  }

  console.log('✅ Test 8 Passed: Delivery = DELIVERED, Donation = DELIVERED, Volunteer = AVAILABLE!');
  console.log('✅ ALL 8 MODULE 7 VOLUNTEER & DELIVERY MANAGEMENT TEST CASES PASSED SUCCESSFULLY!\n');
};
