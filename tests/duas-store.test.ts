import './helpers/environment.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import { STORAGE_KEYS } from '@/kernel/storage/storage-keys';
import { useDuasStore } from '@/features/duas/state/duas-store';

async function waitFor(predicate: () => boolean, attempts = 20) {
  for (let index = 0; index < attempts; index += 1) {
    if (predicate()) return;
    await new Promise((resolve) => setTimeout(resolve, 0));
  }

  throw new Error('Timed out waiting for async store hydration.');
}

function resetStore() {
  useDuasStore.setState({
    isInitialized: false,
    isLoading: false,
    error: null,
    categories: [],
    selectedCategorySlug: null,
    searchQuery: '',
    completedByDate: {},
    favoriteIds: [],
    recentCategorySlugs: [],
  });
}

test('duas store initializes persisted values and restores a valid selected category on load', async () => {
  resetStore();
  window.localStorage.setItem(
    STORAGE_KEYS.duas,
    JSON.stringify({
      selectedCategorySlug: 'dua-category-1-unknown',
      searchQuery: 'رزق',
      completedByDate: {
        '2026-03-31': ['dua-a', 'dua-a'],
      },
      favoriteIds: ['fav-1', 'fav-1', 'fav-2'],
      recentCategorySlugs: ['x', 'x', 'y'],
    }),
  );

  useDuasStore.getState().initialize();
  await useDuasStore.getState().ensureLoaded();
  const state = useDuasStore.getState();

  assert.equal(state.searchQuery, 'رزق');
  assert.deepEqual(state.completedByDate, { '2026-03-31': ['dua-a'] });
  assert.deepEqual(state.favoriteIds, ['fav-1', 'fav-2']);
  assert.deepEqual(state.recentCategorySlugs, ['x', 'y']);
  assert.equal(state.selectedCategorySlug, state.categories[0]?.slug ?? null);
});

test('duas store tracks favorites, completion, and category recency', async () => {
  resetStore();
  useDuasStore.getState().initialize();
  await useDuasStore.getState().ensureLoaded();

  const { categories } = useDuasStore.getState();
  const targetCategory = categories[1] ?? categories[0];

  useDuasStore.getState().setSelectedCategory(targetCategory.slug);
  await waitFor(() => Boolean(useDuasStore.getState().categories.find((category) => category.slug === targetCategory.slug)?.itemsLoaded));

  const hydratedCategory = useDuasStore.getState().categories.find((category) => category.slug === targetCategory.slug) ?? targetCategory;
  const targetItem = hydratedCategory.items[0];

  useDuasStore.getState().toggleFavorite(targetItem.id);
  useDuasStore.getState().toggleFavorite(targetItem.id);
  useDuasStore.getState().toggleFavorite(targetItem.id);
  useDuasStore.getState().toggleItemCompleted(targetItem.id);

  let state = useDuasStore.getState();
  assert.equal(state.recentCategorySlugs[0], targetCategory.slug);
  assert.deepEqual(state.favoriteIds, [targetItem.id]);
  assert.deepEqual(state.completedByDate['2026-03-31'], [targetItem.id]);

  useDuasStore.getState().resetTodayProgress();
  state = useDuasStore.getState();
  assert.deepEqual(state.completedByDate['2026-03-31'], []);
});
