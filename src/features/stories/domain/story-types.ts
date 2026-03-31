import type { LoadedStoryCategory, LoadedStoryItem } from '@/content/loaders/load-stories';

export type StoryCategory = LoadedStoryCategory;
export type StoryItem = LoadedStoryItem;

export interface PersistedStoriesState {
  searchQuery: string;
  selectedCategorySlug: string | null;
  selectedStoryId: string | null;
  completedByDate: Record<string, string[]>;
  favoriteIds: string[];
  recentCategorySlugs: string[];
  recentStoryIds: string[];
}

export interface StoriesState extends PersistedStoriesState {
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  categories: StoryCategory[];
}
