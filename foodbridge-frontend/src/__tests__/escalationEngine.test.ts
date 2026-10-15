import {
  evaluateEscalationStopConditions,
  getNextRadiusStage,
  calculateRemainingTimeMinutes,
  calculateNextExpansionTime,
  INITIAL_RADIUS_KM,
  MAX_RADIUS_LIMIT_KM,
} from '../utils/escalationEngine';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`TEST FAILURE: ${message}`);
  }
}

export function runEscalationEngineTestSuite() {
  console.log('--- Running Module 5 Time-Aware Radius Expansion & Escalation Test Suite ---');

  const futureExpiry = new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(); // 3 hours in future
  const pastExpiry = new Date(Date.now() - 30 * 60 * 1000).toISOString(); // 30 mins in past

  // Test 1: Initial Radius Stage Mapping
  assert(INITIAL_RADIUS_KM === 5, 'Test 1 Failed: Initial radius must be 5 km.');
  assert(MAX_RADIUS_LIMIT_KM === 20, 'Test 1 Failed: Max radius limit must be 20 km.');

  // Test 2: Next Radius Stage Progression (5 -> 10 -> 15 -> 20 -> null)
  const stage5 = getNextRadiusStage(5);
  assert(stage5.nextRadius === 10 && stage5.nextStage === 'EXPANDED_10KM', 'Test 2 Failed: 5 km should expand to 10 km.');

  const stage10 = getNextRadiusStage(10);
  assert(stage10.nextRadius === 15 && stage10.nextStage === 'EXPANDED_15KM', 'Test 2 Failed: 10 km should expand to 15 km.');

  const stage15 = getNextRadiusStage(15);
  assert(stage15.nextRadius === 20 && stage15.nextStage === 'EXPANDED_20KM', 'Test 2 Failed: 15 km should expand to 20 km.');

  const stage20 = getNextRadiusStage(20);
  assert(stage20.nextRadius === null, 'Test 2 Failed: 20 km should not expand further.');

  // Test 3: Stop Condition A — NGO Acceptance
  const resAccepted = evaluateEscalationStopConditions('ACCEPTED', futureExpiry, 10);
  assert(resAccepted.shouldStop === true, 'Test 3 Failed: Acceptance must stop expansion.');
  assert(resAccepted.nextStatus === 'ACCEPTED', 'Test 3 Failed: Status should be ACCEPTED.');

  // Test 4: Stop Condition B — Donation Expiration
  const resExpired = evaluateEscalationStopConditions('AVAILABLE', pastExpiry, 10);
  assert(resExpired.shouldStop === true, 'Test 4 Failed: Expired donation must stop expansion.');
  assert(resExpired.nextStatus === 'EXPIRED', 'Test 4 Failed: Status should be EXPIRED.');

  // Test 5: Stop Condition C — Max Radius Limit (20 km)
  const resMaxRadius = evaluateEscalationStopConditions('AVAILABLE', futureExpiry, 20);
  assert(resMaxRadius.shouldStop === true, 'Test 5 Failed: 20 km max radius must stop further expansion.');
  assert(resMaxRadius.nextStatus === 'MAX_RADIUS_REACHED', 'Test 5 Failed: Status should be MAX_RADIUS_REACHED.');

  // Test 6: Remaining Time Calculation
  const remTime = calculateRemainingTimeMinutes(futureExpiry);
  assert(remTime > 170 && remTime <= 180, 'Test 6 Failed: Remaining time calculation incorrect.');

  // Test 7: Time-Aware Escalation Delay Calculation
  const now = new Date();
  const nextExpTime = calculateNextExpansionTime(now, 20, 15); // remaining 20 mins < 30 mins => 5 min delay
  const delayMs = nextExpTime.getTime() - now.getTime();
  assert(delayMs === 5 * 60 * 1000, 'Test 7 Failed: Time-aware delay for urgent donation should be 5 mins.');

  console.log('✅ ALL 7 MODULE 5 ESCALATION ENGINE TEST CASES PASSED SUCCESSFULLY!');
}
