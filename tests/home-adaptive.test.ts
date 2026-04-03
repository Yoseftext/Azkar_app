import test from 'node:test';
import assert from 'node:assert/strict';
import { buildDailyPlan } from '@/features/home/domain/daily-plan';
import { buildAdaptiveHomeActions, rankAdaptiveQuickAccess } from '@/features/home/domain/home-adaptive';
import { FEATURED_QUICK_ACCESS, SECONDARY_QUICK_ACCESS } from '@/features/home/domain/home-quick-access';
import { GUIDED_PLANS } from '@/features/plans/domain/plan-definitions';
import { buildGuidedPlanSummary } from '@/features/plans/domain/plan-progress';

const plan = buildDailyPlan({
  totalTasks: 4,
  completedTasks: 1,
  firstIncompleteTaskTitle: 'أذكار الصباح',
  masbahaTodayCount: 0,
  masbahaTarget: 100,
  azkarTodayCount: 0,
  duasTodayCount: 0,
  namesTodayCount: 0,
  quranTodayReadings: 0,
  quranBookmark: { surahNumber: 18, surahName: 'الكهف', verseCount: 110, updatedAt: '2026-04-03T00:00:00.000Z' },
});

test('adaptive actions ترجّح البرنامج النشط ثم المهام والقرآن', () => {
  const activePlanSummary = buildGuidedPlanSummary({
    definition: GUIDED_PLANS[0]!,
    completedSessionKeys: [],
    todayKey: '2026-04-03',
    snapshot: {
      completedTasks: 1,
      remainingTasks: 3,
      azkarTodayCount: 0,
      quranTodayReadings: 0,
      duasTodayCount: 0,
      namesTodayCount: 0,
      masbahaTodayCount: 0,
    },
  });

  const items = buildAdaptiveHomeActions({
    plan,
    activePlanSummary,
    hasRecommendedPlan: true,
    storiesTodayCount: 0,
    unlockedAchievementsCount: 0,
  });

  assert.equal(items[0]?.id, 'plan');
  assert.equal(items[1]?.id, 'tasks');
  assert.equal(items[2]?.id, 'quran-resume');
});

test('adaptive quick access يرفع البرامج والمهام والقرآن عند وجود برنامج نشط', () => {
  const activePlanSummary = buildGuidedPlanSummary({
    definition: GUIDED_PLANS[1]!,
    completedSessionKeys: [],
    todayKey: '2026-04-03',
    snapshot: {
      completedTasks: 1,
      remainingTasks: 3,
      azkarTodayCount: 0,
      quranTodayReadings: 0,
      duasTodayCount: 0,
      namesTodayCount: 0,
      masbahaTodayCount: 0,
    },
  });

  const ranked = rankAdaptiveQuickAccess([...FEATURED_QUICK_ACCESS, ...SECONDARY_QUICK_ACCESS], {
    plan,
    activePlanSummary,
    hasRecommendedPlan: true,
    storiesTodayCount: 0,
    unlockedAchievementsCount: 0,
  });

  assert.equal(ranked[0]?.id, 'quran');
  assert.equal(ranked[1]?.id, 'plans');
  assert.equal(ranked[2]?.id, 'tasks');
});

test('adaptive actions تقترح القصص أو الإحصاءات بعد إغلاق الأساسيات', () => {
  const completedPlan = buildDailyPlan({
    totalTasks: 2,
    completedTasks: 2,
    firstIncompleteTaskTitle: null,
    masbahaTodayCount: 100,
    masbahaTarget: 100,
    azkarTodayCount: 2,
    duasTodayCount: 1,
    namesTodayCount: 1,
    quranTodayReadings: 1,
    quranBookmark: null,
  });

  const items = buildAdaptiveHomeActions({
    plan: completedPlan,
    activePlanSummary: null,
    hasRecommendedPlan: false,
    storiesTodayCount: 0,
    unlockedAchievementsCount: 2,
  });

  assert.equal(items[0]?.id, 'stats');
  assert.equal(items[1]?.id, 'stories');
});
