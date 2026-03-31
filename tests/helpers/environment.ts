import { beforeEach, afterEach } from 'node:test';

class MemoryStorage {
  #data = new Map();

  clear() {
    this.#data.clear();
  }

  getItem(key) {
    return this.#data.has(key) ? this.#data.get(key) : null;
  }

  setItem(key, value) {
    this.#data.set(String(key), String(value));
  }

  removeItem(key) {
    this.#data.delete(String(key));
  }
}

const localStorage = new MemoryStorage();
const originalDate = globalThis.Date;
const originalCrypto = globalThis.crypto;
const originalNavigator = globalThis.navigator;
const originalCaches = globalThis.caches;
const fixedNow = originalDate.parse('2026-03-31T10:00:00+02:00');

class MockDate extends originalDate {
  constructor(...args) {
    super(args.length === 0 ? fixedNow : args[0], ...(args.length > 1 ? args.slice(1) : []));
  }

  static now() {
    return fixedNow;
  }

  static parse(value) {
    return originalDate.parse(value);
  }

  static UTC(...args) {
    return originalDate.UTC(...args);
  }
}

const importMetaEnv = {
  BASE_URL: '/',
  DEV: false,
  PROD: true,
  MODE: 'test',
  VITE_FIREBASE_API_KEY: '',
  VITE_FIREBASE_AUTH_DOMAIN: '',
  VITE_FIREBASE_PROJECT_ID: '',
  VITE_FIREBASE_APP_ID: '',
  VITE_FIREBASE_MESSAGING_SENDER_ID: '',
  VITE_FIREBASE_STORAGE_BUCKET: '',
};

Object.defineProperty(globalThis, '__IMPORT_META_ENV__', {
  value: importMetaEnv,
  configurable: true,
  writable: true,
});

if (!globalThis.window) {
  globalThis.window = { localStorage, location: new URL('https://example.com/app/') };
} else {
  globalThis.window.localStorage = localStorage;
  globalThis.window.location = new URL('https://example.com/app/');
}

if (!globalThis.navigator) {
  Object.defineProperty(globalThis, 'navigator', { value: {}, configurable: true, writable: true });
}

if (!globalThis.caches) {
  Object.defineProperty(globalThis, 'caches', {
    value: {
      keys: async () => [],
      delete: async () => true,
    },
    configurable: true,
    writable: true,
  });
}
window.caches = globalThis.caches;

beforeEach(() => {
  localStorage.clear();
  Object.defineProperty(globalThis, 'Date', { value: MockDate, configurable: true, writable: true });
  Object.defineProperty(globalThis, 'crypto', {
    value: {
      ...originalCrypto,
      randomUUID: () => 'generated-id',
    },
    configurable: true,
  });
  window.caches = globalThis.caches;
});

afterEach(() => {
  localStorage.clear();
  Object.defineProperty(globalThis, 'Date', { value: originalDate, configurable: true, writable: true });
  Object.defineProperty(globalThis, 'crypto', { value: originalCrypto, configurable: true });
  Object.defineProperty(globalThis, 'navigator', { value: originalNavigator, configurable: true, writable: true });
  Object.defineProperty(globalThis, 'caches', { value: originalCaches, configurable: true, writable: true });
  window.caches = globalThis.caches;
});

export { localStorage };
