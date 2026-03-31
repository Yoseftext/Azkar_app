import './helpers/environment.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import { clearLegacyCaches, initializePwaRuntime, unregisterUnexpectedRegistrations } from '@/kernel/pwa/pwa-runtime';

test('pwa cleanup removes only legacy caches', async () => {
  const deleted = [];
  globalThis.caches = {
    keys: async () => ['azkar-v4-static', 'azkar-v5-runtime', 'modern-cache'],
    delete: async (name) => {
      deleted.push(name);
      return true;
    },
  };

  window.caches = globalThis.caches;

  await clearLegacyCaches();
  assert.deepEqual(deleted, ['azkar-v4-static', 'azkar-v5-runtime']);
});

test('pwa cleanup unregisters unexpected service workers and stale registrations', async () => {
  const calls = [];
  const currentUrl = new URL('/sw.js', window.location.origin).href;
  globalThis.navigator.serviceWorker = {
    getRegistrations: async () => [
      { active: { scriptURL: 'https://example.com/legacy-sw.js' }, unregister: async () => calls.push('legacy') },
      { active: { scriptURL: currentUrl }, unregister: async () => calls.push('current') },
      { active: undefined, waiting: { scriptURL: 'https://example.com/waiting-legacy-sw.js' }, unregister: async () => calls.push('waiting-legacy') },
      { active: undefined, unregister: async () => calls.push('empty') },
    ],
  };

  await unregisterUnexpectedRegistrations();
  assert.deepEqual(calls, ['legacy', 'waiting-legacy', 'empty']);
});

test('initializePwaRuntime exits safely when service workers are unavailable', async () => {
  delete globalThis.navigator.serviceWorker;
  await initializePwaRuntime();
  assert.ok(true);
});

test('initializePwaRuntime registers the current worker and asks waiting worker to skip waiting', async () => {
  const registerCalls = [];
  const updateCalls = [];
  const waitingMessages = [];

  const registration = {
    waiting: { postMessage: (message) => waitingMessages.push(message) },
    update: async () => updateCalls.push('update'),
    addEventListener: () => {},
  };

  globalThis.caches = { keys: async () => [], delete: async () => true };
  window.caches = globalThis.caches;
  globalThis.navigator.serviceWorker = {
    controller: undefined,
    getRegistrations: async () => [],
    register: async (scriptUrl) => {
      registerCalls.push(scriptUrl);
      return registration;
    },
  };

  await initializePwaRuntime();

  assert.deepEqual(registerCalls, ['/sw.js']);
  assert.deepEqual(updateCalls, ['update']);
  assert.deepEqual(waitingMessages, [{ action: 'skipWaiting' }]);
});

test('initializePwaRuntime handles updatefound and promotes installed worker when controller exists', async () => {
  const waitingMessages = [];
  let onUpdateFound = null;
  let onStateChange = null;

  const waiting = { postMessage: (message) => waitingMessages.push(message), scriptURL: new URL('/sw.js', window.location.origin).href };
  const installing = {
    state: 'installing',
    scriptURL: new URL('/sw.js', window.location.origin).href,
    addEventListener: (eventName, listener) => {
      if (eventName === 'statechange') onStateChange = listener;
    },
  };

  const registration = {
    waiting,
    installing,
    update: async () => {},
    addEventListener: (eventName, listener) => {
      if (eventName === 'updatefound') onUpdateFound = listener;
    },
  };

  globalThis.caches = { keys: async () => [], delete: async () => true };
  window.caches = globalThis.caches;
  globalThis.navigator.serviceWorker = {
    controller: {},
    getRegistrations: async () => [],
    register: async () => registration,
  };

  await initializePwaRuntime();
  assert.equal(typeof onUpdateFound, 'function');
  onUpdateFound?.();
  assert.equal(typeof onStateChange, 'function');
  installing.state = 'installed';
  onStateChange?.();

  assert.deepEqual(waitingMessages, [{ action: 'skipWaiting' }, { action: 'skipWaiting' }]);
});
