import './helpers/environment.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import { buildBackupFile, applyBackupFile, parseBackupFile, serializeBackupFile, getBackupSummary } from '@/kernel/backup/backup-service';
import { STORAGE_KEYS } from '@/kernel/storage/storage-keys';

test('buildBackupFile captures persisted sections from storage', () => {
  window.localStorage.setItem(STORAGE_KEYS.preferences, JSON.stringify({ themeMode: 'dark' }));
  window.localStorage.setItem(STORAGE_KEYS.tasks, JSON.stringify({ dailyCompletions: { '2026-03-31': ['a'] } }));

  const backup = buildBackupFile();
  assert.equal(backup.kind, 'azkar-next-backup');
  assert.equal(backup.version, 1);
  assert.deepEqual(backup.payload.preferences, { themeMode: 'dark' });
  assert.deepEqual(backup.payload.tasks, { dailyCompletions: { '2026-03-31': ['a'] } });
  assert.equal(backup.payload.quran, null);
});

test('serialize and parse backup file preserves known payload keys', () => {
  const original = buildBackupFile();
  const raw = serializeBackupFile(original);
  const parsed = parseBackupFile(raw);

  assert.ok(parsed);
  assert.equal(parsed?.kind, original.kind);
  assert.deepEqual(parsed?.payload, original.payload);
});

test('parseBackupFile rejects invalid manifests', () => {
  assert.equal(parseBackupFile('{"kind":"other","version":1,"exportedAt":"x","payload":{}}'), null);
  assert.equal(parseBackupFile('not-json'), null);
});

test('applyBackupFile restores storage values and removes null sections', () => {
  window.localStorage.setItem(STORAGE_KEYS.quran, JSON.stringify({ bookmark: { surahNumber: 18 } }));

  applyBackupFile({
    kind: 'azkar-next-backup',
    version: 1,
    exportedAt: '2026-03-31T10:00:00.000Z',
    payload: {
      preferences: { themeMode: 'system' },
      tasks: { dailyCompletions: { '2026-03-31': ['x'] } },
      masbaha: null,
      quran: null,
      azkar: null,
      duas: null,
      stories: null,
      names: null,
      achievements: null,
      notifications: null,
      plans: null,
      plans: null,
    },
  });

  assert.equal(window.localStorage.getItem(STORAGE_KEYS.quran), null);
  assert.equal(window.localStorage.getItem(STORAGE_KEYS.preferences), JSON.stringify({ themeMode: 'system' }));
  assert.equal(window.localStorage.getItem(STORAGE_KEYS.tasks), JSON.stringify({ dailyCompletions: { '2026-03-31': ['x'] } }));
});

test('getBackupSummary reports export metadata', () => {
  const summary = getBackupSummary({
    kind: 'azkar-next-backup',
    version: 1,
    exportedAt: '2026-03-31T10:00:00.000Z',
    payload: {
      preferences: {},
      tasks: {},
      masbaha: null,
      quran: null,
      azkar: {},
      duas: null,
      stories: null,
      names: {},
      achievements: null,
      notifications: null,
      plans: null,
    },
  });

  assert.equal(summary.exportedAt, '2026-03-31T10:00:00.000Z');
  assert.equal(summary.includedSections, 4);
});
