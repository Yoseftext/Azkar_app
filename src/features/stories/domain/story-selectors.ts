import { filterLoadedStoryCategories } from '@/content/loaders/load-stories';
import type { StoriesState } from '@/features/stories/domain/story-types';
import { countTrailingActiveDays, getLocalDateKey } from '@/shared/lib/date';
export function getVisibleStoryCategories(state: StoriesState) { return filterLoadedStoryCategories(state.categories, state.searchQuery); }
export function getSelectedStoryCategory(state: StoriesState) { const visibleCategories=getVisibleStoryCategories(state); if(visibleCategories.length===0) return null; return visibleCategories.find((category)=>category.slug===state.selectedCategorySlug) ?? visibleCategories[0] ?? null; }
export function getSelectedStory(state: StoriesState) { const category=getSelectedStoryCategory(state); if(!category || !category.itemsLoaded) return null; if(state.selectedStoryId) return category.items.find((item)=>item.id===state.selectedStoryId) ?? category.items[0] ?? null; return category.items[0] ?? null; }
export function getReadStoryIdsForToday(state: StoriesState): Set<string> { return new Set(state.completedByDate[getLocalDateKey()] ?? []); }
export function getStoryCompletionCountForToday(state: StoriesState): number { return getReadStoryIdsForToday(state).size; }
export function getFavoriteStoryIds(state: StoriesState): Set<string> { return new Set(state.favoriteIds); }
export function getFavoriteStoryCount(state: StoriesState): number { return state.favoriteIds.length; }
export function getStoriesActiveStreak(state: StoriesState): number { const activeDays=Object.entries(state.completedByDate).filter(([,ids])=>ids.length>0).map(([dateKey])=>dateKey); return countTrailingActiveDays(activeDays); }
export function getStoryCategoryProgressForToday(state: StoriesState, categorySlug: string): { completed: number; total: number } { const category=state.categories.find((item)=>item.slug===categorySlug); if(!category) return { completed:0, total:0 }; const completedSet=getReadStoryIdsForToday(state); return { completed: category.itemIds.filter((itemId)=>completedSet.has(itemId)).length, total: category.itemCount }; }
