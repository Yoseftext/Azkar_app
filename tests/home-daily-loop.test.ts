import test from 'node:test';
import assert from 'node:assert/strict';
import { buildDailyPlan } from '@/features/home/domain/daily-plan';
import { buildHomeHeroRecommendation, buildResumeRecommendations } from '@/features/home/domain/home-recommendations';
import { buildDailyMicroContent } from '@/features/home/domain/daily-micro-content';

test('buildDailyPlan يحسب المتبقي والنسبة بشكل صحيح', () => {
  const plan = buildDailyPlan({
    totalTasks: 4,
    completedTasks: 1,
    firstIncompleteTaskTitle: 'أذكار الصباح',
    masbahaTodayCount: 25,
    masbahaTarget: 100,
    azkarTodayCount: 0,
    duasTodayCount: 0,
    namesTodayCount: 0,
    quranTodayReadings: 0,
    quranBookmark: null,
  });

  assert.equal(plan.remainingTasks, 3);
  assert.equal(plan.completionRate, 25);
  assert.equal(plan.firstIncompleteTaskTitle, 'أذكار الصباح');
  assert.equal(plan.isFullyCompleted, false);
});

test('home hero يعطي أولوية لإكمال ورد اليوم قبل أي شيء آخر', () => {
  const recommendation = buildHomeHeroRecommendation(buildDailyPlan({
    totalTasks: 4,
    completedTasks: 2,
    firstIncompleteTaskTitle: 'قراءة ورد القرآن',
    masbahaTodayCount: 50,
    masbahaTarget: 100,
    azkarTodayCount: 2,
    duasTodayCount: 1,
    namesTodayCount: 1,
    quranTodayReadings: 1,
    quranBookmark: { surahNumber: 18, surahName: 'الكهف', verseCount: 110, updatedAt: '2026-04-03T00:00:00.000Z' },
  }));

  assert.equal(recommendation.primaryTo, '/tasks');
  assert.match(recommendation.title, /بقي لك 2/);
});

test('home hero يرجّح متابعة القرآن بعد إغلاق الورد الأساسي إذا وُجد bookmark', () => {
  const recommendation = buildHomeHeroRecommendation(buildDailyPlan({
    totalTasks: 4,
    completedTasks: 4,
    firstIncompleteTaskTitle: null,
    masbahaTodayCount: 100,
    masbahaTarget: 100,
    azkarTodayCount: 4,
    duasTodayCount: 1,
    namesTodayCount: 1,
    quranTodayReadings: 0,
    quranBookmark: { surahNumber: 67, surahName: 'الملك', verseCount: 30, updatedAt: '2026-04-03T00:00:00.000Z' },
  }));

  assert.equal(recommendation.primaryTo, '/quran');
  assert.match(recommendation.title, /سورة الملك/);
});

test('resume recommendations تعرض أحدث المسارات المتاحة بدون تجاوز الحد', () => {
  const plan = buildDailyPlan({
    totalTasks: 4,
    completedTasks: 3,
    firstIncompleteTaskTitle: 'تسبيح 100 مرة',
    masbahaTodayCount: 10,
    masbahaTarget: 100,
    azkarTodayCount: 1,
    duasTodayCount: 0,
    namesTodayCount: 0,
    quranTodayReadings: 0,
    quranBookmark: { surahNumber: 2, surahName: 'البقرة', verseCount: 286, updatedAt: '2026-04-03T00:00:00.000Z' },
  });

  const items = buildResumeRecommendations({
    quranBookmarkSurahName: 'البقرة',
    quranTodayReadings: 0,
    recentAzkarCategorySlug: 'azkar-morning',
    recentDuaCategorySlug: 'dua-category-01-quran-duas',
    recentNameId: 'allah-name-1',
    loadedNames: [{ id: 'allah-name-1', order: 1, name: 'الله', description: 'الوصف', normalizedSearch: 'الله الوصف 1' }],
  }, plan);

  assert.equal(items.length, 3);
  assert.equal(items[0]?.to, '/quran');
});

test('daily micro content تبني ذكر ودعاء واسم اليوم دائمًا', () => {
  const cards = buildDailyMicroContent([{ id: 'allah-name-1', order: 1, name: 'الرحمن', description: 'واسع الرحمة', normalizedSearch: 'الرحمن واسع الرحمه 1' }]);
  assert.equal(cards.length, 3);
  assert.equal(cards[0]?.id, 'zikr');
  assert.equal(cards[1]?.id, 'dua');
  assert.equal(cards[2]?.id, 'name');
  assert.match(cards[2]?.body ?? '', /الرحمن|اسم/);
});
