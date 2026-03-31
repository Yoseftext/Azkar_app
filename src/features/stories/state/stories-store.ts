import { create } from 'zustand';
import {
  ensureAllStoryCategoriesLoaded,
  findStorySummaryBatchIndex,
  hydrateStoryCategories,
  hydrateStoryCategorySummaryBatches,
  hydrateStoryItems,
  loadStoryCategorySummaries,
  type LoadedStoryItem,
  type StoryHydrationRequest,
  type StorySummaryBatchHydrationRequest,
} from '@/content/loaders/load-stories';
import type { PersistedStoriesState, StoriesState, StoryCategory } from '@/features/stories/domain/story-types';
import { LocalStorageEngine } from '@/kernel/storage/local-storage-engine';
import { STORAGE_KEYS } from '@/kernel/storage/storage-keys';
import { getLocalDateKey, trimRecordToRecentDays } from '@/shared/lib/date';

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

const storage = new LocalStorageEngine();
const fallbackPersistedState: PersistedStoriesState = {
  searchQuery: '',
  selectedCategorySlug: null,
  selectedStoryId: null,
  completedByDate: {},
  favoriteIds: [],
  recentCategorySlugs: [],
  recentStoryIds: [],
};
const fallbackState: StoriesState = {
  ...fallbackPersistedState,
  isInitialized: false,
  isLoading: false,
  error: null,
  categories: [],
};

function normalizePersistedState(rawValue: PersistedStoriesState | null): PersistedStoriesState {
  if (!rawValue) return fallbackPersistedState;
  return {
    searchQuery: String(rawValue.searchQuery ?? ''),
    selectedCategorySlug: rawValue.selectedCategorySlug ? String(rawValue.selectedCategorySlug) : null,
    selectedStoryId: rawValue.selectedStoryId ? String(rawValue.selectedStoryId) : null,
    completedByDate: trimRecordToRecentDays(
      Object.fromEntries(
        Object.entries(rawValue.completedByDate ?? {}).map(([dateKey, ids]) => [dateKey, [...new Set(Array.isArray(ids) ? ids.filter(Boolean) : [])]]),
      ),
      180,
    ),
    favoriteIds: Array.isArray(rawValue.favoriteIds)
      ? [...new Set(rawValue.favoriteIds.map((item) => String(item).trim()).filter(Boolean))]
      : [],
    recentCategorySlugs: Array.isArray(rawValue.recentCategorySlugs)
      ? [...new Set(rawValue.recentCategorySlugs.map((item) => String(item).trim()).filter(Boolean))].slice(0, 6)
      : [],
    recentStoryIds: Array.isArray(rawValue.recentStoryIds)
      ? [...new Set(rawValue.recentStoryIds.map((item) => String(item).trim()).filter(Boolean))].slice(0, 8)
      : [],
  };
}

function persist(state: StoriesState): void {
  storage.setItem(STORAGE_KEYS.stories, {
    searchQuery: state.searchQuery,
    selectedCategorySlug: state.selectedCategorySlug,
    selectedStoryId: state.selectedStoryId,
    completedByDate: trimRecordToRecentDays(state.completedByDate, 180),
    favoriteIds: state.favoriteIds,
    recentCategorySlugs: state.recentCategorySlugs.slice(0, 6),
    recentStoryIds: state.recentStoryIds.slice(0, 8),
  });
}

function cloneCategory(category: StoryCategory): StoryCategory {
  return {
    ...category,
    itemIds: [...category.itemIds],
    items: category.items.map((item) => ({ ...item })),
    loadedSummaryBatchIndexes: [...category.loadedSummaryBatchIndexes],
  };
}

function chooseSelectedCategorySlug(categories: StoryCategory[], preferredSlug: string | null): string | null {
  if (categories.length === 0) return null;
  if (preferredSlug && categories.some((category) => category.slug === preferredSlug)) return preferredSlug;
  return categories[0]?.slug ?? null;
}

