import type { AllahNameItem, NamesOfAllahState } from '@/features/names-of-allah/domain/name-types';
import { getNameOfTheDay } from '@/features/names-of-allah/domain/name-selectors';
import { getLocalDateKey } from '@/shared/lib/date';

export interface NameOfTheDayModel {
  id: string;
  title: string;
  body: string;
  isCompletedToday: boolean;
}

export interface NameReviewQueueItem {
  id: string;
  name: string;
  hint: string;
}

export function buildNameOfTheDay(state: NamesOfAllahState): NameOfTheDayModel | null {
  const item = getNameOfTheDay(state);
  if (!item) return null;
  const completedToday = new Set(state.completedByDate[getLocalDateKey()] ?? []);

  return {
    id: item.id,
    title: item.name,
    body: item.description,
    isCompletedToday: completedToday.has(item.id),
  };
}

function mapRecentItems(state: NamesOfAllahState): AllahNameItem[] {
  return state.recentNameIds
    .map((id) => state.items.find((item) => item.id === id))
    .filter((item): item is AllahNameItem => Boolean(item));
}

function mapFavoriteItems(state: NamesOfAllahState): AllahNameItem[] {
  return state.favoriteIds
    .map((id) => state.items.find((item) => item.id === id))
    .filter((item): item is AllahNameItem => Boolean(item));
}

export function buildNamesReviewQueue(state: NamesOfAllahState): NameReviewQueueItem[] {
  const queue: NameReviewQueueItem[] = [];
  const seen = new Set<string>();
  const push = (item: AllahNameItem | null, hint: string) => {
    if (!item || seen.has(item.id)) return;
    seen.add(item.id);
    queue.push({ id: item.id, name: item.name, hint });
  };

  const todayItem = getNameOfTheDay(state);
  for (const item of mapRecentItems(state).slice(0, 2)) push(item, 'آخر اسم فتحته');
  for (const item of mapFavoriteItems(state).slice(0, 2)) push(item, 'من المفضلة');
  push(todayItem, 'اسم اليوم');
  push(state.selectedNameId ? state.items.find((item) => item.id === state.selectedNameId) ?? null : null, 'مفتوح الآن');
  push(state.items.find((item) => !seen.has(item.id)) ?? null, 'للتوسعة');

  return queue.slice(0, 4);
}
