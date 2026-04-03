import { getDayIndex } from '@/shared/lib/date';
import { compareSearchRank, normalizeSearchTerm, scoreSearchMatch } from '@/shared/lib/search';

interface LegacyAllahName {
  name: string;
  desc: string;
}

interface LegacyAllahNamesPayload {
  ar: LegacyAllahName[];
}

export interface LoadedAllahName {
  id: string;
  order: number;
  name: string;
  description: string;
  normalizedSearch: string;
}

let namesPromise: Promise<LoadedAllahName[]> | null = null;

function normalizeSearchValue(value: string): string {
  return normalizeSearchTerm(value);
}

export function normalizeAllahName(item: Partial<LegacyAllahName> | null | undefined, index: number): LoadedAllahName {
  const name = String(item?.name ?? '').trim() || `الاسم ${index + 1}`;
  const description = String(item?.desc ?? '').trim() || 'لا يوجد وصف متاح حالياً.';

  return {
    id: `allah-name-${index + 1}`,
    order: index + 1,
    name,
    description,
    normalizedSearch: normalizeSearchValue(`${name} ${description} ${index + 1}`),
  };
}

export function normalizeAllahNamesPayload(payload: Partial<LegacyAllahNamesPayload> | null | undefined): LoadedAllahName[] {
  const items = Array.isArray(payload?.ar) ? payload.ar : [];
  return items.map((item, index) => normalizeAllahName(item, index));
}

async function readLegacyNamesPayload(): Promise<LegacyAllahNamesPayload> {
  const module = await import('@/content/sources/names.js');
  return module.ALLAH_NAMES as LegacyAllahNamesPayload;
}

export async function loadAllahNames(): Promise<LoadedAllahName[]> {
  if (!namesPromise) {
    namesPromise = readLegacyNamesPayload().then((payload) => normalizeAllahNamesPayload(payload));
  }

  return namesPromise;
}

export function filterLoadedAllahNames(items: LoadedAllahName[], query: string): LoadedAllahName[] {
  const normalizedQuery = normalizeSearchValue(query);
  if (!normalizedQuery) return items;

  return items
    .map((item) => ({
      item,
      score: Math.max(
        scoreSearchMatch(normalizedQuery, item.name),
        scoreSearchMatch(normalizedQuery, item.description),
        scoreSearchMatch(normalizedQuery, String(item.order)),
        scoreSearchMatch(normalizedQuery, item.normalizedSearch),
      ),
    }))
    .filter((entry) => entry.score > 0)
    .sort((left, right) => compareSearchRank({ score: left.score, value: left.item }, { score: right.score, value: right.item }, (a, b) => a.order - b.order))
    .map((entry) => entry.item);
}

export async function loadAllahNamesSummary(): Promise<{ total: number; nameOfTheDay: LoadedAllahName | null }> {
  const items = await loadAllahNames();
  return {
    total: items.length,
    nameOfTheDay: getNameOfTheDayFromItems(items),
  };
}

export function getNameOfTheDayFromItems(items: LoadedAllahName[]): LoadedAllahName | null {
  if (items.length === 0) return null;
  return items[getDayIndex(99) % items.length] ?? items[0] ?? null;
}