function resolveStoryId(categories: StoryCategory[], rawStoryId: string | null, preferredCategorySlug: string | null = null): string | null {
  if (!rawStoryId) return null;
  const normalized = rawStoryId.trim();
  if (!normalized) return null;

  if (categories.some((category) => category.itemIds.includes(normalized))) return normalized;

  const categoryMatches = categories
    .filter((category) => (preferredCategorySlug ? category.slug === preferredCategorySlug : true))
    .flatMap((category) => category.itemIds.filter((storyId) => storyId.endsWith(`::${normalized}`)));
  if (categoryMatches.length === 1) return categoryMatches[0];

  const globalMatches = categories.flatMap((category) => category.itemIds.filter((storyId) => storyId.endsWith(`::${normalized}`)));
  return globalMatches.length === 1 ? globalMatches[0] : null;
}

function resolveStoryIdList(categories: StoryCategory[], rawStoryIds: string[]): string[] {
  return [
    ...new Set(
      rawStoryIds
        .map((storyId) => resolveStoryId(categories, storyId))
        .filter((storyId): storyId is string => Boolean(storyId)),
    ),
  ];
}

function findCategoryForStoryId(categories: StoryCategory[], storyId: string): StoryCategory | null {
  return categories.find((category) => category.itemIds.includes(storyId)) ?? null;
}

function areAllStorySummariesHydrated(categories: StoryCategory[]): boolean {
  return categories.every((category) => category.loadedSummaryBatchIndexes.length >= category.summaryBatchCount);
}

function areAllStoriesHydrated(categories: StoryCategory[]): boolean {
  return categories.every((category) => category.loadedSummaryBatchIndexes.length >= category.summaryBatchCount && category.items.every((story) => story.storyLoaded !== false));
}

function mergeHydratedCategorySummaries(categories: StoryCategory[], loadedCategories: StoryCategory[]): StoryCategory[] {
  const loadedBySlug = new Map(loadedCategories.map((category) => [category.slug, category]));
  return categories.map((category) => {
    const loaded = loadedBySlug.get(category.slug);
    if (!loaded) return category;

    const storyMap = new Map(category.items.map((item) => [item.id, item]));
    for (const item of loaded.items) storyMap.set(item.id, { ...item });

    return {
      ...category,
      itemsLoaded: loaded.itemsLoaded || category.itemsLoaded,
      items: category.itemIds.map((storyId) => storyMap.get(storyId)).filter((item): item is LoadedStoryItem => Boolean(item)).map((item) => ({ ...item })),
      loadedSummaryBatchIndexes: [...new Set([...category.loadedSummaryBatchIndexes, ...loaded.loadedSummaryBatchIndexes])].sort((left, right) => left - right),
      summaryBatchCount: Math.max(category.summaryBatchCount, loaded.summaryBatchCount),
      summaryBatchSize: Math.max(category.summaryBatchSize, loaded.summaryBatchSize),
    };
  });
}

function mergeHydratedStoryItems(categories: StoryCategory[], loadedItems: LoadedStoryItem[]): StoryCategory[] {
  const loadedByKey = new Map(loadedItems.map((item) => [`${item.categorySlug}::${item.id}`, item]));
  return categories.map((category) => ({
    ...category,
    itemIds: [...category.itemIds],
    loadedSummaryBatchIndexes: [...category.loadedSummaryBatchIndexes],
    items: category.items.map((story) => loadedByKey.get(`${category.slug}::${story.id}`) ?? { ...story }),
  }));
}

function getSummaryBatchRequestsForStoryIds(categories: StoryCategory[], storyIds: string[]): StorySummaryBatchHydrationRequest[] {
  const requests = storyIds
    .map((storyId) => {
      const category = findCategoryForStoryId(categories, storyId);
      if (!category) return null;
      return { categorySlug: category.slug, batchIndex: findStorySummaryBatchIndex(category, storyId) };
    })
    .filter((request): request is StorySummaryBatchHydrationRequest => Boolean(request));

  return [...new Map(requests.map((request) => [`${request.categorySlug}::${request.batchIndex}`, request])).values()];
}

function getNextMissingBatchIndex(category: StoryCategory): number | null {
  for (let index = 0; index < category.summaryBatchCount; index += 1) {
    if (!category.loadedSummaryBatchIndexes.includes(index)) return index;
  }
  return null;
}

