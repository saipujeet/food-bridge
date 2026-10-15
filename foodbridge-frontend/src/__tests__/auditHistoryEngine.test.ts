import { historyService } from '../services/historyService';
import type { User } from '../types';

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
    length: 0,
    key: () => null,
  };
}

export async function runAuditHistoryEngineTestSuite() {
  console.log('\n--- Running Module 12: Audit, History & System Logs Test Suite ---');

  // Test 1: Record Donation Lifecycle Event
  console.log('Test 1: Validating Donation Lifecycle Event Creation...');
  const testCorrId = `corr-test-${Date.now()}`;
  const donEvent = await historyService.recordDonationEvent({
    donationId: 'DON-TEST-101',
    donationCode: 'DON-TEST-101',
    donorId: 'usr_donor_1',
    matchedNgoId: 'usr_ngo_1',
    eventType: 'DONATION_CREATED',
    previousStatus: null,
    newStatus: 'AVAILABLE',
    description: 'Initial creation of 50 kg surplus meal batch',
    correlationId: testCorrId,
  });

  if (!donEvent.id || donEvent.donationCode !== 'DON-TEST-101' || donEvent.newStatus !== 'AVAILABLE') {
    throw new Error('Test 1 Failed: Donation history event creation returned invalid data');
  }
  console.log(`✅ Test 1 Passed: Event created with ID ${donEvent.id} and status ${donEvent.newStatus}`);

  // Test 2: Status Transition Integrity
  console.log('Test 2: Verifying Lifecycle Status Transition Integrity...');
  const acceptEvent = await historyService.recordDonationEvent({
    donationId: 'DON-TEST-101',
    donationCode: 'DON-TEST-101',
    donorId: 'usr_donor_1',
    matchedNgoId: 'usr_ngo_1',
    eventType: 'NGO_ACCEPTED',
    previousStatus: 'AVAILABLE',
    newStatus: 'ACCEPTED',
    description: 'Offer accepted by Hope Harvest Foundation',
    correlationId: testCorrId,
  });

  if (acceptEvent.previousStatus !== 'AVAILABLE' || acceptEvent.newStatus !== 'ACCEPTED') {
    throw new Error('Test 2 Failed: Status transition from AVAILABLE to ACCEPTED was not recorded accurately');
  }
  console.log(`✅ Test 2 Passed: Transition verified: [${acceptEvent.previousStatus}] → [${acceptEvent.newStatus}]`);

  // Test 3: Delivery Milestone Recording
  console.log('Test 3: Validating Volunteer Delivery Milestone Recording...');
  const delMilestone = await historyService.recordDeliveryEvent({
    deliveryId: 'DEL-TEST-501',
    deliveryCode: 'DEL-TEST-501',
    donationId: 'DON-TEST-101',
    donationCode: 'DON-TEST-101',
    volunteerId: 'usr_vol_1',
    ngoId: 'usr_ngo_1',
    eventType: 'PICKUP_COMPLETED',
    previousStatus: 'PICKUP_PENDING',
    newStatus: 'PICKED_UP',
    description: 'Volunteer picked up food consignment from kitchen',
    correlationId: testCorrId,
  });

  if (!delMilestone.id || delMilestone.deliveryCode !== 'DEL-TEST-501' || delMilestone.newStatus !== 'PICKED_UP') {
    throw new Error('Test 3 Failed: Delivery milestone event recording failed');
  }
  console.log(`✅ Test 3 Passed: Delivery milestone [${delMilestone.eventType}] recorded with new status ${delMilestone.newStatus}`);

  // Test 4: Donor Scoping (Data Isolation)
  console.log('Test 4: Verifying Donor Scoping & Data Isolation...');
  const donorUser: User = {
    id: 'usr_donor_1',
    name: 'Chef Marcus',
    email: 'donor@foodbridge.org',
    role: 'DONOR',
    isVerified: true,
    profileCompleted: true,
  };
  localStorage.setItem('foodbridge_user', JSON.stringify(donorUser));

  const donorHistory = await historyService.getDonationHistory();
  const unauthorizedDonorEvents = donorHistory.content.filter(
    (e) => e.donorId && e.donorId !== 'usr_donor_1' && e.actorEmail !== 'donor@foodbridge.org'
  );

  if (unauthorizedDonorEvents.length > 0) {
    throw new Error('Test 4 Failed: Donor was able to see unauthorized donation history events!');
  }
  console.log(`✅ Test 4 Passed: Strict donor isolation confirmed (${donorHistory.content.length} scoped events)`);

  // Test 5: NGO Scoping
  console.log('Test 5: Verifying NGO Scoping for Received Allocations...');
  const ngoUser: User = {
    id: 'usr_ngo_1',
    name: 'Sarah Jenkins',
    email: 'ngo@foodbridge.org',
    role: 'NGO',
    isVerified: true,
    profileCompleted: true,
  };
  localStorage.setItem('foodbridge_user', JSON.stringify(ngoUser));

  const ngoHistory = await historyService.getDonationHistory();
  const unauthorizedNGOEvents = ngoHistory.content.filter(
    (e) => e.matchedNgoId && e.matchedNgoId !== 'usr_ngo_1' && e.actorEmail !== 'ngo@foodbridge.org'
  );

  if (unauthorizedNGOEvents.length > 0) {
    throw new Error('Test 5 Failed: NGO was able to see donations not allocated to their organization!');
  }
  console.log(`✅ Test 5 Passed: NGO scoping verified (${ngoHistory.content.length} matched intake events)`);

  // Test 6: Volunteer Delivery Milestone Scoping
  console.log('Test 6: Verifying Volunteer Delivery Milestone Isolation...');
  const volUser: User = {
    id: 'usr_vol_1',
    name: 'David Miller',
    email: 'volunteer@foodbridge.org',
    role: 'VOLUNTEER',
    isVerified: true,
    profileCompleted: true,
  };
  localStorage.setItem('foodbridge_user', JSON.stringify(volUser));

  const volHistory = await historyService.getDeliveryHistory();
  const unauthorizedVolEvents = volHistory.content.filter(
    (e) => e.volunteerId && e.volunteerId !== 'usr_vol_1' && e.actorEmail !== 'volunteer@foodbridge.org'
  );

  if (unauthorizedVolEvents.length > 0) {
    throw new Error('Test 6 Failed: Volunteer saw tasks assigned to other couriers!');
  }
  console.log(`✅ Test 6 Passed: Volunteer milestone scoping verified (${volHistory.content.length} tasks)`);

  // Test 7: Admin Comprehensive Audit Trail & Filtering
  console.log('Test 7: Validating Admin Audit Trail & Search Filtering...');
  const adminUser: User = {
    id: 'usr_admin_1',
    name: 'System Administrator',
    email: 'admin@foodbridge.org',
    role: 'ADMIN',
    isVerified: true,
    profileCompleted: true,
  };
  localStorage.setItem('foodbridge_user', JSON.stringify(adminUser));

  const auditTrail = await historyService.getAdminAuditTrail({
    entityType: 'NGO',
  });

  if (auditTrail.content.some((a) => a.entityType !== 'NGO')) {
    throw new Error('Test 7 Failed: Audit trail entityType filter did not filter properly');
  }
  console.log(`✅ Test 7 Passed: Administrative audit trail returned ${auditTrail.content.length} filtered entries`);

  // Test 8: Correlation ID Traceability
  console.log('Test 8: Testing Correlation ID Propagation & Audit Trail Linkage...');
  const auditLogsAll = await historyService.getAdminAuditTrail();
  const linkedAudit = auditLogsAll.content.find((a) => a.correlationId === testCorrId);

  if (!linkedAudit) {
    throw new Error('Test 8 Failed: Transactional audit log entry matching correlationId was not found');
  }
  console.log(`✅ Test 8 Passed: Correlation ID ${testCorrId} matched audit entry for [${linkedAudit.action}]`);

  // Test 9: Non-destructive Expiry Preservation
  console.log('Test 9: Verifying Non-destructive Expiry History Preservation...');
  const allDonations = await historyService.getDonationHistory();
  const expiredEvent = allDonations.content.find((e) => e.eventType === 'DONATION_EXPIRED');

  if (!expiredEvent) {
    throw new Error('Test 9 Failed: Expired donation historical audit record was not retained!');
  }
  console.log(`✅ Test 9 Passed: Expired donation record preserved: ${expiredEvent.donationCode} (${expiredEvent.description})`);

  // Test 10: Timeline Ordering Verification (Chronological DESC)
  console.log('Test 10: Verifying Chronological Event Ordering (Newest First)...');
  const donTimeline = await historyService.getDonationTimeline('DON-1003');
  for (let i = 0; i < donTimeline.length - 1; i++) {
    const current = new Date(donTimeline[i].createdAt).getTime();
    const next = new Date(donTimeline[i + 1].createdAt).getTime();
    if (current < next) {
      throw new Error(`Test 10 Failed: Timeline event at index ${i} is older than subsequent event!`);
    }
  }
  console.log(`✅ Test 10 Passed: Timeline sequence correctly ordered timestamp descending (${donTimeline.length} events)`);

  console.log('================================================================');
  console.log('✅ ALL 10 MODULE 12 AUDIT, HISTORY & SYSTEM LOGS TESTS PASSED!');
  console.log('================================================================\n');
}
