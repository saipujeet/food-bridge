import { runMatchingEngineTestSuite } from './matchingEngine.test';
import { runEscalationEngineTestSuite } from './escalationEngine.test';
import { runAcceptanceEngineTestSuite } from './acceptanceEngine.test';
import { runDeliveryTestSuite } from './deliveryEngine.test';
import { runNotificationTestSuite } from './notificationEngine.test';
import { runLocationEngineTestSuite } from './locationEngine.test';
import { runDashboardAnalyticsTestSuite } from './dashboardAnalytics.test';
import { runAdminModuleTestSuite } from './adminModule.test';
import { runAuditHistoryEngineTestSuite } from './auditHistoryEngine.test';

declare const process: any;

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

export async function runAllModuleTestSuites() {
  console.log('================================================================');
  console.log('🚀 FOODBRIDGE FULL SYSTEM COMPREHENSIVE TEST RUNNER (MODULES 4 - 12)');
  console.log('================================================================\n');

  try {
    console.log('🔹 Module 4: Dynamic Matching Engine...');
    runMatchingEngineTestSuite();
    console.log('✅ Module 4 Passed!\n');

    console.log('🔹 Module 5: Time-Aware Radius Expansion & Escalation...');
    runEscalationEngineTestSuite();
    console.log('✅ Module 5 Passed!\n');

    console.log('🔹 Module 6: NGO Acceptance & Concurrency Control...');
    await runAcceptanceEngineTestSuite();
    console.log('✅ Module 6 Passed!\n');

    console.log('🔹 Module 7: Volunteer & Delivery Management...');
    await runDeliveryTestSuite();
    console.log('✅ Module 7 Passed!\n');

    console.log('🔹 Module 8: Notifications & Real-Time Communication Engine...');
    await runNotificationTestSuite();
    console.log('✅ Module 8 Passed!\n');

    console.log('🔹 Module 9: Maps, Location & Delivery Tracking Engine...');
    await runLocationEngineTestSuite();
    console.log('✅ Module 9 Passed!\n');

    console.log('🔹 Module 10: Dashboards & Analytics Engine...');
    await runDashboardAnalyticsTestSuite();
    console.log('✅ Module 10 Passed!\n');

    console.log('🔹 Module 11: Admin Management & Monitoring Engine...');
    await runAdminModuleTestSuite();
    console.log('✅ Module 11 Passed!\n');

    console.log('🔹 Module 12: Audit, History & System Logs Engine...');
    await runAuditHistoryEngineTestSuite();
    console.log('✅ Module 12 Passed!\n');

    console.log('================================================================');
    console.log('🎉 ALL MODULE TEST SUITES (MODULES 4 TO 12) EXECUTED WITH 100% SUCCESS!');
    console.log('================================================================\n');
  } catch (error) {
    console.error('❌ TEST SUITE FAILURE DETECTED:', error);
    process.exit(1);
  }
}

runAllModuleTestSuites();
