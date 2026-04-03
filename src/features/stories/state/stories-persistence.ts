import { LocalStorageEngine } from '@/kernel/storage/local-storage-engine';
import { STORAGE_KEYS } from '@/kernel/storage/storage-keys';
import { trimRecordToRecentDays } from '@/shared/lib/date';
import type { PersistedStoriesState, StoriesState } from '@/features/stories/domain/story-types';

const storage = new LocalStorageEngine();

export const FALLBACK_PERSISTED_STORIES_STATE: PersistedStoriesState = {
  searchQuery: '',
  selectedCategorySlug: null,
  selectedStoryId: null,
  completedByDate: {},
  favoriteIds: [],
  recentCategorySlugs: [],
  recentStoryIds: [],
};

export const FALLBACK_STORIES_STATE: StoriesState = {
  ...FALLBACK_PERSISTED_STORIES_STATE,
  isInitialized: false,
  isLoading: false,
  error: null,
  categories: [],
};

export function normalizePersistedStoriesState(rawValue: PersistedStoriesState | null): PersistedStoriesState {
  if (!rawValue) return FALLBACK_PERSISTED_STORIES_STATE;

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

export function loadPersistedStoriesState(): PersistedStoriesState {
  return normalizePersistedStoriesState(storage.getItem<PersistedStoriesState>(STORAGE_KEYS.stories));
}

export function persistStoriesState(state: StoriesState): void {
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
