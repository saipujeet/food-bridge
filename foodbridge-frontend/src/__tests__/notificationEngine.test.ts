import { notificationService } from '../services/notificationService';
import { notificationEventBus } from '../utils/notificationEventBus';
import type { NotificationItem, NotificationType, NotificationCategory, NotificationPriority } from '../types';

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

export const runNotificationTestSuite = async () => {
  console.log('\n--- Running Module 8 Notification & Real-Time Communication Test Suite ---');

  // Clear notification mock storage before starting test suite
  localStorage.removeItem('foodbridge_mock_notifications');
  localStorage.removeItem('foodbridge_mock_notification_preferences_user_donor_001');
  localStorage.removeItem('foodbridge_mock_notification_preferences_user_ngo_001');

  const userA = 'user_donor_001';
  const userB = 'user_ngo_001';

  // Test 1: Verify all 16 NotificationType options are supported
  console.log('Test 1: Validating 16 NotificationType Enum Options Creation...');

  const allNotificationTypes: { type: NotificationType; category: NotificationCategory; priority: NotificationPriority }[] = [
    { type: 'DONATION_CREATED', category: 'DONATION', priority: 'NORMAL' },
    { type: 'MATCH_FOUND', category: 'MATCH', priority: 'HIGH' },
    { type: 'MATCH_RADIUS_EXPANDED', category: 'MATCH', priority: 'HIGH' },
    { type: 'DONATION_ACCEPTED', category: 'DONATION', priority: 'HIGH' },
    { type: 'DONATION_REJECTED', category: 'DONATION', priority: 'NORMAL' },
    { type: 'DONATION_EXPIRED', category: 'DONATION', priority: 'NORMAL' },
    { type: 'DONATION_CANCELLED', category: 'DONATION', priority: 'NORMAL' },
    { type: 'VOLUNTEER_ASSIGNED', category: 'DELIVERY', priority: 'HIGH' },
    { type: 'DELIVERY_ACCEPTED', category: 'DELIVERY', priority: 'HIGH' },
    { type: 'PICKUP_PENDING', category: 'DELIVERY', priority: 'NORMAL' },
    { type: 'FOOD_PICKED_UP', category: 'DELIVERY', priority: 'NORMAL' },
    { type: 'DELIVERY_STARTED', category: 'DELIVERY', priority: 'NORMAL' },
    { type: 'DELIVERY_COMPLETED', category: 'DELIVERY', priority: 'HIGH' },
    { type: 'NGO_VERIFICATION', category: 'VERIFICATION', priority: 'URGENT' },
    { type: 'VOLUNTEER_VERIFICATION', category: 'VERIFICATION', priority: 'NORMAL' },
    { type: 'SYSTEM_ALERT', category: 'SYSTEM', priority: 'LOW' },
  ];

  for (const item of allNotificationTypes) {
    const created = await notificationService.createNotification({
      userId: userA,
      title: `Test Title for ${item.type}`,
      message: `Test message body for ${item.type}`,
      type: item.type,
      category: item.category,
      priority: item.priority,
      referenceType: 'DONATION',
      referenceId: 'don_123',
    });

    if (!created.id || created.type !== item.type || created.priority !== item.priority) {
      throw new Error(`Test 1 Failed: Creation failed for notification type ${item.type}`);
    }
  }
  console.log('✅ Test 1 Passed: All 16 NotificationType options created successfully.');

  // Test 2: User Security Scoping
  console.log('Test 2: Verifying User Security Scoping (User Isolation)...');
  await notificationService.createNotification({
    userId: userB,
    title: 'NGO Alert',
    message: 'Message for NGO user B only',
    type: 'MATCH_FOUND',
    category: 'MATCH',
    priority: 'HIGH',
  });

  const userANotifs = await notificationService.getUserNotifications(userA);
  const userBNotifs = await notificationService.getUserNotifications(userB);

  if (userANotifs.some((n) => n.userId !== userA)) {
    throw new Error('Test 2 Failed: User A retrieved notifications belonging to another user!');
  }
  if (userBNotifs.some((n) => n.userId !== userB)) {
    throw new Error('Test 2 Failed: User B retrieved notifications belonging to another user!');
  }
  if (userANotifs.length !== 16 || userBNotifs.length !== 1) {
    throw new Error(`Test 2 Failed: Unexpected notification count for userA (${userANotifs.length}) or userB (${userBNotifs.length}).`);
  }
  console.log('✅ Test 2 Passed: Strict security scoping enforced per userId.');

  // Test 3: Unread Count Calculation & Mark as Read / Mark All as Read
  console.log('Test 3: Testing Unread Count & Mark Read Operations...');
  let unreadA = await notificationService.getUnreadCount(userA);
  if (unreadA !== 16) {
    throw new Error(`Test 3 Failed: Initial unread count should be 16, got ${unreadA}`);
  }

  const targetId = userANotifs[0].id;
  const markedItem = await notificationService.markAsRead(targetId, userA);
  if (!markedItem.isRead || !markedItem.readAt) {
    throw new Error('Test 3 Failed: markAsRead did not set isRead or readAt.');
  }

  unreadA = await notificationService.getUnreadCount(userA);
  if (unreadA !== 15) {
    throw new Error(`Test 3 Failed: Unread count after 1 read should be 15, got ${unreadA}`);
  }

  await notificationService.markAllAsRead(userA);
  unreadA = await notificationService.getUnreadCount(userA);
  if (unreadA !== 0) {
    throw new Error(`Test 3 Failed: Unread count after markAllAsRead should be 0, got ${unreadA}`);
  }
  console.log('✅ Test 3 Passed: Mark as Read and Mark All as Read updated state and unread count.');

  // Test 4: Delete Notification Operation
  console.log('Test 4: Testing Delete Notification Operation...');
  await notificationService.deleteNotification(targetId, userA);
  const afterDeleteNotifs = await notificationService.getUserNotifications(userA);
  if (afterDeleteNotifs.some((n) => n.id === targetId)) {
    throw new Error('Test 4 Failed: Deleted notification still exists in database/storage.');
  }
  if (afterDeleteNotifs.length !== 15) {
    throw new Error(`Test 4 Failed: Expected 15 items after deletion, got ${afterDeleteNotifs.length}`);
  }
  console.log('✅ Test 4 Passed: Delete notification operation verified.');

  // Test 5: Event Bus Pub/Sub Subscription & Emissions
  console.log('Test 5: Testing Event Bus Pub/Sub Bus Subscription & Emissions...');
  let receivedFromBus: NotificationItem | null = null;
  const unsubscribe = notificationEventBus.subscribe((incoming) => {
    receivedFromBus = incoming;
  });

  const busPayload: NotificationItem = {
    id: 'bus_notif_001',
    userId: userA,
    title: 'Urgent Bus Broadcast',
    message: 'Real-time alert pushed via event bus',
    type: 'NGO_VERIFICATION',
    category: 'VERIFICATION',
    priority: 'URGENT',
    isRead: false,
    createdAt: new Date().toISOString(),
  };

  notificationEventBus.emit(busPayload);

  if (!receivedFromBus || (receivedFromBus as NotificationItem).id !== 'bus_notif_001') {
    throw new Error('Test 5 Failed: Event bus subscriber failed to receive broadcast payload.');
  }
  unsubscribe();
  console.log('✅ Test 5 Passed: Event Bus pub/sub emission and subscriber received alert.');

  // Test 6: User Preferences Storage & Fallback
  console.log('Test 6: Testing User Preferences Persistence & Fallback...');
  const initialPrefs = await notificationService.getUserPreferences(userA);
  if (!initialPrefs.emailEnabled || !initialPrefs.categories.DONATION) {
    throw new Error('Test 6 Failed: Default user preferences missing expected properties.');
  }

  const updatedPrefs = {
    ...initialPrefs,
    emailEnabled: false,
    categories: {
      ...initialPrefs.categories,
      MATCH: false,
    },
  };

  await notificationService.saveUserPreferences(userA, updatedPrefs);
  const savedPrefs = await notificationService.getUserPreferences(userA);
  if (savedPrefs.emailEnabled !== false || savedPrefs.categories.MATCH !== false) {
    throw new Error('Test 6 Failed: User preferences persistence failed.');
  }
  console.log('✅ Test 6 Passed: User Preferences saved and retrieved successfully.');

  console.log('✅ ALL MODULE 8 NOTIFICATION ENGINE TEST CASES PASSED SUCCESSFULLY!\n');
};
