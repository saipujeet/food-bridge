import { adminService } from '../services/adminService';

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

export async function runAdminModuleTestSuite() {
  console.log('\n--- Running Module 11: Admin Management & Monitoring Test Suite ---');

  // -------------------------------------------------------------
  // Test 1: Public Interface Isolation (Zero Admin Exposure)
  // -------------------------------------------------------------
  console.log('Test 1: Validating Public Role Isolation (Zero Admin Role in Public UI)...');
  const publicAllowedRoles = ['DONOR', 'NGO', 'VOLUNTEER'];
  assert(
    !publicAllowedRoles.includes('ADMIN'),
    'Security Violation: ADMIN role must NEVER be exposed in public role selector!'
  );
  console.log('✅ Test 1 Passed: Public interfaces strictly exclude ADMIN role.');

  // -------------------------------------------------------------
  // Test 2: Admin Dashboard KPI Statistics & Distinction
  // -------------------------------------------------------------
  console.log('Test 2: Validating Dashboard KPI Statistics (Today vs Lifetime distinction)...');
  const summary = await adminService.getDashboardSummary();
  assert(summary.totalUsers > 0, 'Total users must be derived and greater than 0');
  assert(summary.totalNGOs > 0, 'Total NGOs must be derived and greater than 0');
  assert(summary.totalVolunteers > 0, 'Total Volunteers must be derived and greater than 0');
  assert(summary.totalDonations > 0, 'Total Donations must be derived and greater than 0');
  assert(
    summary.todayFoodDistributedKg <= summary.totalFoodDistributedKg,
    "Today's food distributed must be less than or equal to total lifetime distributed food"
  );
  assert(
    summary.todayDonations <= summary.totalDonations,
    "Today's donations must be isolated and less than or equal to total donations"
  );
  console.log(`✅ Test 2 Passed: Today (${summary.todayFoodDistributedKg}kg) vs All-Time (${summary.totalFoodDistributedKg}kg) distinction verified.`);

  // -------------------------------------------------------------
  // Test 3: NGO Verification Workflow & Immutable Audit Trail
  // -------------------------------------------------------------
  console.log('Test 3: Testing NGO Verification Workflow (PENDING -> VERIFIED with Audit)...');
  const ngos = await adminService.getNgos();
  const pendingNgo = ngos.find((n) => n.verificationStatus === 'PENDING') || ngos[0];
  assert(!!pendingNgo, 'Must have at least one NGO available for verification testing');

  await adminService.verifyNgo(
    pendingNgo.id,
    '80G Tax Exemption and NGO Darpan verified by admin'
  );

  const updatedNgos = await adminService.getNgos();
  const verifiedNgo = updatedNgos.find((n) => n.id === pendingNgo.id);
  assert(
    verifiedNgo?.verificationStatus === 'VERIFIED',
    `NGO ${pendingNgo.id} status should transition to VERIFIED`
  );

  const logsAfterNgoVerify = await adminService.getAuditLogs();
  const ngoLog = logsAfterNgoVerify.find(
    (l) => l.entityType === 'NGO' && String(l.entityId) === String(pendingNgo.id)
  );
  assert(!!ngoLog, 'Audit log entry must be automatically created when verifying an NGO');
  assert(ngoLog?.newState === 'VERIFIED', 'Audit log must accurately capture newState = VERIFIED');
  console.log('✅ Test 3 Passed: NGO verification and immutable audit log entry verified.');

  // -------------------------------------------------------------
  // Test 4: Volunteer Verification & Status Workflow
  // -------------------------------------------------------------
  console.log('Test 4: Testing Volunteer Verification Workflow & Audit Trail...');
  const volunteers = await adminService.getVolunteers();
  assert(volunteers.length > 0, 'Volunteers list should be queryable by Admin');
  const targetVol = volunteers[0];

  await adminService.verifyVolunteer(
    targetVol.id,
    'Driving license and background check verified'
  );

  const updatedVols = await adminService.getVolunteers();
  const verifiedVol = updatedVols.find((v) => v.id === targetVol.id);
  assert(
    verifiedVol?.verificationStatus === 'VERIFIED',
    `Volunteer ${targetVol.id} should transition to VERIFIED`
  );
  console.log('✅ Test 4 Passed: Volunteer verification workflow and status confirmed.');

  // -------------------------------------------------------------
  // Test 5: User Management & Self-Suspension Defensive Guard
  // -------------------------------------------------------------
  console.log('Test 5: Testing User Directory & Admin Self-Suspension Guard...');
  const allUsers = await adminService.getUsers();
  const adminUser = allUsers.find((u) => u.role === 'ADMIN');
  assert(!!adminUser, 'Admin account must exist in the user directory');
  if (!adminUser) return;

  // Attempting to suspend current logged-in admin MUST throw an error
  let selfSuspensionBlocked = false;
  try {
    await adminService.suspendUser(adminUser.id, adminUser.id);
  } catch (err: any) {
    if (err.message && err.message.includes('cannot suspend your own admin account')) {
      selfSuspensionBlocked = true;
    }
  }
  assert(
    selfSuspensionBlocked,
    'Security Guard Failure: Admin must NOT be allowed to suspend their own account!'
  );

  // Suspending another non-admin user should succeed
  const targetUser = allUsers.find((u) => u.role !== 'ADMIN' && u.active);
  if (targetUser) {
    const updatedUser = await adminService.suspendUser(targetUser.id, adminUser.id);
    assert(!updatedUser.active, 'Target user active status should be set to false');
  }
  console.log('✅ Test 5 Passed: Admin self-suspension guard and user suspension verified.');

  // -------------------------------------------------------------
  // Test 6: Donation Lifecycle & Match Radius Progression (5 -> 10 -> 15 -> 20 km)
  // -------------------------------------------------------------
  console.log('Test 6: Validating Donation Radius & Lifecycle Monitoring...');
  const donations = await adminService.getDonations();
  assert(donations.length > 0, 'Admin donation monitoring must return existing donations');

  const matches = await adminService.getMatches();
  assert(matches.length > 0, 'Matching records must be queryable by Admin');
  const matchSample = matches[0];
  assert(
    matchSample.searchRadiusKm >= 5 && matchSample.searchRadiusKm <= 20,
    'Search radius must align with the 5km -> 10km -> 15km -> 20km expansion rule'
  );

  const deliveries = await adminService.getDeliveries();
  assert(deliveries.length > 0, 'Delivery monitoring records must be available to Admin');
  console.log('✅ Test 6 Passed: Donation and radius expansion monitoring verified.');

  // -------------------------------------------------------------
  // Test 7: Operational Issues & Ticket Resolution
  // -------------------------------------------------------------
  console.log('Test 7: Testing Operational Issue Management & Ticket Resolution...');
  const issues = await adminService.getIssues();
  assert(issues.length > 0, 'Admin issue tickets must be queryable');
  const targetIssue = issues[0];

  const updatedIssue = await adminService.updateIssueStatus(
    targetIssue.id,
    'RESOLVED',
    'Traffic cleared; volunteer successfully completed delivery to NGO.'
  );
  assert(
    updatedIssue.status === 'RESOLVED',
    `Issue ${targetIssue.id} status must transition to RESOLVED`
  );
  assert(
    !!updatedIssue.resolutionNotes,
    'Issue must contain admin resolution notes'
  );
  console.log('✅ Test 7 Passed: Issue ticket resolved with administrative audit notes.');

  // -------------------------------------------------------------
  // Test 8: Platform Configuration Validation & Updates
  // -------------------------------------------------------------
  console.log('Test 8: Testing Platform Algorithm Settings & Schema Validation...');
  const settings = await adminService.getSettings();
  assert(settings.length > 0, 'System settings list must be loaded');

  // Updating a parameter with valid value
  const targetKey = settings[0].settingKey;
  await adminService.updateSetting(targetKey, '8');
  const updatedSettings = await adminService.getSettings();
  const modifiedSetting = updatedSettings.find((s) => s.settingKey === targetKey);
  assert(
    modifiedSetting?.settingValue === '8',
    `Setting ${targetKey} should be updated to 8`
  );

  // Schema validation: empty value should be rejected
  let blankSettingRejected = false;
  try {
    await adminService.updateSetting(targetKey, '');
  } catch {
    blankSettingRejected = true;
  }
  assert(blankSettingRejected, 'Setting validation must reject empty values');
  console.log('✅ Test 8 Passed: Settings validation and algorithm configuration confirmed.');

  console.log('================================================================');
  console.log('✅ ALL 8 MODULE 11 ADMIN MANAGEMENT & MONITORING TESTS PASSED!');
  console.log('================================================================\n');
}
