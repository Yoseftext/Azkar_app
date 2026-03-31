import './helpers/environment.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  countTrailingActiveDays,
  getDateKeysForTrailingDays,
  getDayIndex,
  getLocalDateKey,
  isDateKeyInCurrentMonth,
  parseDateKey,
  trimRecordToRecentDays,
} from '@/shared/lib/date';

test('getLocalDateKey uses local calendar date without utc drift', () => {
  assert.equal(getLocalDateKey(new Date(2026, 2, 31, 23, 59, 59)), '2026-03-31');
  assert.equal(getLocalDateKey(new Date(2026, 3, 1, 0, 0, 0)), '2026-04-01');
});

test('getDateKeysForTrailingDays returns ascending local keys and handles non-positive input safely', () => {
  assert.deepEqual(getDateKeysForTrailingDays(3, new Date('2026-03-31T10:00:00+02:00')), ['2026-03-29', '2026-03-30', '2026-03-31']);
  assert.deepEqual(getDateKeysForTrailingDays(0, new Date('2026-03-31T10:00:00+02:00')), []);
});

test('parseDateKey rejects impossible calendar dates and month comparisons ignore invalid keys', () => {
  assert.equal(parseDateKey('2026-02-31'), null);
  assert.equal(parseDateKey('not-a-date'), null);
  assert.equal(getLocalDateKey(parseDateKey('2026-03-31') ?? new Date(0)), '2026-03-31');
  assert.equal(isDateKeyInCurrentMonth('2026-03-15', new Date('2026-03-31T10:00:00+02:00')), true);
  assert.equal(isDateKeyInCurrentMonth('2026-04-01', new Date('2026-03-31T10:00:00+02:00')), false);
  assert.equal(isDateKeyInCurrentMonth('2026-02-31', new Date('2026-03-31T10:00:00+02:00')), false);
});

test('trimRecordToRecentDays compares by local date key and drops stale/invalid entries', () => {
  const trimmed = trimRecordToRecentDays({
    invalid: ['bad'],
    '2026-03-24': ['keep-threshold'],
    '2026-03-31': ['keep-today'],
    '2026-03-23': ['drop-old'],
  }, 8, new Date('2026-03-31T10:00:00+02:00'));

  assert.deepEqual(trimmed, {
    '2026-03-24': ['keep-threshold'],
    '2026-03-31': ['keep-today'],
  });

  assert.deepEqual(
    trimRecordToRecentDays({ '2026-03-31': ['today'], '2026-03-30': ['yesterday'] }, 1, new Date('2026-03-31T10:00:00+02:00')),
    { '2026-03-31': ['today'] },
  );
});

test('countTrailingActiveDays stops at the first gap even with unordered duplicate keys', () => {
  assert.equal(countTrailingActiveDays(['2026-03-30', '2026-03-31', '2026-03-29', '2026-03-31', '2026-03-27'], new Date('2026-03-31T10:00:00+02:00')), 3);
});

test('getDayIndex is deterministic for a frozen day', () => {
  assert.equal(getDayIndex(99), getDayIndex(99));
  assert.notEqual(getDayIndex(99), getDayIndex(100));
});
