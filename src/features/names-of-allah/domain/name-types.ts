import type { LoadedAllahName } from '@/content/loaders/load-names';

export interface PersistedNamesState {
  searchQuery: string;
  selectedNameId: string | null;
  completedByDate: Record<string, string[]>;
  favoriteIds: string[];
  recentNameIds: string[];
}

export interface NamesOfAllahState extends PersistedNamesState {
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  items: LoadedAllahName[];
}

export type AllahNameItem = LoadedAllahName;
