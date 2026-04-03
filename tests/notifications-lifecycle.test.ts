import test from 'node:test';
import assert from 'node:assert/strict';
import { buildCurrentMinute } from '@/features/notifications/runtime/notification-runtime';
import { resetNotificationsStoreForTests, useNotificationsStore } from '@/features/notifications/state/notifications-store';
import { resetNotificationFireRegistryForTests } from '@/features/notifications/runtime/notification-fire-registry';

test.beforeEach(() => {
  resetNotificationsStoreForTests();
  resetNotificationFireRegistryForTests();
});

test.after(() => {
  // @ts-ignore cleanup for node env
  delete globalThis.Notification;
});

test('checkAndFire does not re-fire an already-fired slot when multiple slots share the same minute', () => {
  const firedBodies: string[] = [];

  class NotificationMock {
    static permission: NotificationPermission = 'granted';

    constructor(_title: string, options?: NotificationOptions) {
      firedBodies.push(options?.body ?? '');
    }
  }

  // @ts-ignore test shim
  globalThis.Notification = NotificationMock;

  const minute = buildCurrentMinute();
  useNotificationsStore.setState((state) => ({
    ...state,
    hasPermission: true,
    morning: { ...state.morning, enabled: true, time: minute, message: 'صباح' },
    evening: { ...state.evening, enabled: true, time: minute, message: 'مساء' },
    sleep: { ...state.sleep, enabled: false },
  }));

  useNotificationsStore.getState().checkAndFire();
  useNotificationsStore.getState().checkAndFire();

  assert.deepEqual(firedBodies, ['صباح', 'مساء']);
});
