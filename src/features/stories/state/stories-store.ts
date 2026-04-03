import { create } from 'zustand';
import { findStorySummaryBatchIndex, type StorySummaryBatchHydrationRequest } from '@/content/loaders/load-stories';
import type { StoriesState } from '@/features/stories/domain/story-types';
import {
  findCategoryForStoryId,
  getNextMissingBatchIndex,
  resolveStoryId,
} from '@/features/stories/state/stories-category-helpers';
import {
  hydrateAllStorySummaries,
  hydrateCategorySummaryBatches,
  hydrateStoryRequests,
  loadInitialStoryCategories,
} from '@/features/stories/state/stories-hydration';
import {
  FALLBACK_STORIES_STATE,
  loadPersistedStoriesState,
  persistStoriesState,
} from '@/features/stories/state/stories-persistence';
import { getLocalDateKey } from '@/shared/lib/date';

interface StoriesStore extends StoriesState {
  initialize: () => void;
  ensureLoaded: () => Promise<void>;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (slug: string) => void;
  setSelectedStory: (storyId: string) => void;
  loadMoreSelectedCategoryStories: () => Promise<void>;
  toggleStoryCompleted: (storyId: string) => void;
  toggleFavorite: (storyId: string) => void;
  resetTodayProgress: () => void;
}

export const useStoriesStore = create<StoriesStore>((set, get) => ({
  ...FALLBACK_STORIES_STATE,

  initialize: () => {
    if (get().isInitialized) return;
    const persisted = loadPersistedStoriesState();
    set({ ...FALLBACK_STORIES_STATE, ...persisted, isInitialized: true });
  },

  ensureLoaded: async () => {
    await loadInitialStoryCategories(set, get);
  },

  setSearchQuery: (query) => {
    const nextState = { ...get(), searchQuery: query };
    persistStoriesState(nextState);
    set(nextState);
    if (query.trim()) void hydrateAllStorySummaries(set, get);
  },

  setSelectedCategory: (slug) => {
    const normalizedSlug = slug.trim();
    if (!normalizedSlug) return;

    const state = get();
    const selectedCategory = state.categories.find((category) => category.slug === normalizedSlug);
    const selectedStoryId = resolveStoryId(state.categories, state.selectedStoryId, normalizedSlug) ?? selectedCategory?.itemIds[0] ?? null;
    const nextState = {
      ...state,
      selectedCategorySlug: normalizedSlug,
      selectedStoryId,
      recentCategorySlugs: [normalizedSlug, ...state.recentCategorySlugs.filter((item) => item !== normalizedSlug)].slice(0, 6),
    };
    persistStoriesState(nextState);
    set(nextState);

    const batchRequests: StorySummaryBatchHydrationRequest[] = [{ categorySlug: normalizedSlug, batchIndex: 0 }];
    if (selectedStoryId) {
      const categoryForStory = findCategoryForStoryId(state.categories, selectedStoryId) ?? selectedCategory;
      if (categoryForStory) {
        batchRequests.push({ categorySlug: normalizedSlug, batchIndex: findStorySummaryBatchIndex(categoryForStory, selectedStoryId) });
      }
    }

    void hydrateCategorySummaryBatches(batchRequests, set, get).then(() => {
      const refreshed = get();
      const resolvedStoryId = resolveStoryId(refreshed.categories, selectedStoryId, normalizedSlug) ?? refreshed.categories.find((category) => category.slug === normalizedSlug)?.itemIds[0] ?? null;
      if (resolvedStoryId) void hydrateStoryRequests([{ categorySlug: normalizedSlug, storyId: resolvedStoryId }], set, get);
    });
  },

  setSelectedStory: (storyId) => {
    const normalizedStoryId = storyId.trim();
    if (!normalizedStoryId) return;

    const state = get();
    const resolvedStoryId = resolveStoryId(state.categories, normalizedStoryId, state.selectedCategorySlug);
    if (!resolvedStoryId) return;

    const category = findCategoryForStoryId(state.categories, resolvedStoryId);
    const categorySlug = category?.slug ?? state.selectedCategorySlug ?? '';
    const nextState = {
      ...state,
      selectedCategorySlug: categorySlug || state.selectedCategorySlug,
      selectedStoryId: resolvedStoryId,
      recentStoryIds: [resolvedStoryId, ...state.recentStoryIds.filter((item) => item !== resolvedStoryId)].slice(0, 8),
    };
    persistStoriesState(nextState);
    set(nextState);

    if (categorySlug && category) {
      const batchIndex = findStorySummaryBatchIndex(category, resolvedStoryId);
      void hydrateCategorySummaryBatches([{ categorySlug, batchIndex }], set, get)
        .then(() => hydrateStoryRequests([{ categorySlug, storyId: resolvedStoryId }], set, get));
    }
  },

  loadMoreSelectedCategoryStories: async () => {
    const state = get();
    const selectedCategory = state.categories.find((category) => category.slug === state.selectedCategorySlug);
    if (!selectedCategory) return;
    const nextBatchIndex = getNextMissingBatchIndex(selectedCategory);
    if (nextBatchIndex === null) return;
    await hydrateCategorySummaryBatches([{ categorySlug: selectedCategory.slug, batchIndex: nextBatchIndex }], set, get);
  },

  toggleStoryCompleted: (storyId) => {
    const normalizedStoryId = storyId.trim();
    if (!normalizedStoryId) return;

    const state = get();
    const todayKey = getLocalDateKey();
    const completedIds = new Set(state.completedByDate[todayKey] ?? []);
    if (completedIds.has(normalizedStoryId)) completedIds.delete(normalizedStoryId);
    else completedIds.add(normalizedStoryId);

    const nextState = {
      ...state,
      completedByDate: { ...state.completedByDate, [todayKey]: [...completedIds] },
      recentStoryIds: [normalizedStoryId, ...state.recentStoryIds.filter((item) => item !== normalizedStoryId)].slice(0, 8),
    };
    persistStoriesState(nextState);
    set(nextState);
  },

  toggleFavorite: (storyId) => {
    const normalizedStoryId = storyId.trim();
    if (!normalizedStoryId) return;

    const state = get();
    const favoriteIds = new Set(state.favoriteIds);
    if (favoriteIds.has(normalizedStoryId)) favoriteIds.delete(normalizedStoryId);
    else favoriteIds.add(normalizedStoryId);

    const nextState = { ...state, favoriteIds: [...favoriteIds] };
    persistStoriesState(nextState);
    set(nextState);
  },

  resetTodayProgress: () => {
    const state = get();
    const todayKey = getLocalDateKey();
    const nextState = { ...state, completedByDate: { ...state.completedByDate, [todayKey]: [] } };
    persistStoriesState(nextState);
    set(nextState);
  },
}));
