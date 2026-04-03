import type { STORAGE_KEYS } from '@/kernel/storage/storage-keys';

export type BackupLogicalKey = keyof typeof STORAGE_KEYS;

export interface AppBackupPayload {
  preferences: unknown | null;
  tasks: unknown | null;
  masbaha: unknown | null;
  quran: unknown | null;
  azkar: unknown | null;
  duas: unknown | null;
  stories: unknown | null;
  names: unknown | null;
  achievements: unknown | null;
  notifications: unknown | null;
  plans: unknown | null;
}

export interface AppBackupFile {
  kind: 'azkar-next-backup';
  version: 1;
  exportedAt: string;
  payload: AppBackupPayload;
}
