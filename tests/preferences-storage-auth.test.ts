import './helpers/environment.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import { LocalStorageEngine } from '@/kernel/storage/local-storage-engine';
import { STORAGE_KEYS } from '@/kernel/storage/storage-keys';
import { usePreferencesStore } from '@/kernel/preferences/preferences-store';
import { disposeThemeRuntime } from '@/kernel/preferences/theme-runtime';
import { hasRequiredFirebaseEnv } from '@/kernel/auth/auth-config';

function resetPreferencesStore() {
  usePreferencesStore.setState({
    themeMode: 'system',
    colorTheme: 'sky',
    textSize: 'base',
    readingDensity: 'comfortable',
    lineSpacing: 'relaxed',
    motionMode: 'full',
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

function createMatchMediaController(initialMatches: boolean) {
  let matches = initialMatches;
  const listeners = new Set<(event: { matches: boolean; media: string }) => void>();

  return {
    matchMedia(query: string) {
      return {
        get matches() {
          return matches;
        },
        media: query,
        onchange: null,
        addListener(listener: (event: { matches: boolean; media: string }) => void) {
          listeners.add(listener);
        },
        removeListener(listener: (event: { matches: boolean; media: string }) => void) {
          listeners.delete(listener);
        },
        addEventListener(_event: 'change', listener: (event: { matches: boolean; media: string }) => void) {
          listeners.add(listener);
        },
        removeEventListener(_event: 'change', listener: (event: { matches: boolean; media: string }) => void) {
          listeners.delete(listener);
        },
        dispatchEvent() { return false; },
      };
    },
    setMatches(nextMatches: boolean) {
      matches = nextMatches;
      for (const listener of listeners) listener({ matches, media: '(prefers-color-scheme: dark)' });
    },
    listenerCount() {
      return listeners.size;
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

test('preferences store normalizes invalid persisted values and keeps system theme live', () => {
  resetPreferencesStore();
  disposeThemeRuntime();
  const originalDocument = globalThis.document;
  const originalMatchMedia = window.matchMedia;
  const classList = createClassList();
  const media = createMatchMediaController(true);
  const dataset: Record<string, string> = {};

  Object.defineProperty(globalThis, 'document', {
    configurable: true,
    value: {
      documentElement: { classList, dataset },
    },
  });

  window.localStorage.setItem(
    STORAGE_KEYS.preferences,
    JSON.stringify({
      themeMode: 'invalid-theme',
      colorTheme: 'unknown-theme',
      textSize: 'xxl',
      readingDensity: 'dense',
      lineSpacing: 'tiny',
      motionMode: 'chaotic',
    }),
  );
  window.matchMedia = media.matchMedia;

  usePreferencesStore.getState().initialize();
  assert.equal(usePreferencesStore.getState().themeMode, 'system');
  assert.equal(usePreferencesStore.getState().colorTheme, 'sky');
  assert.equal(usePreferencesStore.getState().textSize, 'base');
  assert.equal(usePreferencesStore.getState().readingDensity, 'comfortable');
  assert.equal(usePreferencesStore.getState().lineSpacing, 'relaxed');
  assert.equal(usePreferencesStore.getState().motionMode, 'full');
  assert.equal(classList.contains('dark'), true);
  assert.equal(media.listenerCount(), 1);
  assert.deepEqual(dataset, {
    uiTheme: 'sky',
    textSize: 'base',
    readingDensity: 'comfortable',
    lineSpacing: 'relaxed',
    motion: 'full',
  });

  media.setMatches(false);
  assert.equal(classList.contains('dark'), false);

  usePreferencesStore.getState().setThemeMode('light');
  usePreferencesStore.getState().setColorTheme('sand');
  usePreferencesStore.getState().setTextSize('xlarge');
  usePreferencesStore.getState().setReadingDensity('compact');
  usePreferencesStore.getState().setLineSpacing('spacious');
  usePreferencesStore.getState().setMotionMode('reduced');

  assert.equal(usePreferencesStore.getState().themeMode, 'light');
  assert.equal(usePreferencesStore.getState().colorTheme, 'sand');
  assert.equal(usePreferencesStore.getState().textSize, 'xlarge');
  assert.equal(usePreferencesStore.getState().readingDensity, 'compact');
  assert.equal(usePreferencesStore.getState().lineSpacing, 'spacious');
  assert.equal(usePreferencesStore.getState().motionMode, 'reduced');
  assert.equal(classList.contains('dark'), false);
  assert.equal(media.listenerCount(), 0);
  assert.deepEqual(dataset, {
    uiTheme: 'sand',
    textSize: 'xlarge',
    readingDensity: 'compact',
    lineSpacing: 'spacious',
    motion: 'reduced',
  });

  disposeThemeRuntime();
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