async function hydrateCategorySummaryBatches(
  requests: StorySummaryBatchHydrationRequest[],
  set: (partial: Partial<StoriesState>) => void,
  get: () => StoriesStore,
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
    persist(nextState);
    set(nextState);
  } catch (error) {
    set({ isLoading: false, error: error instanceof Error ? error.message : 'تعذر تحميل دفعات القصص.' });
  }
}

async function hydrateStoryRequests(
  requests: StoryHydrationRequest[],
  set: (partial: Partial<StoriesState>) => void,
  get: () => StoriesStore,
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
    persist(nextState);
    set(nextState);
  } catch (error) {
    set({ isLoading: false, error: error instanceof Error ? error.message : 'تعذر تحميل تفاصيل القصة.' });
  }
}

async function hydrateAllStorySummaries(
  set: (partial: Partial<StoriesState>) => void,
  get: () => StoriesStore,
): Promise<void> {
  const state = get();
  if (state.categories.length === 0 || areAllStorySummariesHydrated(state.categories)) return;

  const requests = state.categories.flatMap((category) =>
    Array.from({ length: category.summaryBatchCount }, (_, batchIndex) => ({ categorySlug: category.slug, batchIndex })),
  );
  await hydrateCategorySummaryBatches(requests, set, get);
}

async function hydrateAllStoryContent(
  set: (partial: Partial<StoriesState>) => void,
  get: () => StoriesStore,
): Promise<void> {
  const state = get();
  if (state.categories.length === 0 || areAllStoriesHydrated(state.categories)) return;

  set({ isLoading: true, error: null });
  try {
    const categories = await ensureAllStoryCategoriesLoaded();
    const current = get();
    const nextState: StoriesState = {
      ...current,
      isLoading: false,
      error: null,
      categories,
    };
    persist(nextState);
    set(nextState);
  } catch (error) {
    set({ isLoading: false, error: error instanceof Error ? error.message : 'تعذر تحميل محتوى القصص الكامل.' });
  }
}

export const useStoriesStore = create<StoriesStore>((set, get) => ({
  ...fallbackState,
  initialize: () => {
    if (get().isInitialized) return;
    const stored = storage.getItem<PersistedStoriesState>(STORAGE_KEYS.stories);
    set({ ...fallbackState, ...normalizePersistedState(stored), isInitialized: true });
  },
  ensureLoaded: async () => {
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
      persist(nextState);
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
  },
  setSearchQuery: (query) => {
    const nextState = { ...get(), searchQuery: query };
    persist(nextState);
    set(nextState);
    if (query.trim()) {
      void hydrateAllStorySummaries(set, get);
    }
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
    persist(nextState);
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
    persist(nextState);
    set(nextState);
    if (categorySlug && category) {
      const batchIndex = findStorySummaryBatchIndex(category, resolvedStoryId);
      void hydrateCategorySummaryBatches([{ categorySlug, batchIndex }], set, get).then(() => hydrateStoryRequests([{ categorySlug, storyId: resolvedStoryId }], set, get));
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
    const completed = new Set(state.completedByDate[todayKey] ?? []);
    if (completed.has(normalizedStoryId)) completed.delete(normalizedStoryId);
    else completed.add(normalizedStoryId);
    const nextState = {
      ...state,
      completedByDate: { ...state.completedByDate, [todayKey]: [...completed] },
      recentStoryIds: [normalizedStoryId, ...state.recentStoryIds.filter((item) => item !== normalizedStoryId)].slice(0, 8),
    };
    persist(nextState);
    set(nextState);
  },
  toggleFavorite: (storyId) => {
    const normalizedStoryId = storyId.trim();
    if (!normalizedStoryId) return;
    const state = get();
    const favorites = new Set(state.favoriteIds);
    if (favorites.has(normalizedStoryId)) favorites.delete(normalizedStoryId);
    else favorites.add(normalizedStoryId);
    const nextState = { ...state, favoriteIds: [...favorites] };
    persist(nextState);
    set(nextState);
  },
  resetTodayProgress: () => {
    const state = get();
    const todayKey = getLocalDateKey();
    const nextState = { ...state, completedByDate: { ...state.completedByDate, [todayKey]: [] } };
    persist(nextState);
    set(nextState);
  },
}));
