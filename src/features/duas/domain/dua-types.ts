import type { LoadedDuaCategory, LoadedDuaItem } from '@/content/loaders/load-duas';

export interface PersistedDuasState {
  selectedCategorySlug: string | null;
  searchQuery: string;
  completedByDate: Record<string, string[]>;
  favoriteIds: string[];
  recentCategorySlugs: string[];
}

export interface DuasState extends PersistedDuasState {
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  categories: LoadedDuaCategory[];
}

export type DuaCategory = LoadedDuaCategory;
export type DuaItem = LoadedDuaItem;
