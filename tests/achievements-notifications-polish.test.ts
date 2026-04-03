import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { buildAchievementJourney } from '@/features/achievements/domain/achievement-journey';
import { getNotificationPresets } from '@/features/notifications/domain/notification-presets';

describe('achievement journey', () => {
  it('returns nearest milestones in expected order', () => {
    const summary = buildAchievementJourney(['tasbeeh_33', 'task_1']);
    assert.equal(summary.unlockedCount, 2);
    assert.equal(summary.totalCount > 2, true);
    assert.deepEqual(summary.nextMilestones.map((item) => item.id), ['azkar_day_1', 'streak_3', 'tasbeeh_100']);
    assert.equal(summary.nextMilestones[0]?.route, '/azkar');
  });
});

describe('notification presets', () => {
  it('provides stable presets for each slot', () => {
    assert.deepEqual(getNotificationPresets('morning').map((item) => item.time), ['05:30', '06:00', '06:30']);
    assert.deepEqual(getNotificationPresets('evening').map((item) => item.time), ['17:00', '18:00', '19:00']);
    assert.deepEqual(getNotificationPresets('sleep').map((item) => item.time), ['21:30', '22:00', '22:30']);
  });
});
