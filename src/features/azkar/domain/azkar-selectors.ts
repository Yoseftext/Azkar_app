import type { AzkarCategory, AzkarState } from '@/features/azkar/domain/azkar-types';
import { filterLoadedAzkarCategories } from '@/content/loaders/load-azkar';
import { countTrailingActiveDays, getLocalDateKey } from '@/shared/lib/date';

export function getVisibleAzkarCategories(state: AzkarState): AzkarCategory[] {
  return filterLoadedAzkarCategories(state.categories, state.searchQuery);
}

export function getSelectedAzkarCategory(state: AzkarState): AzkarCategory | null {
  const categories = getVisibleAzkarCategories(state);
  if (categories.length === 0) return null;

  const selected = categories.find((category) => category.slug === state.selectedCategorySlug);
  return selected ?? categories[0] ?? null;
}

export function getCompletedAzkarIdsForToday(state: AzkarState): Set<string> {
  return new Set(state.completedByDate[getLocalDateKey()] ?? []);
}

export function getAzkarCompletionCountForToday(state: AzkarState): number {
  return getCompletedAzkarIdsForToday(state).size;
}

export function getAzkarCategoryProgressForToday(state: AzkarState, categorySlug: string): { completed: number; total: number } {
  const category = state.categories.find((item) => item.slug === categorySlug);
  if (!category) return { completed: 0, total: 0 };

  const completedSet = getCompletedAzkarIdsForToday(state);
  const completed = category.items.filter((item) => completedSet.has(item.id)).length;
  return { completed, total: category.items.length };
}

export function getAzkarActiveStreak(state: Pick<AzkarState, 'completedByDate'>): number {
  const activeDays = Object.entries(state.completedByDate)
    .filter(([, ids]) => ids.length > 0)
    .map(([dateKey]) => dateKey);

  return countTrailingActiveDays(activeDays);
}
