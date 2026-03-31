import { filterLoadedDuaCategories } from '@/content/loaders/load-duas';
import type { DuaCategory, DuasState } from '@/features/duas/domain/dua-types';
import { countTrailingActiveDays, getLocalDateKey } from '@/shared/lib/date';
export function getVisibleDuaCategories(state: DuasState): DuaCategory[] { return filterLoadedDuaCategories(state.categories, state.searchQuery); }
export function getSelectedDuaCategory(state: DuasState): DuaCategory | null { const categories=getVisibleDuaCategories(state); if(categories.length===0) return null; return categories.find((category)=>category.slug===state.selectedCategorySlug) ?? categories[0] ?? null; }
export function getCompletedDuaIdsForToday(state: DuasState): Set<string> { return new Set(state.completedByDate[getLocalDateKey()] ?? []); }
export function getDuaCompletionCountForToday(state: DuasState): number { return getCompletedDuaIdsForToday(state).size; }
export function getFavoriteDuaIds(state: DuasState): Set<string> { return new Set(state.favoriteIds); }
export function getFavoriteDuaCount(state: Pick<DuasState,'favoriteIds'>): number { return state.favoriteIds.length; }
export function getDuaCategoryProgressForToday(state: DuasState, categorySlug: string): { completed: number; total: number } { const category=state.categories.find((item)=>item.slug===categorySlug); if(!category) return { completed:0, total:0 }; const completedSet=getCompletedDuaIdsForToday(state); return { completed: category.itemIds.filter((itemId)=>completedSet.has(itemId)).length, total: category.itemCount }; }
export function getDuasActiveStreak(state: Pick<DuasState,'completedByDate'>): number { const activeDays=Object.entries(state.completedByDate).filter(([,ids])=>ids.length>0).map(([dateKey])=>dateKey); return countTrailingActiveDays(activeDays); }
