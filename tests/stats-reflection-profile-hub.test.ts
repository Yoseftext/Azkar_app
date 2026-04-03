import './helpers/environment.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import { buildWeeklyReflection, buildStatsInsights } from '@/features/stats/domain/stats-reflection';
import { buildProfileHub } from '@/features/profile/domain/profile-hub';
import { buildDailyPlan } from '@/features/home/domain/daily-plan';

const input = {
  tasks: {
    items: [
      { id: 'task-1', title: 'أذكار الصباح', completed: true, group: 'wird', isDefault: true },
      { id: 'task-2', title: 'ورد القرآن', completed: false, group: 'wird', isDefault: true },
    ],
    dailyCompletions: {
      '2026-03-31': ['task-1'],
      '2026-03-30': ['task-1', 'task-2'],
    },
  },
  masbaha: {
    currentTarget: 100,
    totalCount: 400,
    dailyCounts: {
      '2026-03-31': 20,
      '2026-03-30': 66,
    },
  },
  azkar: {
    completedByDate: {
      '2026-03-31': ['zikr-1', 'zikr-2'],
      '2026-03-30': ['zikr-1'],
    },
  },
  quran: {
    bookmark: {
      surahNumber: 18,
      surahName: 'الكهف',
      verseCount: 110,
      updatedAt: '2026-03-31T08:00:00.000Z',
    },
    dailyReadings: {
      '2026-03-31': [18],
      '2026-03-30': [112],
    },
  },
  duas: {
    completedByDate: {
      '2026-03-31': ['dua-1'],
    },
    favoriteIds: ['dua-1'],
  },
  stories: {
    completedByDate: {},
    favoriteIds: [],
  },
  names: {
    completedByDate: {
      '2026-03-31': ['name-1'],
    },
    favoriteIds: ['name-1'],
  },
  filter: 'day' as const,
};

test('buildWeeklyReflection returns strongest area and next focus', () => {
  const reflection = buildWeeklyReflection(input);

  assert.match(reflection.title, /الأسبوع|ثبات/);
  assert.equal(reflection.strongestAreaLabel, 'القرآن');
  assert.equal(reflection.focus.to, '/tasks');
  assert.match(reflection.highlights.join(' '), /الكهف/);
});

test('buildStatsInsights returns actionable insight cards', () => {
  const insights = buildStatsInsights(input);

  assert.equal(insights.length, 3);
  assert.match(insights[0].title, /أقوى ما تحافظ عليه الآن/);
  assert.match(insights[2].body, /المهام|الأذكار|القرآن/);
});

test('buildProfileHub prefers quran bookmark, then falls back to unfinished daily plan', () => {
  const reflection = buildWeeklyReflection(input);
  const withBookmark = buildProfileHub(buildDailyPlan({
    totalTasks: 2,
    completedTasks: 1,
    firstIncompleteTaskTitle: 'ورد القرآن',
    masbahaTodayCount: 20,
    masbahaTarget: 100,
    azkarTodayCount: 2,
    duasTodayCount: 1,
    namesTodayCount: 1,
    quranTodayReadings: 1,
    quranBookmark: input.quran.bookmark,
  }), reflection);

  assert.equal(withBookmark.resumeTo, '/quran');
  assert.match(withBookmark.resumeTitle, /الكهف/);

  const withoutBookmark = buildProfileHub(buildDailyPlan({
    totalTasks: 2,
    completedTasks: 1,
    firstIncompleteTaskTitle: 'ورد القرآن',
    masbahaTodayCount: 20,
    masbahaTarget: 100,
    azkarTodayCount: 2,
    duasTodayCount: 1,
    namesTodayCount: 1,
    quranTodayReadings: 0,
    quranBookmark: null,
  }), reflection);

  assert.equal(withoutBookmark.resumeTo, '/tasks');
  assert.match(withoutBookmark.resumeBody, /ورد القرآن/);
});
