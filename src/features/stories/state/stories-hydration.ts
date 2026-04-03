import {
  hydrateStoryCategorySummaryBatches,
  hydrateStoryItems,
  loadStoryCategorySummaries,
  type StoryHydrationRequest,
  type StorySummaryBatchHydrationRequest,
} from '@/content/loaders/load-stories';
import type { StoriesState } from '@/features/stories/domain/story-types';
import {
  areAllStorySummariesHydrated,
  chooseSelectedCategorySlug,
  findCategoryForStoryId,
  getSummaryBatchRequestsForStoryIds,
  mergeHydratedCategorySummaries,
  mergeHydratedStoryItems,
  resolveStoryId,
  resolveStoryIdList,
} from '@/features/stories/state/stories-category-helpers';
import { persistStoriesState } from '@/features/stories/state/stories-persistence';

export async function hydrateCategorySummaryBatches(
  requests: StorySummaryBatchHydrationRequest[],
  set: (partial: Partial<StoriesState>) => void,
  get: () => StoriesState,
): Promise<void> {
  const currentState = get();
  const uniqueRequests = [...new Map(
    requests
      .map((request) => ({ categorySlug: request.categorySlug.trim(), batchIndex: Number(request.batchIndex) }))
      .filter((request) => request.categorySlug && Number.isFinite(request.batchIndex) && request.batchIndex >= 0)
      .map((request) => [`${request.categorySlug}::${request.batchIndex}`, request]),
  ).values()].filter((request) => {
    const category = currentState.categories.find((item) => item.slug === request.categorySlug);
    return Boolean(category) && request.batchIndex < category!.summaryBatchCount && !category!.loadedSummaryBatchIndexes.includes(request.batchIndex);
  });

  if (uniqueRequests.length === 0) return;

  set({ isLoading: true, error: null });
  try {
    const loadedCategories = await hydrateStoryCategorySummaryBatches(uniqueRequests);
    const refreshedState = get();
    const nextState: StoriesState = {
      ...refreshedState,
      isLoading: false,
      error: null,
      categories: mergeHydratedCategorySummaries(refreshedState.categories, loadedCategories),
    };
    persistStoriesState(nextState);
    set(nextState);
  } catch (error) {
    set({ isLoading: false, error: error instanceof Error ? error.message : 'تعذر تحميل دفعات القصص.' });
  }
}

export async function hydrateStoryRequests(
  requests: StoryHydrationRequest[],
  set: (partial: Partial<StoriesState>) => void,
  get: () => StoriesState,
): Promise<void> {
  const currentState = get();
  const uniqueRequests = [...new Map(
    requests
      .map((request) => ({ categorySlug: request.categorySlug.trim(), storyId: request.storyId.trim() }))
      .filter((request) => request.categorySlug && request.storyId)
      .map((request) => [`${request.categorySlug}::${request.storyId}`, request]),
  ).values()].filter((request) => {
    const category = currentState.categories.find((item) => item.slug === request.categorySlug);
    const story = category?.items.find((item) => item.id === request.storyId);
    return Boolean(story && story.storyLoaded === false);
  });

  if (uniqueRequests.length === 0) return;

  set({ isLoading: true, error: null });
  try {
    const loadedItems = await hydrateStoryItems(uniqueRequests);
    const refreshedState = get();
    const nextState: StoriesState = {
      ...refreshedState,
      isLoading: false,
      error: null,
      categories: mergeHydratedStoryItems(refreshedState.categories, loadedItems),
    };
    persistStoriesState(nextState);
    set(nextState);
  } catch (error) {
    set({ isLoading: false, error: error instanceof Error ? error.message : 'تعذر تحميل تفاصيل القصة.' });
  }
}

export async function hydrateAllStorySummaries(
  set: (partial: Partial<StoriesState>) => void,
  get: () => StoriesState,
): Promise<void> {
  const state = get();
  if (state.categories.length === 0 || areAllStorySummariesHydrated(state.categories)) return;

  const requests = state.categories.flatMap((category) =>
    Array.from({ length: category.summaryBatchCount }, (_, batchIndex) => ({ categorySlug: category.slug, batchIndex })),
  );
  await hydrateCategorySummaryBatches(requests, set, get);
}

export async function loadInitialStoryCategories(
  set: (partial: Partial<StoriesState>) => void,
  get: () => StoriesState,
): Promise<void> {
  const state = get();
  if (state.isLoading || state.categories.length > 0) return;

  set({ isLoading: true, error: null });
  try {
    const categories = await loadStoryCategorySummaries();
    const currentState = get();
    const selectedCategorySlug = chooseSelectedCategorySlug(categories, currentState.selectedCategorySlug);
    const selectedCategory = categories.find((category) => category.slug === selectedCategorySlug) ?? categories[0] ?? null;
    const selectedStoryId = resolveStoryId(categories, currentState.selectedStoryId, selectedCategorySlug) ?? selectedCategory?.itemIds[0] ?? null;
    const favoriteIds = resolveStoryIdList(categories, currentState.favoriteIds);
    const recentStoryIds = resolveStoryIdList(categories, currentState.recentStoryIds);
    const completedByDate = Object.fromEntries(
      Object.entries(currentState.completedByDate).map(([dateKey, storyIds]) => [dateKey, resolveStoryIdList(categories, storyIds)]),
    );

    const nextState: StoriesState = {
      ...currentState,
      isLoading: false,
      error: null,
      categories,
      selectedCategorySlug,
      selectedStoryId,
      favoriteIds,
      recentStoryIds,
      completedByDate,
    };
    persistStoriesState(nextState);
    set(nextState);

    const batchRequests = [
      ...(selectedCategorySlug ? [{ categorySlug: selectedCategorySlug, batchIndex: 0 }] : []),
      ...nextState.recentCategorySlugs.map((slug) => ({ categorySlug: slug, batchIndex: 0 })),
      ...getSummaryBatchRequestsForStoryIds(nextState.categories, [
        ...(selectedStoryId ? [selectedStoryId] : []),
        ...nextState.recentStoryIds,
      ]),
    ];
    await hydrateCategorySummaryBatches(batchRequests, set, get);

    const hydratedState = get();
    const preloadRequests: StoryHydrationRequest[] = [];
    if (selectedCategorySlug && selectedStoryId) preloadRequests.push({ categorySlug: selectedCategorySlug, storyId: selectedStoryId });
    for (const storyId of hydratedState.recentStoryIds) {
      const category = findCategoryForStoryId(hydratedState.categories, storyId);
      if (category) preloadRequests.push({ categorySlug: category.slug, storyId });
    }
    await hydrateStoryRequests(preloadRequests, set, get);
  } catch (error) {
    set({ isLoading: false, error: error instanceof Error ? error.message : 'تعذر تحميل القصص.' });
  }
}
