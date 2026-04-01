export interface LoadedStoryItem {
  id: string;
  legacyId: number | string | null;
  title: string;
  story: string;
  storyLoaded: boolean;
  lesson: string | null;
  source: string | null;
  categorySlug: string;
  categoryTitle: string;
  excerpt: string;
}

export interface LoadedStoryCategory {
  slug: string;
  title: string;
  itemCount: number;
  preview: string;
  itemIds: string[];
  itemsLoaded: boolean;
  items: LoadedStoryItem[];
  summaryBatchCount: number;
  summaryBatchSize: number;
  loadedSummaryBatchIndexes: number[];
}

interface StoryCategoryManifestItem {
  slug: string;
  title: string;
  itemCount: number;
  preview: string;
  itemLegacyIds: Array<number | string>;
  featuredTitle: string;
  featuredLesson: string | null;
  summaryBatchCount: number;
  summaryBatchSize: number;
}

interface StoryManifestModule {
  STORY_CATEGORY_MANIFEST: StoryCategoryManifestItem[];
}

interface LoadedStoryItemModule {
  default?: LoadedStoryItem;
  STORY_ITEM?: LoadedStoryItem;
}

interface StoryCategorySummaryBatch {
  slug: string;
  title: string;
  itemCount: number;
  preview: string;
  summaryBatchCount: number;
  summaryBatchSize: number;
  batchIndex: number;
  itemIds: string[];
  items: LoadedStoryItem[];
}

interface StoryCategorySummaryBatchModule {
  default?: StoryCategorySummaryBatch;
  STORY_CATEGORY_SUMMARY_BATCH?: StoryCategorySummaryBatch;
}

interface StoryCategoryRegistryBatchModule {
  default?: Record<string, () => Promise<LoadedStoryItemModule>>;
  STORY_ITEM_LOADERS?: Record<string, () => Promise<LoadedStoryItemModule>>;
}

export interface StoryHydrationRequest {
  categorySlug: string;
  storyId: string;
}

export interface StorySummaryBatchHydrationRequest {
  categorySlug: string;
  batchIndex: number;
}

const categorySummaryBatchModuleLoaders = import.meta.glob<StoryCategorySummaryBatchModule>('../stories/generated/category-summaries/*.js');
const categoryRegistryBatchModuleLoaders = import.meta.glob<StoryCategoryRegistryBatchModule>('../stories/generated/category-registries/*.js');

let manifestCache: StoryCategoryManifestItem[] | null = null;
const categorySummaryBatchCache = new Map<string, StoryCategorySummaryBatch>();
const categoryItemLoaderBatchCache = new Map<string, Record<string, () => Promise<LoadedStoryItemModule>>>();
const storyCache = new Map<string, LoadedStoryItem>();
const fullyHydratedCategoryCache = new Map<string, LoadedStoryCategory>();

function getStoryCacheKey(categorySlug: string, storyId: string): string {
  return `${categorySlug}::${storyId}`;
}

function getSummaryBatchCacheKey(categorySlug: string, batchIndex: number): string {
  return `${categorySlug}::summary-batch::${batchIndex}`;
}

function getRegistryBatchCacheKey(categorySlug: string, batchIndex: number): string {
  return `${categorySlug}::registry-batch::${batchIndex}`;
}

function buildQualifiedStoryId(categorySlug: string, legacyId: number | string): string {
  return `${categorySlug}::${legacyId}`;
}

function getCategorySummaryBatchModulePath(categorySlug: string, batchIndex: number): string {
  return `../stories/generated/category-summaries/${categorySlug}--batch-${batchIndex}.js`;
}

function getCategoryRegistryBatchModulePath(categorySlug: string, batchIndex: number): string {
  return `../stories/generated/category-registries/${categorySlug}--batch-${batchIndex}.js`;
}

function cloneStoryItem(item: LoadedStoryItem): LoadedStoryItem {
  return { ...item };
}

function cloneCategory(category: LoadedStoryCategory): LoadedStoryCategory {
  return {
    ...category,
    itemIds: [...category.itemIds],
    items: category.items.map((item) => cloneStoryItem(item)),
    loadedSummaryBatchIndexes: [...category.loadedSummaryBatchIndexes],
  };
}

