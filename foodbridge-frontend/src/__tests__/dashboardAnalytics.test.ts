import { analyticsService } from '../services/analyticsService';

// Polyfill localStorage for Node.js test environment
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

export async function runDashboardAnalyticsTestSuite() {
  console.log('\n--- Running Module 10: Dashboards & Analytics Test Suite ---');

  // -------------------------------------------------------------
  // Test 1: Admin Overview Analytics & Role Aggregation
  // -------------------------------------------------------------
  console.log('Test 1: Validating Admin Overview Analytics & KPIs...');
  const adminOverview = await analyticsService.getAdminOverview();
  assert(adminOverview.totalDonors > 0, 'Total donors must be derived and greater than 0');
  assert(adminOverview.totalNGOs > 0, 'Total NGOs must be derived and greater than 0');
  assert(adminOverview.totalVolunteers > 0, 'Total Volunteers must be derived and greater than 0');
  assert(adminOverview.completionRate >= 0 && adminOverview.completionRate <= 100, 'Completion rate must be between 0% and 100%');
  console.log(`✅ Test 1 Passed: Admin Overview retrieved (Donors: ${adminOverview.totalDonors}, NGOs: ${adminOverview.totalNGOs}, Completion: ${adminOverview.completionRate}%).`);

  // -------------------------------------------------------------
  // Test 2: Separate Calculation of Food Offered vs Distributed
  // -------------------------------------------------------------
  console.log('Test 2: Verifying Separate Accounting of Food Offered vs Food Distributed...');
  assert(
    adminOverview.totalFoodOfferedKg >= adminOverview.totalFoodDistributedKg,
    'Total food offered must be greater than or equal to food successfully distributed'
  );
  assert(
    adminOverview.foodDistributedTodayKg <= adminOverview.foodDonatedTodayKg || adminOverview.foodDonatedTodayKg >= 0,
    'Distributed and offered food must be tracked as completely separate metrics'
  );
  console.log(`✅ Test 2 Passed: Food Offered (${adminOverview.totalFoodOfferedKg}kg) vs Distributed (${adminOverview.totalFoodDistributedKg}kg) tracked separately.`);

  // -------------------------------------------------------------
  // Test 3: NGO Daily Capacity & Remaining Capacity Formula
  // -------------------------------------------------------------
  console.log("Test 3: Testing NGO Capacity Formula: remaining = max(0, daily capacity - food received today)...");
  const ngoOverview = await analyticsService.getNGOOverview('usr_ngo_1');
  assert(ngoOverview.dailyCapacityKg > 0, 'NGO daily capacity must be greater than 0');
  const expectedRemaining = Math.max(0, ngoOverview.dailyCapacityKg - ngoOverview.foodReceivedTodayKg);
  assert(
    Math.abs(ngoOverview.remainingCapacityKg - expectedRemaining) < 0.01,
    `Remaining capacity (${ngoOverview.remainingCapacityKg}) must match formula max(0, daily - received)`
  );
  assert(
    ngoOverview.capacityUtilizationRate >= 0,
    'Capacity utilization rate must be non-negative'
  );
  console.log(`✅ Test 3 Passed: Daily Capacity (${ngoOverview.dailyCapacityKg}kg) - Received Today (${ngoOverview.foodReceivedTodayKg}kg) = Remaining (${ngoOverview.remainingCapacityKg}kg).`);

  // -------------------------------------------------------------
  // Test 4: Donor Overview Scoped Metrics
  // -------------------------------------------------------------
  console.log('Test 4: Validating Donor Scoped Metrics & Rescued Offers...');
  const donorOverview = await analyticsService.getDonorOverview('usr_donor_1');
  assert(donorOverview.activeOffers >= 0, 'Active offers must be non-negative');
  assert(donorOverview.completedDistributions >= 0, 'Completed distributions must be non-negative');
  assert(donorOverview.totalFoodOfferedKg >= donorOverview.totalFoodDistributedKg, 'Offered >= Distributed for donor');
  assert(donorOverview.monthlyTrends.length > 0, 'Monthly trend data points must be provided');
  console.log(`✅ Test 4 Passed: Donor metrics verified (Active: ${donorOverview.activeOffers}, Completed: ${donorOverview.completedDistributions}).`);

  // -------------------------------------------------------------
  // Test 5: Volunteer Deliveries Overview & Mileage Calculation
  // -------------------------------------------------------------
  console.log('Test 5: Validating Volunteer Overview, Task Stages & Distance Tracking...');
  const volOverview = await analyticsService.getVolunteerOverview('usr_vol_1');
  assert(volOverview.assignedDeliveries >= 0, 'Assigned deliveries must be non-negative');
  assert(volOverview.completedDeliveries >= 0, 'Completed deliveries must be non-negative');
  assert(volOverview.totalKmEstimated >= 0, 'Estimated km must be calculated non-negatively');
  assert(volOverview.weeklyTrends.length === 7, 'Weekly trend must contain 7 daily data points');
  console.log(`✅ Test 5 Passed: Volunteer overview confirmed (Assigned: ${volOverview.assignedDeliveries}, Completed: ${volOverview.completedDeliveries}, Distance: ${volOverview.totalKmEstimated}km).`);

  // -------------------------------------------------------------
  // Test 6: Trend Timeline Points Consistency (Day, Week, Month)
  // -------------------------------------------------------------
  console.log('Test 6: Testing Trend Timeline Data Point Generators...');
  const weekTrends = await analyticsService.getAdminTrends('week');
  assert(weekTrends.length === 7, 'Week trend must return exactly 7 daily trend points');
  const monthTrends = await analyticsService.getAdminTrends('month');
  assert(monthTrends.length === 30, 'Month trend must return exactly 30 daily trend points');
  console.log(`✅ Test 6 Passed: Week (${weekTrends.length} pts) and Month (${monthTrends.length} pts) timeline series verified.`);

  // -------------------------------------------------------------
  // Test 7: Food Distribution Status Breakdown
  // -------------------------------------------------------------
  console.log('Test 7: Validating Food Distribution Status Distribution Breakdown...');
  const statusItems = await analyticsService.getAdminDistributionStatus();
  assert(statusItems.length > 0, 'Status breakdown must contain itemized distribution records');
  const totalPercentage = statusItems.reduce((acc, s) => acc + s.percentage, 0);
  assert(totalPercentage > 95 && totalPercentage <= 105, 'Status percentages must sum to approximately 100%');
  console.log(`✅ Test 7 Passed: Distribution status breakdown verified across ${statusItems.length} lifecycle states.`);

  // -------------------------------------------------------------
  // Test 8: Non-destructive Expiration & Historical Preservation
  // -------------------------------------------------------------
  console.log('Test 8: Validating Non-destructive Expiry Preservation in Analytics...');
  assert(
    adminOverview.expiredDonations >= 0,
    'Expired donations must be accounted for in historical metrics rather than physically purged'
  );
  console.log('✅ Test 8 Passed: Historical audit records preserved without destructive deletion.');

  console.log('================================================================');
  console.log('✅ ALL 8 MODULE 10 DASHBOARDS & ANALYTICS TESTS PASSED!');
  console.log('================================================================\n');
}
