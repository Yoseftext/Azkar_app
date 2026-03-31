import type { StorageEngine } from '@/kernel/storage/storage-engine';

type BrowserStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

function getLocalStorage(): BrowserStorage | null {
  if (typeof window === 'undefined') return null;

  try {
    return window.localStorage ?? null;
  } catch {
    return null;
  }
}

export class LocalStorageEngine implements StorageEngine {
  public getItem<T>(key: string): T | null {
    const storage = getLocalStorage();
    if (!storage) return null;

    let rawValue: string | null = null;
    try {
      rawValue = storage.getItem(key);
    } catch {
      return null;
    }

    if (!rawValue) return null;

    try {
      return JSON.parse(rawValue) as T;
    } catch {
      return null;
    }
  }

  public setItem<T>(key: string, value: T): void {
    const storage = getLocalStorage();
    if (!storage) return;

    try {
      storage.setItem(key, JSON.stringify(value));
    } catch {
      // Ignore storage write failures in constrained/private browsing contexts.
    }
  }

  public removeItem(key: string): void {
    const storage = getLocalStorage();
    if (!storage) return;

    try {
      storage.removeItem(key);
    } catch {
      // Ignore storage removal failures in constrained/private browsing contexts.
    }
  }
}
