import type { LoadedZikrCategory, LoadedZikrItem } from '@/content/loaders/load-azkar';

export interface PersistedAzkarState {
  selectedCategorySlug: string | null;
  searchQuery: string;
  completedByDate: Record<string, string[]>;
  recentCategorySlugs: string[];
}

export interface AzkarState extends PersistedAzkarState {
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  categories: LoadedZikrCategory[];
}

export type AzkarCategory = LoadedZikrCategory;
export type AzkarItem = LoadedZikrItem;
