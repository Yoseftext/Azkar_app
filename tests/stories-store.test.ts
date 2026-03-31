import './helpers/environment.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import { STORAGE_KEYS } from '@/kernel/storage/storage-keys';
import { useStoriesStore } from '@/features/stories/state/stories-store';

async function waitFor(predicate: () => boolean, attempts = 20) {
  for (let index = 0; index < attempts; index += 1) {
    if (predicate()) return;
    await new Promise((resolve) => setTimeout(resolve, 0));
  }

  throw new Error('Timed out waiting for async store hydration.');
}

function resetStore() {
  useStoriesStore.setState({
    isInitialized: false,
    isLoading: false,
    error: null,
    categories: [],
    searchQuery: '',
    selectedCategorySlug: null,
    selectedStoryId: null,
    completedByDate: {},
    favoriteIds: [],
    recentCategorySlugs: [],
    recentStoryIds: [],
  });
}

test('stories store initializes persisted state and falls back to first available story when persisted selection is invalid', async () => {
  resetStore();
  window.localStorage.setItem(
    STORAGE_KEYS.stories,
    JSON.stringify({
      searchQuery: 'نبي',
      selectedCategorySlug: 'story-category-1-قصص-تربوية-وعامة',
      selectedStoryId: '1',
      completedByDate: {
        '2026-03-31': ['story-a', 'story-a'],
      },
      favoriteIds: ['story-a', 'story-a', 'story-b'],
      recentCategorySlugs: ['cat-a', 'cat-a', 'cat-b'],
      recentStoryIds: ['story-a', 'story-a', 'story-b'],
    }),
  );

  useStoriesStore.getState().initialize();
  await useStoriesStore.getState().ensureLoaded();
  const state = useStoriesStore.getState();

  assert.equal(state.searchQuery, 'نبي');
  assert.deepEqual(state.completedByDate, { '2026-03-31': [] });
  assert.deepEqual(state.favoriteIds, []);
  assert.deepEqual(state.recentCategorySlugs, ['cat-a', 'cat-b']);
  assert.deepEqual(state.recentStoryIds, []);
  assert.equal(state.selectedCategorySlug, state.categories[0]?.slug ?? null);
  assert.equal(state.selectedStoryId, state.categories[0]?.items[0]?.id ?? null);
  assert.equal(state.categories[0]?.items[0]?.storyLoaded, true);
});

test('stories store tracks explicit selection, favorites, daily reading progress, and summary batch expansion', async () => {
  resetStore();
  useStoriesStore.getState().initialize();
  await useStoriesStore.getState().ensureLoaded();

  const { categories } = useStoriesStore.getState();
  const targetCategory = categories[1] ?? categories[0];

  useStoriesStore.getState().setSelectedCategory(targetCategory.slug);
  await waitFor(() => Boolean(useStoriesStore.getState().categories.find((category) => category.slug === targetCategory.slug)?.itemsLoaded));

  const hydratedCategory = useStoriesStore.getState().categories.find((category) => category.slug === targetCategory.slug) ?? targetCategory;
  const initialLoadedCount = hydratedCategory.items.length;
  await useStoriesStore.getState().loadMoreSelectedCategoryStories();
  await waitFor(() => {
    const category = useStoriesStore.getState().categories.find((item) => item.slug === targetCategory.slug);
    return Boolean(category && category.items.length > initialLoadedCount);
  });
  const expandedCategory = useStoriesStore.getState().categories.find((category) => category.slug === targetCategory.slug) ?? hydratedCategory;
  const targetStory = expandedCategory.items[expandedCategory.items.length - 1] ?? expandedCategory.items[0];

  useStoriesStore.getState().setSelectedStory(targetStory.id);
  await waitFor(() => Boolean(useStoriesStore.getState().categories.find((category) => category.slug === targetCategory.slug)?.items.find((story) => story.id === targetStory.id)?.storyLoaded));
  useStoriesStore.getState().toggleFavorite(targetStory.id);
  useStoriesStore.getState().toggleStoryCompleted(targetStory.id);

  let state = useStoriesStore.getState();
  assert.equal(state.selectedCategorySlug, targetCategory.slug);
  assert.ok((state.categories.find((category) => category.slug === targetCategory.slug)?.loadedSummaryBatchIndexes.length ?? 0) >= 2);
  assert.equal(state.selectedStoryId, targetStory.id);
  assert.equal(state.recentCategorySlugs[0], targetCategory.slug);
  assert.equal(state.recentStoryIds[0], targetStory.id);
  assert.deepEqual(state.favoriteIds, [targetStory.id]);
  assert.deepEqual(state.completedByDate['2026-03-31'], [targetStory.id]);

  useStoriesStore.getState().resetTodayProgress();
  state = useStoriesStore.getState();
  assert.deepEqual(state.completedByDate['2026-03-31'], []);
});


test('stories store ignores blank selections and hydrates all summaries when search is active', async () => {
  resetStore();
  useStoriesStore.getState().initialize();
  await useStoriesStore.getState().ensureLoaded();

  const beforeState = useStoriesStore.getState();
  const beforeCategory = beforeState.categories[0];
  const beforeSelectedStoryId = beforeState.selectedStoryId;

  useStoriesStore.getState().setSelectedCategory('   ');
  useStoriesStore.getState().setSelectedStory('   ');

  assert.equal(useStoriesStore.getState().selectedStoryId, beforeSelectedStoryId);
  assert.equal(useStoriesStore.getState().selectedCategorySlug, beforeState.selectedCategorySlug);

  useStoriesStore.getState().setSearchQuery('نبي');
  await waitFor(() => useStoriesStore.getState().categories.every((category) => category.loadedSummaryBatchIndexes.length >= category.summaryBatchCount), 80);

  const state = useStoriesStore.getState();
  assert.equal(state.searchQuery, 'نبي');
  assert.ok(state.categories.every((category) => category.loadedSummaryBatchIndexes.length >= category.summaryBatchCount));
  assert.ok((state.categories.find((category) => category.slug === beforeCategory.slug)?.items.length ?? 0) >= beforeCategory.items.length);
});
