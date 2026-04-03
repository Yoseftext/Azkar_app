import './helpers/environment.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import { createDayTransitionRuntime } from '@/kernel/day-watcher/day-transition-runtime';

test('day transition runtime announces immediately when the day changes while visible', () => {
  let currentDate = '2026-04-02';
  let visible = true;
  const runtime = createDayTransitionRuntime(() => currentDate, () => visible);

  assert.equal(runtime.checkForNewDay(), false);

  currentDate = '2026-04-03';
  assert.equal(runtime.checkForNewDay(), true);
  assert.equal(runtime.hasPendingAnnouncement(), false);
});

test('day transition runtime defers hidden day changes and flushes once on resume', () => {
  let currentDate = '2026-04-02';
  let visible = false;
  const runtime = createDayTransitionRuntime(() => currentDate, () => visible);

  currentDate = '2026-04-03';
  assert.equal(runtime.checkForNewDay(), false);
  assert.equal(runtime.hasPendingAnnouncement(), true);

  assert.equal(runtime.checkForNewDay(), false);
  assert.equal(runtime.hasPendingAnnouncement(), true);

  visible = true;
  assert.equal(runtime.flushPendingAnnouncement(), true);
  assert.equal(runtime.hasPendingAnnouncement(), false);
  assert.equal(runtime.flushPendingAnnouncement(), false);
});
