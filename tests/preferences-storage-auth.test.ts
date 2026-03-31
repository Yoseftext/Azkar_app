import './helpers/environment.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import { LocalStorageEngine } from '@/kernel/storage/local-storage-engine';
import { STORAGE_KEYS } from '@/kernel/storage/storage-keys';
import { usePreferencesStore } from '@/kernel/preferences/preferences-store';
import { hasRequiredFirebaseEnv } from '@/kernel/auth/auth-config';

function resetPreferencesStore() {
  usePreferencesStore.setState({
    themeMode: 'system',
  });
}

function createClassList() {
  const classes = new Set<string>();
  return {
    toggle(name: string, enabled?: boolean) {
      if (enabled) classes.add(name);
      else classes.delete(name);
    },
    contains(name: string) {
      return classes.has(name);
    },
  };
}

test('LocalStorageEngine tolerates invalid JSON and storage access failures', () => {
  const engine = new LocalStorageEngine();
  const originalLocalStorage = window.localStorage;

  window.localStorage.setItem('broken-json', '{');
  assert.equal(engine.getItem('broken-json'), null);

  const throwingStorage = {
    getItem() {
      throw new Error('blocked');
    },
    setItem() {
      throw new Error('quota');
    },
    removeItem() {
      throw new Error('blocked');
    },
  };

  Object.defineProperty(window, 'localStorage', {
    configurable: true,
    get() {
      return throwingStorage;
    },
  });

  assert.equal(engine.getItem('any-key'), null);
  assert.doesNotThrow(() => engine.setItem('x', { ok: true }));
  assert.doesNotThrow(() => engine.removeItem('x'));

  Object.defineProperty(window, 'localStorage', {
    configurable: true,
    value: originalLocalStorage,
    writable: true,
  });
});

test('preferences store normalizes invalid persisted theme and applies dark/system themes safely', () => {
  resetPreferencesStore();
  const originalDocument = globalThis.document;
  const originalMatchMedia = window.matchMedia;
  const classList = createClassList();

  Object.defineProperty(globalThis, 'document', {
    configurable: true,
    value: {
      documentElement: { classList },
    },
  });

  window.localStorage.setItem(STORAGE_KEYS.preferences, JSON.stringify({ themeMode: 'invalid-theme' }));
  window.matchMedia = () => ({
    matches: true,
    media: '(prefers-color-scheme: dark)',
    onchange: null,
    addListener() {},
    removeListener() {},
    addEventListener() {},
    removeEventListener() {},
    dispatchEvent() { return false; },
  });

  usePreferencesStore.getState().initialize();
  assert.equal(usePreferencesStore.getState().themeMode, 'system');
  assert.equal(classList.contains('dark'), true);

  usePreferencesStore.getState().setThemeMode('light');
  assert.equal(usePreferencesStore.getState().themeMode, 'light');
  assert.equal(classList.contains('dark'), false);

  usePreferencesStore.getState().setThemeMode('dark');
  assert.equal(usePreferencesStore.getState().themeMode, 'dark');
  assert.equal(classList.contains('dark'), true);

  Object.defineProperty(globalThis, 'document', {
    configurable: true,
    value: originalDocument,
    writable: true,
  });
  window.matchMedia = originalMatchMedia;
});

test('hasRequiredFirebaseEnv ignores blank values and accepts trimmed configured env', () => {
  const env = globalThis.__IMPORT_META_ENV__ as Record<string, string>;
  const snapshot = { ...env };

  Object.assign(env, {
    VITE_FIREBASE_API_KEY: '   ',
    VITE_FIREBASE_AUTH_DOMAIN: 'example.firebaseapp.com',
    VITE_FIREBASE_PROJECT_ID: 'project-id',
    VITE_FIREBASE_APP_ID: 'app-id',
  });
  assert.equal(hasRequiredFirebaseEnv(), false);

  Object.assign(env, {
    VITE_FIREBASE_API_KEY: ' key ',
    VITE_FIREBASE_AUTH_DOMAIN: ' example.firebaseapp.com ',
    VITE_FIREBASE_PROJECT_ID: ' project-id ',
    VITE_FIREBASE_APP_ID: ' app-id ',
  });
  assert.equal(hasRequiredFirebaseEnv(), true);

  Object.assign(env, snapshot);
});