function normalizeText(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

export function buildStoryExcerpt(value: string): string {
  const normalized = value.replace(/\s+/g, ' ').trim();
  if (normalized.length <= 160) return normalized;
  return `${normalized.slice(0, 157).trimEnd()}…`;
}

export function normalizeLegacyStory(item: Partial<LoadedStoryItem>, categoryTitle: string, categorySlug: string, index: number): LoadedStoryItem | null {
  const title = normalizeText(item.title);
  const story = normalizeText(item.story);

  if (!title || !story) return null;

  const legacyIdSource = item.legacyId ?? item.id ?? index + 1;
  const parsedLegacyId = Number(legacyIdSource);
  const uniqueId = buildQualifiedStoryId(categorySlug, legacyIdSource);

  return {
    id: uniqueId,
    legacyId: Number.isFinite(parsedLegacyId) ? parsedLegacyId : String(legacyIdSource),
    title,
    story,
    storyLoaded: true,
    lesson: normalizeText(item.lesson) || null,
    source: normalizeText(item.source) || null,
    categorySlug,
    categoryTitle,
    excerpt: buildStoryExcerpt(story),
  };
}

export function normalizeStoryCategories(
  payload: { categories?: Array<{ name?: string; stories?: Partial<LoadedStoryItem>[] }> } | null | undefined,
): LoadedStoryCategory[] {
  return (payload?.categories ?? [])
    .map((category, categoryIndex) => {
      const title = normalizeText(category.name) || `قصص ${categoryIndex + 1}`;
      const slugBase =
        title
          .normalize('NFKC')
          .trim()
          .toLowerCase()
          .replace(/[^\p{L}\p{N}]+/gu, '-')
          .replace(/^-+|-+$/g, '') || `story-category-${categoryIndex + 1}`;
      const slug = `story-category-${categoryIndex + 1}-${slugBase}`;
      const items = (category.stories ?? [])
        .map((item, itemIndex) => normalizeLegacyStory(item, title, slug, itemIndex))
        .filter((story): story is LoadedStoryItem => Boolean(story));

      return {
        slug,
        title,
        itemCount: items.length,
        preview: items[0]?.excerpt ?? 'لا يوجد ملخص متاح لهذه الفئة.',
        itemIds: items.map((item) => item.id),
        itemsLoaded: true,
        items,
        summaryBatchCount: 1,
        summaryBatchSize: Math.max(items.length, 1),
        loadedSummaryBatchIndexes: [0],
      } satisfies LoadedStoryCategory;
    })
    .filter((category) => category.itemCount > 0);
}

function normalizeQuery(query: string): string {
  return query.trim().toLowerCase();
}

function createManifestCategory(item: StoryCategoryManifestItem): LoadedStoryCategory {
  const summaryBatchCount = Math.max(1, Number(item.summaryBatchCount || 1));
  const summaryBatchSize = Math.max(1, Number(item.summaryBatchSize || item.itemLegacyIds.length || 1));
  return {
    slug: item.slug,
    title: item.title,
    itemCount: item.itemCount,
    preview: item.preview,
    itemIds: item.itemLegacyIds.map((legacyId) => buildQualifiedStoryId(item.slug, legacyId)),
    itemsLoaded: false,
    items: [],
    summaryBatchCount,
    summaryBatchSize,
    loadedSummaryBatchIndexes: [],
  };
}

function mergeCategoryWithSummaryBatch(category: LoadedStoryCategory, batch: StoryCategorySummaryBatch): LoadedStoryCategory {
  const loadedIndexes = [...new Set([...category.loadedSummaryBatchIndexes, batch.batchIndex])].sort((left, right) => left - right);
  const storyMap = new Map(category.items.map((item) => [item.id, item]));
  for (const item of batch.items) storyMap.set(item.id, item);
  const items = category.itemIds.map((itemId) => storyMap.get(itemId)).filter((item): item is LoadedStoryItem => Boolean(item)).map((item) => cloneStoryItem(item));

  return {
    ...category,
    itemCount: batch.itemCount,
    preview: batch.preview,
    itemsLoaded: loadedIndexes.length > 0,
    items,
    summaryBatchCount: Math.max(1, batch.summaryBatchCount || category.summaryBatchCount),
    summaryBatchSize: Math.max(1, batch.summaryBatchSize || category.summaryBatchSize),
    loadedSummaryBatchIndexes: loadedIndexes,
  };
}

async function loadStoryManifest(): Promise<StoryCategoryManifestItem[]> {
  if (manifestCache) return manifestCache;
  const mod = (await import('@/content/stories/generated/manifest.js')) as StoryManifestModule;
  manifestCache = [...(mod.STORY_CATEGORY_MANIFEST ?? [])];
  return manifestCache;
}

async function getManifestCategories(): Promise<LoadedStoryCategory[]> {
  const manifest = await loadStoryManifest();
  return manifest.map((item) => createManifestCategory(item));
}

async function getManifestCategoryBySlug(slug: string): Promise<LoadedStoryCategory | null> {
  const categories = await getManifestCategories();
  return categories.find((category) => category.slug === slug) ?? null;
}

async function loadCategorySummaryBatch(categorySlug: string, batchIndex: number): Promise<StoryCategorySummaryBatch | null> {
  const cacheKey = getSummaryBatchCacheKey(categorySlug, batchIndex);
  const cached = categorySummaryBatchCache.get(cacheKey);
  if (cached) return { ...cached, itemIds: [...cached.itemIds], items: cached.items.map((item) => cloneStoryItem(item)) };

  const modulePath = getCategorySummaryBatchModulePath(categorySlug, batchIndex);
  const loader = categorySummaryBatchModuleLoaders[modulePath];
  if (!loader) {
    throw new Error(`Missing story summary batch module for ${categorySlug} batch ${batchIndex} at ${modulePath}.`);
  }

  const mod = await loader();
  const batch = mod.STORY_CATEGORY_SUMMARY_BATCH ?? mod.default ?? null;
  if (!batch) {
    throw new Error(`Invalid story summary batch module for ${categorySlug} batch ${batchIndex}.`);
  }

  categorySummaryBatchCache.set(cacheKey, batch);
  return { ...batch, itemIds: [...batch.itemIds], items: batch.items.map((item) => cloneStoryItem(item)) };
}

async function loadCategoryItemLoaders(categorySlug: string, batchIndex: number): Promise<Record<string, () => Promise<LoadedStoryItemModule>>> {
  const cacheKey = getRegistryBatchCacheKey(categorySlug, batchIndex);
  const cached = categoryItemLoaderBatchCache.get(cacheKey);
  if (cached) return cached;

  const modulePath = getCategoryRegistryBatchModulePath(categorySlug, batchIndex);
  const loader = categoryRegistryBatchModuleLoaders[modulePath];
  if (!loader) {
    throw new Error(`Missing story registry batch module for ${categorySlug} batch ${batchIndex} at ${modulePath}.`);
  }

  const mod = await loader();
  const loaders = mod.STORY_ITEM_LOADERS ?? mod.default ?? null;
  if (!loaders) {
    throw new Error(`Invalid story registry batch module for ${categorySlug} batch ${batchIndex}.`);
  }

  categoryItemLoaderBatchCache.set(cacheKey, loaders);
  return loaders;
}

export function findStorySummaryBatchIndex(
  category: Pick<LoadedStoryCategory, 'itemIds' | 'summaryBatchSize'>,
  storyId: string,
): number {
  const index = category.itemIds.indexOf(storyId);
  if (index < 0) return 0;
  return Math.floor(index / Math.max(1, category.summaryBatchSize));
}

export async function loadStoryCategories(): Promise<LoadedStoryCategory[]> {
  const categories = await loadStoryCategorySummaries();
  const initialRequests = categories.map((category) => ({ categorySlug: category.slug, batchIndex: 0 }));
  const hydrated = await hydrateStoryCategorySummaryBatches(initialRequests);
  const hydratedBySlug = new Map(hydrated.map((category) => [category.slug, category]));
  return categories.map((category) => cloneCategory(hydratedBySlug.get(category.slug) ?? category));
}

export async function loadStoryCategorySummaries(): Promise<LoadedStoryCategory[]> {
  const categories = await getManifestCategories();
  return categories.map((category) => cloneCategory(category));
}

export async function loadStoryCategoryBySlug(slug: string): Promise<LoadedStoryCategory | null> {
  const manifestCategory = await getManifestCategoryBySlug(slug);
  if (!manifestCategory) return null;
  const loaded = await hydrateStoryCategorySummaryBatches([{ categorySlug: slug, batchIndex: 0 }]);
  return cloneCategory(loaded[0] ?? manifestCategory);
}

export async function hydrateStoryCategories(slugs: string[]): Promise<LoadedStoryCategory[]> {
  return hydrateStoryCategorySummaryBatches(slugs.map((slug) => ({ categorySlug: slug, batchIndex: 0 })));
}

export async function hydrateStoryCategorySummaryBatches(requests: StorySummaryBatchHydrationRequest[]): Promise<LoadedStoryCategory[]> {
  const manifestCategories = await getManifestCategories();
  const manifestBySlug = new Map(manifestCategories.map((category) => [category.slug, category]));
  const uniqueRequests = [...new Map(
    requests
      .map((request) => ({ categorySlug: request.categorySlug.trim(), batchIndex: Number(request.batchIndex) }))
      .filter((request) => request.categorySlug && Number.isFinite(request.batchIndex) && request.batchIndex >= 0)
      .map((request) => [`${request.categorySlug}::${request.batchIndex}`, request]),
  ).values()].filter((request) => {
    const category = manifestBySlug.get(request.categorySlug);
    return Boolean(category) && request.batchIndex < Math.max(1, category!.summaryBatchCount);
  });

  if (uniqueRequests.length === 0) return [];

  const batches = await Promise.all(uniqueRequests.map((request) => loadCategorySummaryBatch(request.categorySlug, request.batchIndex)));
  const grouped = new Map<string, StoryCategorySummaryBatch[]>();

  for (const batch of batches) {
    if (!batch) continue;
    const list = grouped.get(batch.slug) ?? [];
    list.push(batch);
    grouped.set(batch.slug, list);
  }

  return [...grouped.entries()].map(([slug, categoryBatches]) => {
    const manifestCategory = manifestBySlug.get(slug);
    let category = cloneCategory(manifestCategory ?? createManifestCategory({
      slug,
      title: categoryBatches[0]?.title ?? slug,
      itemCount: categoryBatches.reduce((sum, batch) => Math.max(sum, batch.itemCount), 0),
      preview: categoryBatches[0]?.preview ?? 'لا يوجد ملخص متاح لهذه الفئة.',
      itemLegacyIds: [],
      featuredTitle: categoryBatches[0]?.items[0]?.title ?? 'لا توجد قصة متاحة حالياً.',
      featuredLesson: categoryBatches[0]?.items[0]?.lesson ?? null,
      summaryBatchCount: categoryBatches[0]?.summaryBatchCount ?? 1,
      summaryBatchSize: categoryBatches[0]?.summaryBatchSize ?? 1,
    }));
    for (const batch of categoryBatches.sort((left, right) => left.batchIndex - right.batchIndex)) {
      category = mergeCategoryWithSummaryBatch(category, batch);
    }
    return category;
  });
}

export async function loadStoryItemById(categorySlug: string, storyId: string): Promise<LoadedStoryItem | null> {
  const normalizedCategorySlug = categorySlug.trim();
  const normalizedStoryId = storyId.trim();
  if (!normalizedCategorySlug || !normalizedStoryId) return null;

  const cacheKey = getStoryCacheKey(normalizedCategorySlug, normalizedStoryId);
  const cached = storyCache.get(cacheKey);
  if (cached) return cloneStoryItem(cached);

  const manifestCategory = await getManifestCategoryBySlug(normalizedCategorySlug);
  if (!manifestCategory) return null;
  const batchIndex = findStorySummaryBatchIndex(manifestCategory, normalizedStoryId);
  const categoryLoaders = await loadCategoryItemLoaders(normalizedCategorySlug, batchIndex);
  const loader = categoryLoaders[normalizedStoryId];
  if (!loader) {
    throw new Error(`Missing story item loader for ${normalizedStoryId} in ${normalizedCategorySlug} batch ${batchIndex}.`);
  }

  const mod = await loader();
  const story = mod.STORY_ITEM ?? mod.default ?? null;
  if (!story) {
    throw new Error(`Invalid story item module for ${normalizedStoryId} in ${normalizedCategorySlug}.`);
  }

  storyCache.set(cacheKey, story);
  return cloneStoryItem(story);
}

function mergeHydratedStories(category: LoadedStoryCategory, hydratedStories: Map<string, LoadedStoryItem>): LoadedStoryCategory {
  return {
    ...cloneCategory(category),
    items: category.items.map((item) => hydratedStories.get(getStoryCacheKey(category.slug, item.id)) ?? cloneStoryItem(item)),
  };
}

export async function hydrateStoryItems(requests: StoryHydrationRequest[]): Promise<LoadedStoryItem[]> {
  const uniqueRequests = [...new Map(
    requests
      .map((request) => ({ categorySlug: request.categorySlug.trim(), storyId: request.storyId.trim() }))
      .filter((request) => request.categorySlug && request.storyId)
      .map((request) => [getStoryCacheKey(request.categorySlug, request.storyId), request]),
  ).values()];

  const items = await Promise.all(uniqueRequests.map((request) => loadStoryItemById(request.categorySlug, request.storyId)));
  return items.filter((item): item is LoadedStoryItem => Boolean(item));
}

export async function ensureAllStoryCategoriesLoaded(): Promise<LoadedStoryCategory[]> {
  const categories = await loadStoryCategorySummaries();
  const pendingCategories = categories.filter((category) => !fullyHydratedCategoryCache.has(category.slug));

  if (pendingCategories.length === 0) {
    return categories.map((category) => cloneCategory(fullyHydratedCategoryCache.get(category.slug) ?? category));
  }

  const summaryRequests = pendingCategories.flatMap((category) =>
    Array.from({ length: category.summaryBatchCount }, (_, batchIndex) => ({ categorySlug: category.slug, batchIndex })),
  );
  const categoriesWithSummaries = await hydrateStoryCategorySummaryBatches(summaryRequests);
  const requests = categoriesWithSummaries.flatMap((category) =>
    category.itemIds.map((storyId) => ({ categorySlug: category.slug, storyId })),
  );
  const hydratedItems = await hydrateStoryItems(requests);
  const hydratedMap = new Map(hydratedItems.map((item) => [getStoryCacheKey(item.categorySlug, item.id), item]));

  for (const category of categoriesWithSummaries) {
    fullyHydratedCategoryCache.set(category.slug, mergeHydratedStories(category, hydratedMap));
  }

  return categories.map((category) => cloneCategory(fullyHydratedCategoryCache.get(category.slug) ?? category));
}

export function filterLoadedStoryCategories(categories: LoadedStoryCategory[], query: string): LoadedStoryCategory[] {
  const normalizedQuery = normalizeQuery(query);
  if (!normalizedQuery) return categories;

  return categories.reduce<LoadedStoryCategory[]>((acc, category) => {
    const titleMatches = category.title.toLowerCase().includes(normalizedQuery);
    const filteredItems = titleMatches
      ? category.items
      : category.items.filter((item) =>
          [
            item.title,
            item.excerpt,
            item.lesson ?? '',
            item.source ?? '',
            item.categoryTitle,
            item.storyLoaded ? item.story : '',
          ].some((value) => value.toLowerCase().includes(normalizedQuery)),
        );

    if (!titleMatches && filteredItems.length === 0) return acc;

    acc.push({
      ...cloneCategory(category),
      itemCount: titleMatches ? category.itemCount : filteredItems.length,
      preview: filteredItems[0]?.excerpt ?? category.preview,
      itemIds: titleMatches ? [...category.itemIds] : filteredItems.map((item) => item.id),
      itemsLoaded: category.itemsLoaded,
      items: titleMatches ? category.items.map((item) => cloneStoryItem(item)) : filteredItems.map((item) => cloneStoryItem(item)),
    });
    return acc;
  }, []);
}

export async function loadStoriesSummary(): Promise<{ categoryCount: number; itemCount: number; featuredTitle: string; featuredLesson: string | null }> {
  const manifest = await loadStoryManifest();
  const itemCount = manifest.reduce((sum, category) => sum + category.itemCount, 0);
  return {
    categoryCount: manifest.length,
    itemCount,
    featuredTitle: manifest[0]?.featuredTitle ?? 'لا توجد قصة متاحة حالياً.',
    featuredLesson: manifest[0]?.featuredLesson ?? null,
  };
}
