import test from 'node:test';
import assert from 'node:assert/strict';
import { buildHomeSetupCard } from '@/features/home/domain/home-onboarding';

test('home setup card تظهر للمستخدم الجديد وتوجّهه لأول خطوة ناقصة', () => {
  const model = buildHomeSetupCard({
    dismissed: false,
    completedTasks: 0,
    azkarTodayCount: 0,
    quranTodayReadings: 0,
    masbahaTodayCount: 0,
    duasTodayCount: 0,
    namesTodayCount: 0,
    hasQuranBookmark: false,
    hasRecentAzkar: false,
    hasRecentDua: false,
    hasRecentName: false,
    hasCustomizedReading: false,
  });

  assert.equal(model.shouldShow, true);
  assert.equal(model.primaryTo, '/tasks');
  assert.equal(model.steps.length, 3);
  assert.equal(model.steps[0]?.isComplete, false);
});

test('home setup card تختفي بعد بدء الحلقة الأساسية أو عند الإخفاء', () => {
  const afterStart = buildHomeSetupCard({
    dismissed: false,
    completedTasks: 1,
    azkarTodayCount: 0,
    quranTodayReadings: 0,
    masbahaTodayCount: 0,
    duasTodayCount: 0,
    namesTodayCount: 0,
    hasQuranBookmark: false,
    hasRecentAzkar: false,
    hasRecentDua: false,
    hasRecentName: false,
    hasCustomizedReading: false,
  });
  const afterDismiss = buildHomeSetupCard({
    dismissed: true,
    completedTasks: 0,
    azkarTodayCount: 0,
    quranTodayReadings: 0,
    masbahaTodayCount: 0,
    duasTodayCount: 0,
    namesTodayCount: 0,
    hasQuranBookmark: false,
    hasRecentAzkar: false,
    hasRecentDua: false,
    hasRecentName: false,
    hasCustomizedReading: false,
  });

  assert.equal(afterStart.shouldShow, false);
  assert.equal(afterDismiss.shouldShow, false);
});
