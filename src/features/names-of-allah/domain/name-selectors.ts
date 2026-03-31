import { filterLoadedAllahNames, getNameOfTheDayFromItems } from '@/content/loaders/load-names';
import type { NamesOfAllahState } from '@/features/names-of-allah/domain/name-types';
import { countTrailingActiveDays, getLocalDateKey } from '@/shared/lib/date';

export function getVisibleAllahNames(state: NamesOfAllahState) {
  return filterLoadedAllahNames(state.items, state.searchQuery);
}

export function getSelectedAllahName(state: NamesOfAllahState) {
  const visibleItems = getVisibleAllahNames(state);
  if (visibleItems.length === 0) return null;

  if (state.selectedNameId) {
    return visibleItems.find((item) => item.id === state.selectedNameId) ?? visibleItems[0] ?? null;
  }

  return visibleItems[0] ?? null;
}

export function getNameOfTheDay(state: NamesOfAllahState) {
  return getNameOfTheDayFromItems(state.items);
}

export function getCompletedAllahNameIdsForToday(state: NamesOfAllahState): Set<string> {
  return new Set(state.completedByDate[getLocalDateKey()] ?? []);
}

export function getNamesCompletedCountForToday(state: NamesOfAllahState): number {
  return getCompletedAllahNameIdsForToday(state).size;
}

export function getFavoriteAllahNameIds(state: NamesOfAllahState): Set<string> {
  return new Set(state.favoriteIds);
}

export function getFavoriteAllahNameCount(state: NamesOfAllahState): number {
  return state.favoriteIds.length;
}

export function getNamesActiveStreak(state: NamesOfAllahState): number {
  const activeDays = Object.entries(state.completedByDate)
    .filter(([, ids]) => ids.length > 0)
    .map(([dateKey]) => dateKey);

  return countTrailingActiveDays(activeDays);
}
