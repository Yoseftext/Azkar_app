import './helpers/environment.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import { buildStatsDashboard } from '@/features/stats/domain/stats-aggregators';

test('stats dashboard aggregates all feature snapshots coherently', () => {
  const dashboard = buildStatsDashboard({
    tasks: {
      items: [
        { id: 'w1', title: 'ورد 1', completed: true, group: 'wird', isDefault: true },
        { id: 'p1', title: 'شخصي', completed: false, group: 'personal', isDefault: false },
      ],
      dailyCompletions: {
        '2026-03-30': ['w1'],
        '2026-03-31': ['w1', 'p1'],
      },
      lastDailyResetKey: '2026-03-31',
    },
    masbaha: {
      isInitialized: true,
      isSilent: false,
      currentTarget: 33,
      currentSessionCount: 12,
      totalCount: 140,
      selectedPhrase: 'سبحان الله',
      customPhrases: [],
      dailyCounts: {
        '2026-03-30': 20,
        '2026-03-31': 40,
      },
    },
    azkar: {
      isInitialized: true,
      isLoading: false,
      error: null,
      categories: [],
      selectedCategorySlug: null,
      searchQuery: '',
      completedByDate: {
        '2026-03-31': ['zikr-1', 'zikr-2'],
      },
      recentCategorySlugs: [],
    },
    quran: {
      isInitialized: true,
      isLoading: false,
      error: null,
      activeSurahNumber: 1,
      activeSurahName: 'الفاتحة',
      activeVerses: [],
      searchQuery: '',
      bookmark: {
        surahNumber: 1,
        surahName: 'الفاتحة',
        verseCount: 7,
        updatedAt: '2026-03-31T10:00:00.000Z',
      },
      recentSurahNumbers: [1],
      dailyReadings: {
        '2026-03-31': [1, 112],
      },
    },
    duas: {
      isInitialized: true,
      isLoading: false,
      error: null,
      categories: [],
      selectedCategorySlug: null,
      searchQuery: '',
      completedByDate: {
        '2026-03-31': ['dua-1'],
      },
      favoriteIds: ['dua-1', 'dua-2'],
      recentCategorySlugs: [],
    },
    stories: {
      isInitialized: true,
      isLoading: false,
      error: null,
      categories: [],
      selectedCategorySlug: null,
      selectedStoryId: null,
      searchQuery: '',
      completedByDate: {
        '2026-03-31': ['story-1'],
      },
      favoriteIds: ['story-1'],
      recentCategorySlugs: [],
      recentStoryIds: [],
    },
    names: {
      isInitialized: true,
      isLoading: false,
      error: null,
      items: [],
      searchQuery: '',
      selectedNameId: null,
      completedByDate: {
        '2026-03-31': ['name-1', 'name-2'],
      },
      favoriteIds: ['name-1'],
      recentNameIds: [],
    },
    filter: 'week',
  });

  assert.equal(dashboard.tasksCompletedInRange, 3);
  assert.equal(dashboard.masbahaCountInRange, 60);
  assert.equal(dashboard.azkarCompletedInRange, 2);
  assert.equal(dashboard.duasCompletedInRange, 1);
  assert.equal(dashboard.storiesCompletedInRange, 1);
  assert.equal(dashboard.namesCompletedInRange, 2);
  assert.equal(dashboard.favoriteDuasCount, 2);
  assert.equal(dashboard.favoriteStoriesCount, 1);
  assert.equal(dashboard.favoriteNamesCount, 1);
  assert.equal(dashboard.lastReadSurahName, 'الفاتحة');
  assert.equal(dashboard.taskCompletionRate, 50);
  assert.equal(dashboard.quranVersesToday, 11);
  assert.equal(dashboard.activeDays, 2);
  assert.equal(dashboard.metrics.length, 9);
});
