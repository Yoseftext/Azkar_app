import { findStorySummaryBatchIndex, type LoadedStoryItem, type StorySummaryBatchHydrationRequest } from '@/content/loaders/load-stories';
import type { StoryCategory } from '@/features/stories/domain/story-types';

export function chooseSelectedCategorySlug(categories: StoryCategory[], preferredSlug: string | null): string | null {
  if (categories.length === 0) return null;
  if (preferredSlug && categories.some((category) => category.slug === preferredSlug)) return preferredSlug;
  return categories[0]?.slug ?? null;
}

export function resolveStoryId(categories: StoryCategory[], rawStoryId: string | null, preferredCategorySlug: string | null = null): string | null {
  if (!rawStoryId) return null;
  const normalizedStoryId = rawStoryId.trim();
  if (!normalizedStoryId) return null;

  if (categories.some((category) => category.itemIds.includes(normalizedStoryId))) return normalizedStoryId;

  const categoryMatches = categories
    .filter((category) => (preferredCategorySlug ? category.slug === preferredCategorySlug : true))
    .flatMap((category) => category.itemIds.filter((storyId) => storyId.endsWith(`::${normalizedStoryId}`)));
  if (categoryMatches.length === 1) return categoryMatches[0];

  const globalMatches = categories.flatMap((category) => category.itemIds.filter((storyId) => storyId.endsWith(`::${normalizedStoryId}`)));
  return globalMatches.length === 1 ? globalMatches[0] : null;
}

export function resolveStoryIdList(categories: StoryCategory[], rawStoryIds: string[]): string[] {
  return [
    ...new Set(
      rawStoryIds
        .map((storyId) => resolveStoryId(categories, storyId))
        .filter((storyId): storyId is string => Boolean(storyId)),
    ),
  ];
}

export function findCategoryForStoryId(categories: StoryCategory[], storyId: string): StoryCategory | null {
  return categories.find((category) => category.itemIds.includes(storyId)) ?? null;
}

export function areAllStorySummariesHydrated(categories: StoryCategory[]): boolean {
  return categories.every((category) => category.loadedSummaryBatchIndexes.length >= category.summaryBatchCount);
}

export function mergeHydratedCategorySummaries(categories: StoryCategory[], loadedCategories: StoryCategory[]): StoryCategory[] {
  const loadedBySlug = new Map(loadedCategories.map((category) => [category.slug, category]));
  return categories.map((category) => {
    const loaded = loadedBySlug.get(category.slug);
    if (!loaded) return category;

    const storyMap = new Map(category.items.map((item) => [item.id, item]));
    for (const item of loaded.items) storyMap.set(item.id, { ...item });

    return {
      ...category,
      itemsLoaded: loaded.itemsLoaded || category.itemsLoaded,
      items: category.itemIds
        .map((storyId) => storyMap.get(storyId))
        .filter((item): item is LoadedStoryItem => Boolean(item))
        .map((item) => ({ ...item })),
      loadedSummaryBatchIndexes: [...new Set([...category.loadedSummaryBatchIndexes, ...loaded.loadedSummaryBatchIndexes])].sort((left, right) => left - right),
      summaryBatchCount: Math.max(category.summaryBatchCount, loaded.summaryBatchCount),
      summaryBatchSize: Math.max(category.summaryBatchSize, loaded.summaryBatchSize),
    };
  });
}

export function mergeHydratedStoryItems(categories: StoryCategory[], loadedItems: LoadedStoryItem[]): StoryCategory[] {
  const loadedByKey = new Map(loadedItems.map((item) => [`${item.categorySlug}::${item.id}`, item]));
  return categories.map((category) => ({
    ...category,
    itemIds: [...category.itemIds],
    loadedSummaryBatchIndexes: [...category.loadedSummaryBatchIndexes],
    items: category.items.map((story) => loadedByKey.get(`${category.slug}::${story.id}`) ?? { ...story }),
  }));
}

export function getSummaryBatchRequestsForStoryIds(categories: StoryCategory[], storyIds: string[]): StorySummaryBatchHydrationRequest[] {
  const requests = storyIds
    .map((storyId) => {
      const category = findCategoryForStoryId(categories, storyId);
      if (!category) return null;
      return { categorySlug: category.slug, batchIndex: findStorySummaryBatchIndex(category, storyId) };
    })
    .filter((request): request is StorySummaryBatchHydrationRequest => Boolean(request));

  return [...new Map(requests.map((request) => [`${request.categorySlug}::${request.batchIndex}`, request])).values()];
}

export function getNextMissingBatchIndex(category: StoryCategory): number | null {
  for (let index = 0; index < category.summaryBatchCount; index += 1) {
    if (!category.loadedSummaryBatchIndexes.includes(index)) return index;
  }
  return null;
}
