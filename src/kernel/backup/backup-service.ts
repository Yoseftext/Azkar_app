import { LocalStorageEngine } from '@/kernel/storage/local-storage-engine';
import { STORAGE_KEYS } from '@/kernel/storage/storage-keys';
import type { AppBackupFile, AppBackupPayload, BackupLogicalKey } from '@/kernel/backup/backup-types';

const storage = new LocalStorageEngine();
const BACKUP_KIND = 'azkar-next-backup';
const BACKUP_VERSION = 1;
const LOGICAL_KEYS = Object.keys(STORAGE_KEYS) as BackupLogicalKey[];

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function createEmptyPayload(): AppBackupPayload {
  return {
    preferences: null,
    tasks: null,
    masbaha: null,
    quran: null,
    azkar: null,
    duas: null,
    stories: null,
    names: null,
    achievements: null,
    notifications: null,
    plans: null,
  };
}

export function buildBackupPayload(): AppBackupPayload {
  const payload = createEmptyPayload();

  for (const logicalKey of LOGICAL_KEYS) {
    payload[logicalKey] = storage.getItem(STORAGE_KEYS[logicalKey]);
  }

  return payload;
}

export function buildBackupFile(): AppBackupFile {
  return {
    kind: BACKUP_KIND,
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    payload: buildBackupPayload(),
  };
}

export function getBackupFileName(exportedAt: string = new Date().toISOString()): string {
  const compactDate = exportedAt.replace(/[:.]/g, '-');
  return `azkar-next-backup-${compactDate}.json`;
}

export function serializeBackupFile(file: AppBackupFile): string {
  return JSON.stringify(file, null, 2);
}

export function parseBackupFile(raw: string): AppBackupFile | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }

  if (!isObjectRecord(parsed)) return null;
  if (parsed.kind !== BACKUP_KIND || parsed.version !== BACKUP_VERSION || typeof parsed.exportedAt !== 'string') {
    return null;
  }
  if (!isObjectRecord(parsed.payload)) return null;

  const payload = createEmptyPayload();
  for (const logicalKey of LOGICAL_KEYS) {
    payload[logicalKey] = logicalKey in parsed.payload ? parsed.payload[logicalKey] ?? null : null;
  }

  return {
    kind: BACKUP_KIND,
    version: BACKUP_VERSION,
    exportedAt: parsed.exportedAt,
    payload,
  };
}

export function applyBackupFile(file: AppBackupFile): void {
  for (const logicalKey of LOGICAL_KEYS) {
    const storageKey = STORAGE_KEYS[logicalKey];
    const value = file.payload[logicalKey];
    if (value == null) {
      storage.removeItem(storageKey);
      continue;
    }
    storage.setItem(storageKey, value);
  }
}

export function getBackupSummary(file: AppBackupFile): { exportedAt: string; includedSections: number } {
  const includedSections = LOGICAL_KEYS.filter((logicalKey) => file.payload[logicalKey] != null).length;
  return { exportedAt: file.exportedAt, includedSections };
}
