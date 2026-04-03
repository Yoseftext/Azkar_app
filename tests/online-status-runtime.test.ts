import './helpers/environment.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import { createOnlineStatusTransitionGuard, readNavigatorOnlineStatus } from '@/shared/runtime/online-status-runtime';

test('readNavigatorOnlineStatus defaults to true when navigator is missing or incomplete', () => {
  const originalNavigator = globalThis.navigator;

  Object.defineProperty(globalThis, 'navigator', { value: undefined, configurable: true, writable: true });
  assert.equal(readNavigatorOnlineStatus(), true);

  Object.defineProperty(globalThis, 'navigator', { value: {}, configurable: true, writable: true });
  assert.equal(readNavigatorOnlineStatus(), true);

  Object.defineProperty(globalThis, 'navigator', { value: originalNavigator, configurable: true, writable: true });
});

test('online status transition guard only fires on real state transitions', () => {
  const calls: string[] = [];
  const guard = createOnlineStatusTransitionGuard(
    () => calls.push('online'),
    () => calls.push('offline'),
    true,
  );

  guard.handleOnline();
  guard.handleOffline();
  guard.handleOffline();
  guard.handleOnline();
  guard.handleOnline();

  assert.deepEqual(calls, ['offline', 'online']);
  assert.equal(guard.getCurrentState(), 'online');
});
