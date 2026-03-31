import './helpers/environment.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_MASBAHA_PHRASES,
  getMasbahaActiveStreak,
  getMasbahaBatchCount,
  getMasbahaCurrentMonthCount,
  getMasbahaLast7DaysCount,
  getMasbahaProgressRatio,
  getMasbahaTodayCount,
  getNextDefaultPhrase,
} from '@/features/masbaha/domain/masbaha-selectors';

test('masbaha selectors compute batch and ratio safely around target boundaries', () => {
  assert.equal(getMasbahaBatchCount({ currentSessionCount: 10, currentTarget: 0 }), 0);
  assert.equal(getMasbahaProgressRatio({ currentSessionCount: 10, currentTarget: 0 }), 0);

  assert.equal(getMasbahaBatchCount({ currentSessionCount: 7, currentTarget: 3 }), 1);
  assert.equal(getMasbahaProgressRatio({ currentSessionCount: 7, currentTarget: 3 }), 1 / 3);

  assert.equal(getMasbahaBatchCount({ currentSessionCount: 6, currentTarget: 3 }), 0);
  assert.equal(getMasbahaProgressRatio({ currentSessionCount: 6, currentTarget: 3 }), 1);
});

test('masbaha selectors derive today, last 7 days, current month, and streak from daily counts', () => {
  const state = {
    dailyCounts: {
      '2026-03-25': 10,
      '2026-03-29': 7,
      '2026-03-30': 3,
      '2026-03-31': 11,
      '2026-02-28': 50,
      invalid: 99,
    },
  };

  assert.equal(getMasbahaTodayCount(state), 11);
  assert.equal(getMasbahaLast7DaysCount(state), 31);
  assert.equal(getMasbahaCurrentMonthCount(state), 31);
  assert.equal(getMasbahaActiveStreak(state), 3);
});

test('masbaha phrase rotation advances only for built-in phrases and preserves unknown custom phrase', () => {
  assert.equal(getNextDefaultPhrase(DEFAULT_MASBAHA_PHRASES[0]), DEFAULT_MASBAHA_PHRASES[1]);
  assert.equal(getNextDefaultPhrase(DEFAULT_MASBAHA_PHRASES.at(-1) ?? ''), DEFAULT_MASBAHA_PHRASES[0]);
  assert.equal(getNextDefaultPhrase('ذكر مخصص'), 'ذكر مخصص');
});
