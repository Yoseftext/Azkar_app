import './helpers/environment.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import { STORAGE_KEYS } from '@/kernel/storage/storage-keys';
import { useQuranStore } from '@/features/quran/state/quran-store';

function resetStore() {
  useQuranStore.setState({
    isInitialized: false,
    isLoading: false,
    error: null,
    activeSurahNumber: null,
    activeSurahName: null,
    activeVerses: [],
    searchQuery: '',
    bookmark: null,
    recentSurahNumbers: [],
    dailyReadings: {},
  });
}

test('quran initialize normalizes persisted bookmark, recent surahs, and daily readings', () => {
  resetStore();
  window.localStorage.setItem(
    STORAGE_KEYS.quran,
    JSON.stringify({
      bookmark: {
        surahNumber: 999,
        surahName: 'غير موجودة',
        verseCount: -5,
        updatedAt: '2026-03-31T08:00:00.000Z',
      },
      recentSurahNumbers: [1, '2', 2, 999, -1, 114],
      dailyReadings: {
        '2025-01-01': [1],
        '2026-03-31': [1, 1, 112, 999],
      },
    }),
  );

  useQuranStore.getState().initialize();
  const state = useQuranStore.getState();

  assert.equal(state.isInitialized, true);
  assert.equal(state.bookmark, null);
  assert.deepEqual(state.recentSurahNumbers, [1, 2, 114]);
  assert.deepEqual(state.dailyReadings, {
    '2026-03-31': [1, 112],
  });
});

test('quran store opens surah, resumes bookmark, and clears bookmark safely', async () => {
  resetStore();
  useQuranStore.getState().initialize();
  useQuranStore.getState().setSearchQuery('الفاتحة');
  assert.equal(useQuranStore.getState().searchQuery, 'الفاتحة');

  await useQuranStore.getState().openSurah(1);
  let state = useQuranStore.getState();
  assert.equal(state.activeSurahNumber, 1);
  assert.equal(state.activeSurahName, 'الفاتحة');
  assert.equal(state.activeVerses.length, 3);
  assert.equal(state.bookmark?.surahNumber, 1);
  assert.deepEqual(state.recentSurahNumbers, [1]);
  assert.deepEqual(state.dailyReadings['2026-03-31'], [1]);

  state.closeReader();
  assert.equal(useQuranStore.getState().activeSurahNumber, null);

  await useQuranStore.getState().resumeBookmark();
  state = useQuranStore.getState();
  assert.equal(state.activeSurahNumber, 1);
  assert.equal(state.bookmark?.surahNumber, 1);
  assert.deepEqual(state.dailyReadings['2026-03-31'], [1]);

  useQuranStore.getState().clearBookmark();
  state = useQuranStore.getState();
  assert.equal(state.bookmark, null);
  assert.equal(state.activeSurahNumber, 1);
});


test('quran store surfaces loader errors without leaving loading state stuck', async () => {
  resetStore();
  useQuranStore.getState().initialize();

  await useQuranStore.getState().openSurah(999);
  const state = useQuranStore.getState();

  assert.equal(state.isLoading, false);
  assert.match(state.error ?? '', /تعذر|غير موجودة/);
  assert.equal(state.activeSurahNumber, null);
  assert.equal(state.activeVerses.length, 0);
});
