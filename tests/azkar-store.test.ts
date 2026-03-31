import './helpers/environment.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import { STORAGE_KEYS } from '@/kernel/storage/storage-keys';
import { useAzkarStore } from '@/features/azkar/state/azkar-store';

function resetStore() {
  useAzkarStore.setState({
    isInitialized: false,
    isLoading: false,
    error: null,
    categories: [],
    selectedCategorySlug: null,
    searchQuery: '',
    completedByDate: {},
    recentCategorySlugs: [],
  });
}

test('azkar store initializes persisted state and resolves invalid selected category on load', async () => {
  resetStore();
  window.localStorage.setItem(
    STORAGE_KEYS.azkar,
    JSON.stringify({
      selectedCategorySlug: 'missing-category',
      searchQuery: 'الصباح',
      completedByDate: {
        '2025-01-01': ['stale'],
        '2026-03-31': ['zikr-1', 'zikr-1'],
      },
      recentCategorySlugs: ['recent-a', 'recent-a', 'recent-b'],
    }),
  );

  useAzkarStore.getState().initialize();
  await useAzkarStore.getState().ensureLoaded();
  const state = useAzkarStore.getState();

  assert.equal(state.isInitialized, true);
  assert.equal(state.searchQuery, 'الصباح');
  assert.deepEqual(state.completedByDate, {
    '2026-03-31': ['zikr-1'],
  });
  assert.deepEqual(state.recentCategorySlugs, ['recent-a', 'recent-b']);
  assert.ok(state.categories.length > 0);
  assert.equal(state.selectedCategorySlug, state.categories[0]?.slug ?? null);
});

test('azkar store tracks category selection and daily completion progress', async () => {
  resetStore();
  useAzkarStore.getState().initialize();
  await useAzkarStore.getState().ensureLoaded();

  const { categories } = useAzkarStore.getState();
  const targetCategory = categories[1] ?? categories[0];
  const targetItem = targetCategory.items[0];

  useAzkarStore.getState().setSelectedCategory(targetCategory.slug);
  useAzkarStore.getState().toggleItemCompleted(targetItem.id);
  useAzkarStore.getState().toggleItemCompleted(targetItem.id);
  useAzkarStore.getState().toggleItemCompleted(targetItem.id);

  let state = useAzkarStore.getState();
  assert.equal(state.selectedCategorySlug, targetCategory.slug);
  assert.equal(state.recentCategorySlugs[0], targetCategory.slug);
  assert.deepEqual(state.completedByDate['2026-03-31'], [targetItem.id]);

  useAzkarStore.getState().resetTodayProgress();
  state = useAzkarStore.getState();
  assert.deepEqual(state.completedByDate['2026-03-31'], []);
});
