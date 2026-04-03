import type { DuaCategory, DuasState } from '@/features/duas/domain/dua-types';
import { getDuaCategoryProgressForToday } from '@/features/duas/domain/dua-selectors';
import { getDayIndex } from '@/shared/lib/date';

export interface DuaHeroModel {
  slug: string;
  title: string;
  body: string;
  progressLabel: string;
}

export interface DuaQuickAccessItem {
  slug: string;
  title: string;
  hint: string;
}

function getDailyCategory(categories: DuaCategory[]): DuaCategory | null {
  if (categories.length === 0) return null;
  return categories[getDayIndex(41) % categories.length] ?? categories[0] ?? null;
}

function getFavoriteDrivenCategory(state: DuasState): DuaCategory | null {
  if (state.favoriteIds.length === 0) return null;

  let bestCategory: DuaCategory | null = null;
  let bestScore = 0;
  for (const category of state.categories) {
    const favoriteCount = category.itemIds.filter((itemId) => state.favoriteIds.includes(itemId)).length;
    if (favoriteCount > bestScore) {
      bestScore = favoriteCount;
      bestCategory = category;
    }
  }

  return bestCategory;
}

export function buildDuaHero(state: DuasState): DuaHeroModel | null {
  const preferred = state.recentCategorySlugs
    .map((slug) => state.categories.find((category) => category.slug === slug))
    .find((category): category is DuaCategory => Boolean(category))
    ?? getDailyCategory(state.categories);

  if (!preferred) return null;

  const progress = getDuaCategoryProgressForToday(state, preferred.slug);
  const incomplete = progress.completed < progress.total;

  return {
    slug: preferred.slug,
    title: incomplete ? `أكمل ${preferred.title}` : `دعاء اليوم: ${preferred.title}`,
    body: incomplete
      ? `أنجزت ${progress.completed} من ${progress.total} في هذه الفئة اليوم. أكملها الآن بخطوات قصيرة.`
      : preferred.preview,
    progressLabel: `${progress.completed}/${progress.total} اليوم`,
  };
}

export function buildDuaQuickAccess(state: DuasState): DuaQuickAccessItem[] {
  const items: DuaQuickAccessItem[] = [];
  const seen = new Set<string>();
  const push = (category: DuaCategory | null, hint: string) => {
    if (!category || seen.has(category.slug)) return;
    seen.add(category.slug);
    const progress = getDuaCategoryProgressForToday(state, category.slug);
    items.push({
      slug: category.slug,
      title: category.title,
      hint: `${hint} • ${progress.completed}/${progress.total}`,
    });
  };

  push(state.selectedCategorySlug ? state.categories.find((category) => category.slug === state.selectedCategorySlug) ?? null : null, 'الفئة الحالية');
  push(state.recentCategorySlugs.map((slug) => state.categories.find((category) => category.slug === slug)).find((category): category is DuaCategory => Boolean(category)) ?? null, 'الأحدث');
  push(getFavoriteDrivenCategory(state), 'من المفضلة');
  push(getDailyCategory(state.categories), 'دعاء اليوم');

  return items.slice(0, 4);
}
