import './helpers/environment.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isDocumentVisible,
  subscribeFocusAndVisibleResume,
  subscribeOnlineOffline,
} from '@/shared/runtime/browser-lifecycle';

function createEventTargetShim() {
  const listeners = new Map<string, Set<() => void>>();
  return {
    addEventListener(type: string, listener: () => void) {
      const bucket = listeners.get(type) ?? new Set<() => void>();
      bucket.add(listener);
      listeners.set(type, bucket);
    },
    removeEventListener(type: string, listener: () => void) {
      listeners.get(type)?.delete(listener);
    },
    dispatch(type: string) {
      for (const listener of listeners.get(type) ?? []) listener();
    },
    listenerCount(type: string) {
      return listeners.get(type)?.size ?? 0;
    },
  };
}

test('subscribeFocusAndVisibleResume coalesces duplicate resume bursts but still fires on later resumes', async () => {
  const originalWindow = globalThis.window;
  const originalDocument = globalThis.document;
  const windowShim = createEventTargetShim();
  const documentShim = {
    ...createEventTargetShim(),
    hidden: true,
    visibilityState: 'hidden' as 'hidden' | 'visible',
  };
  let calls = 0;

  Object.defineProperty(globalThis, 'window', { value: windowShim, configurable: true, writable: true });
  Object.defineProperty(globalThis, 'document', { value: documentShim, configurable: true, writable: true });

  const unsubscribe = subscribeFocusAndVisibleResume(() => { calls += 1; });

  assert.equal(windowShim.listenerCount('focus'), 1);
  assert.equal(documentShim.listenerCount('visibilitychange'), 1);

  windowShim.dispatch('focus');
  documentShim.hidden = false;
  documentShim.visibilityState = 'visible';
  documentShim.dispatch('visibilitychange');
  assert.equal(calls, 1);

  await new Promise((resolve) => setTimeout(resolve, 170));
  documentShim.dispatch('visibilitychange');
  assert.equal(calls, 2);

  unsubscribe();
  assert.equal(windowShim.listenerCount('focus'), 0);
  assert.equal(documentShim.listenerCount('visibilitychange'), 0);

  Object.defineProperty(globalThis, 'window', { value: originalWindow, configurable: true, writable: true });
  Object.defineProperty(globalThis, 'document', { value: originalDocument, configurable: true, writable: true });
});

test('subscribeOnlineOffline wires browser online/offline listeners with cleanup', () => {
  const originalWindow = globalThis.window;
  const windowShim = createEventTargetShim();
  let onlineCalls = 0;
  let offlineCalls = 0;

  Object.defineProperty(globalThis, 'window', { value: windowShim, configurable: true, writable: true });

  const unsubscribe = subscribeOnlineOffline(() => { onlineCalls += 1; }, () => { offlineCalls += 1; });
  assert.equal(windowShim.listenerCount('online'), 1);
  assert.equal(windowShim.listenerCount('offline'), 1);

  windowShim.dispatch('online');
  windowShim.dispatch('offline');
  assert.equal(onlineCalls, 1);
  assert.equal(offlineCalls, 1);

  unsubscribe();
  assert.equal(windowShim.listenerCount('online'), 0);
  assert.equal(windowShim.listenerCount('offline'), 0);

  Object.defineProperty(globalThis, 'window', { value: originalWindow, configurable: true, writable: true });
});

test('isDocumentVisible safely defaults when document is missing', () => {
  const originalDocument = globalThis.document;
  Object.defineProperty(globalThis, 'document', { value: undefined, configurable: true, writable: true });
  assert.equal(isDocumentVisible(), true);
  Object.defineProperty(globalThis, 'document', { value: originalDocument, configurable: true, writable: true });
});
