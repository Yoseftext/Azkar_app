import type { LoadedZikrCategory, LoadedZikrItem } from '@/content/loaders/load-azkar';
import type { LoadedDuaCategory, LoadedDuaItem } from '@/content/loaders/load-duas';
import type { LoadedStoryCategory, LoadedStoryItem } from '@/content/loaders/load-stories';

export function makeAzkarItem(overrides: Partial<LoadedZikrItem> & Pick<LoadedZikrItem, 'id' | 'text'>): LoadedZikrItem {
  return {
    id: overrides.id,
    legacyId: overrides.legacyId ?? 1,
    categorySlug: overrides.categorySlug ?? 'azkar-category-default',
    categoryTitle: overrides.categoryTitle ?? 'فئة افتراضية',
    text: overrides.text,
    reference: overrides.reference ?? undefined,
    repeatTarget: overrides.repeatTarget ?? 1,
  };
}

export function makeAzkarCategory(
  overrides: Partial<LoadedZikrCategory> & Pick<LoadedZikrCategory, 'slug' | 'title' | 'items'>,
): LoadedZikrCategory {
  return {
    slug: overrides.slug,
    title: overrides.title,
    itemCount: overrides.itemCount ?? overrides.items.length,
    items: overrides.items,
  };
}

export function makeDuaItem(overrides: Partial<LoadedDuaItem> & Pick<LoadedDuaItem, 'id' | 'text'>): LoadedDuaItem {
  return {
    id: overrides.id,
    text: overrides.text,
    source: overrides.source ?? null,
    reference: overrides.reference ?? null,
    description: overrides.description ?? null,
    originalCategory: overrides.originalCategory ?? null,
    repeatTarget: overrides.repeatTarget ?? null,
    categorySlug: overrides.categorySlug ?? 'dua-category-default',
    categoryTitle: overrides.categoryTitle ?? 'فئة افتراضية',
  };
}

export function makeDuaCategory(
  overrides: Partial<LoadedDuaCategory> & Pick<LoadedDuaCategory, 'slug' | 'title' | 'items'>,
): LoadedDuaCategory {
  const items = overrides.items;
  return {
    slug: overrides.slug,
    title: overrides.title,
    itemsLoaded: overrides.itemsLoaded ?? true,
    items,
    itemIds: overrides.itemIds ?? items.map((item) => item.id),
    itemCount: overrides.itemCount ?? items.length,
    sources: overrides.sources ?? [...new Set(items.map((item) => item.source).filter((source): source is string => Boolean(source)))],
  };
}

export function makeStoryItem(overrides: Partial<LoadedStoryItem> & Pick<LoadedStoryItem, 'id' | 'title'>): LoadedStoryItem {
  return {
    id: overrides.id,
    legacyId: overrides.legacyId ?? 1,
    title: overrides.title,
    story: overrides.story ?? null,
    lesson: overrides.lesson ?? null,
    source: overrides.source ?? null,
    excerpt: overrides.excerpt ?? 'ملخص القصة',
    categorySlug: overrides.categorySlug ?? 'story-category-default',
    categoryTitle: overrides.categoryTitle ?? 'فئة افتراضية',
    storyLoaded: overrides.storyLoaded ?? true,
  };
}

export function makeStoryCategory(
  overrides: Partial<LoadedStoryCategory> & Pick<LoadedStoryCategory, 'slug' | 'title' | 'items'>,
): LoadedStoryCategory {
  const items = overrides.items;
  return {
    slug: overrides.slug,
    title: overrides.title,
    preview: overrides.preview ?? 'ملخص الفئة',
    itemsLoaded: overrides.itemsLoaded ?? true,
    itemCount: overrides.itemCount ?? items.length,
    itemIds: overrides.itemIds ?? items.map((item) => item.id),
    summaryBatchCount: overrides.summaryBatchCount ?? 1,
    summaryBatchSize: overrides.summaryBatchSize ?? (items.length || 1),
    loadedSummaryBatchIndexes: overrides.loadedSummaryBatchIndexes ?? [0],
    items,
  };
}

import type { QuranAyah } from '@/content/loaders/load-quran';
import type { QuranBookmark } from '@/features/quran/domain/quran-types';

export function makeQuranBookmark(overrides: Partial<QuranBookmark> & Pick<QuranBookmark, 'surahNumber' | 'surahName'>): QuranBookmark {
  return {
    surahNumber: overrides.surahNumber,
    surahName: overrides.surahName,
    verseCount: overrides.verseCount ?? 7,
    updatedAt: overrides.updatedAt ?? '2026-03-31T08:00:00.000Z',
  };
}

export function makeQuranAyah(overrides: Partial<QuranAyah> & Pick<QuranAyah, 'chapter' | 'verse' | 'text'>): QuranAyah {
  return {
    chapter: overrides.chapter,
    verse: overrides.verse,
    text: overrides.text,
  };
}
