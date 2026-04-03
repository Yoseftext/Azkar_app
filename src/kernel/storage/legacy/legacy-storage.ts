import { getBrowserStorage } from '@/kernel/storage/local-storage-engine';

export const MIGRATION_DONE_FLAG = 'azkar_migration_v3_done';
export const V2_STORAGE_KEY = 'azkar_data';

export type SafeLegacyStorage = Pick<Storage, 'getItem' | 'setItem'>;

export function getSafeLegacyStorage(): SafeLegacyStorage | null {
  return getBrowserStorage();
}

export function safeParseJson<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function safeGet(storage: SafeLegacyStorage, key: string): string | null {
  try {
    return storage.getItem(key);
  } catch {
    return null;
  }
}

export function safeSet(storage: SafeLegacyStorage, key: string, value: string): void {
  try {
    storage.setItem(key, value);
  } catch {
    // لا نكسر bootstrap بسبب storage failures.
  }
}
