import { create } from 'zustand';
import { loadAzkarCategories } from '@/content/loaders/load-azkar';
import type { AzkarCategory, AzkarState, PersistedAzkarState } from '@/features/azkar/domain/azkar-types';
import { LocalStorageEngine } from '@/kernel/storage/local-storage-engine';
import { STORAGE_KEYS } from '@/kernel/storage/storage-keys';
import { getLocalDateKey, trimRecordToRecentDays } from '@/shared/lib/date';

interface AzkarStore extends AzkarState {
  initialize: () => void;
  ensureLoaded: () => Promise<void>;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (slug: string) => void;
  toggleItemCompleted: (itemId: string) => void;
  resetTodayProgress: () => void;
}

const storage = new LocalStorageEngine();

const fallbackPersistedState: PersistedAzkarState = {
  selectedCategorySlug: null,
  searchQuery: '',
  completedByDate: {},
  recentCategorySlugs: [],
};

const fallbackState: AzkarState = {
  ...fallbackPersistedState,
  isInitialized: false,
  isLoading: false,
  error: null,
  categories: [],
};

function normalizePersistedState(rawValue: PersistedAzkarState | null): PersistedAzkarState {
  if (!rawValue) return fallbackPersistedState;

  const safeCompletedByDate = trimRecordToRecentDays(
    Object.fromEntries(
      Object.entries(rawValue.completedByDate ?? {}).map(([dateKey, ids]) => [dateKey, [...new Set(Array.isArray(ids) ? ids.filter(Boolean) : [])]]),
    ),
    180,
  );

  return {
    selectedCategorySlug: rawValue.selectedCategorySlug ? String(rawValue.selectedCategorySlug) : null,
    searchQuery: String(rawValue.searchQuery ?? ''),
    completedByDate: safeCompletedByDate,
    recentCategorySlugs: Array.isArray(rawValue.recentCategorySlugs)
      ? [...new Set(rawValue.recentCategorySlugs.map((item) => String(item).trim()).filter(Boolean))].slice(0, 6)
      : [],
  };
}

function persist(state: AzkarState): void {
  const payload: PersistedAzkarState = {
    selectedCategorySlug: state.selectedCategorySlug,
    searchQuery: state.searchQuery,
    completedByDate: trimRecordToRecentDays(state.completedByDate, 180),
    recentCategorySlugs: state.recentCategorySlugs.slice(0, 6),
  };

  storage.setItem(STORAGE_KEYS.azkar, payload);
}

function chooseSelectedCategorySlug(categories: AzkarCategory[], preferredSlug: string | null): string | null {
  if (categories.length === 0) return null;
  if (preferredSlug && categories.some((category) => category.slug === preferredSlug)) return preferredSlug;
  return categories[0]?.slug ?? null;
}

export const useAzkarStore = create<AzkarStore>((set, get) => ({
  ...fallbackState,
  initialize: () => {
    if (get().isInitialized) return;
    const stored = storage.getItem<PersistedAzkarState>(STORAGE_KEYS.azkar);
    set({ ...fallbackState, ...normalizePersistedState(stored), isInitialized: true });
  },
  ensureLoaded: async () => {
    const state = get();
    if (state.isLoading || state.categories.length > 0) return;

    set({ isLoading: true, error: null });

    try {
      const categories = await loadAzkarCategories();
      const currentState = get();
      const nextState: AzkarState = {
        ...currentState,
        isLoading: false,
        error: null,
        categories,
        selectedCategorySlug: chooseSelectedCategorySlug(categories, currentState.selectedCategorySlug),
      };

      persist(nextState);
      set(nextState);
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'تعذر تحميل الأذكار.',
      });
    }
  },
  setSearchQuery: (query) => {
    const nextState = { ...get(), searchQuery: query };
    persist(nextState);
    set(nextState);
  },
  setSelectedCategory: (slug) => {
    const normalizedSlug = slug.trim();
    if (!normalizedSlug) return;

    const state = get();
    const nextState = {
      ...state,
      selectedCategorySlug: normalizedSlug,
      recentCategorySlugs: [normalizedSlug, ...state.recentCategorySlugs.filter((item) => item !== normalizedSlug)].slice(0, 6),
    };

    persist(nextState);
    set(nextState);
  },
  toggleItemCompleted: (itemId) => {
    const normalizedItemId = itemId.trim();
    if (!normalizedItemId) return;

    const state = get();
    const todayKey = getLocalDateKey();
    const completed = new Set(state.completedByDate[todayKey] ?? []);

    if (completed.has(normalizedItemId)) {
      completed.delete(normalizedItemId);
    } else {
      completed.add(normalizedItemId);
    }

    const nextState = {
      ...state,
      completedByDate: {
        ...state.completedByDate,
        [todayKey]: [...completed],
      },
    };

    persist(nextState);
    set(nextState);
  },
  resetTodayProgress: () => {
    const state = get();
    const todayKey = getLocalDateKey();
    const nextState = {
      ...state,
      completedByDate: {
        ...state.completedByDate,
        [todayKey]: [],
      },
    };

    persist(nextState);
    set(nextState);
  },
}));
