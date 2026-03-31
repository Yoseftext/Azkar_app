import { create } from 'zustand';
import { filterLoadedAllahNames, loadAllahNames } from '@/content/loaders/load-names';
import type { NamesOfAllahState, PersistedNamesState } from '@/features/names-of-allah/domain/name-types';
import { LocalStorageEngine } from '@/kernel/storage/local-storage-engine';
import { STORAGE_KEYS } from '@/kernel/storage/storage-keys';
import { getLocalDateKey, trimRecordToRecentDays } from '@/shared/lib/date';

interface NamesOfAllahStore extends NamesOfAllahState {
  initialize: () => void;
  ensureLoaded: () => Promise<void>;
  setSearchQuery: (query: string) => void;
  setSelectedName: (nameId: string) => void;
  toggleCompleted: (nameId: string) => void;
  toggleFavorite: (nameId: string) => void;
  resetTodayProgress: () => void;
}

const storage = new LocalStorageEngine();

const fallbackPersistedState: PersistedNamesState = {
  searchQuery: '',
  selectedNameId: null,
  completedByDate: {},
  favoriteIds: [],
  recentNameIds: [],
};

const fallbackState: NamesOfAllahState = {
  ...fallbackPersistedState,
  isInitialized: false,
  isLoading: false,
  error: null,
  items: [],
};

function normalizePersistedState(rawValue: PersistedNamesState | null): PersistedNamesState {
  if (!rawValue) return fallbackPersistedState;

  const completedByDate = trimRecordToRecentDays(
    Object.fromEntries(
      Object.entries(rawValue.completedByDate ?? {}).map(([dateKey, ids]) => [dateKey, [...new Set(Array.isArray(ids) ? ids.map((item) => String(item).trim()).filter(Boolean) : [])]]),
    ),
    180,
  );

  return {
    searchQuery: String(rawValue.searchQuery ?? ''),
    selectedNameId: rawValue.selectedNameId ? String(rawValue.selectedNameId) : null,
    completedByDate,
    favoriteIds: Array.isArray(rawValue.favoriteIds) ? [...new Set(rawValue.favoriteIds.map((item) => String(item).trim()).filter(Boolean))].slice(0, 99) : [],
    recentNameIds: Array.isArray(rawValue.recentNameIds) ? [...new Set(rawValue.recentNameIds.map((item) => String(item).trim()).filter(Boolean))].slice(0, 12) : [],
  };
}

function persist(state: NamesOfAllahState): void {
  const payload: PersistedNamesState = {
    searchQuery: state.searchQuery,
    selectedNameId: state.selectedNameId,
    completedByDate: trimRecordToRecentDays(state.completedByDate, 180),
    favoriteIds: state.favoriteIds.slice(0, 99),
    recentNameIds: state.recentNameIds.slice(0, 12),
  };

  storage.setItem(STORAGE_KEYS.names, payload);
}

function chooseSelectedNameId(items: NamesOfAllahState['items'], preferredId: string | null): string | null {
  if (items.length === 0) return null;
  if (preferredId && items.some((item) => item.id === preferredId)) return preferredId;
  return items[0]?.id ?? null;
}

export const useNamesOfAllahStore = create<NamesOfAllahStore>((set, get) => ({
  ...fallbackState,
  initialize: () => {
    if (get().isInitialized) return;
    const stored = storage.getItem<PersistedNamesState>(STORAGE_KEYS.names);
    set({ ...fallbackState, ...normalizePersistedState(stored), isInitialized: true });
  },
  ensureLoaded: async () => {
    const state = get();
    if (state.isLoading || state.items.length > 0) return;

    set({ isLoading: true, error: null });

    try {
      const items = await loadAllahNames();
      const currentState = get();
      const nextState: NamesOfAllahState = {
        ...currentState,
        isLoading: false,
        error: null,
        items,
        selectedNameId: chooseSelectedNameId(items, currentState.selectedNameId),
      };

      persist(nextState);
      set(nextState);
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'تعذر تحميل أسماء الله الحسنى حالياً.',
      });
    }
  },
  setSearchQuery: (query) => {
    const state = get();
    const visible = filterLoadedAllahNames(state.items, query);
    const nextState = {
      ...state,
      searchQuery: query,
      selectedNameId: visible.some((item) => item.id === state.selectedNameId) ? state.selectedNameId : (visible[0]?.id ?? state.selectedNameId),
    };
    persist(nextState);
    set(nextState);
  },
  setSelectedName: (nameId) => {
    const normalizedNameId = nameId.trim();
    if (!normalizedNameId) return;

    const state = get();
    const nextState = {
      ...state,
      selectedNameId: normalizedNameId,
      recentNameIds: [normalizedNameId, ...state.recentNameIds.filter((item) => item !== normalizedNameId)].slice(0, 12),
    };

    persist(nextState);
    set(nextState);
  },
  toggleCompleted: (nameId) => {
    const normalizedNameId = nameId.trim();
    if (!normalizedNameId) return;

    const state = get();
    const todayKey = getLocalDateKey();
    const completed = new Set(state.completedByDate[todayKey] ?? []);
    if (completed.has(normalizedNameId)) completed.delete(normalizedNameId);
    else completed.add(normalizedNameId);

    const nextState = {
      ...state,
      completedByDate: trimRecordToRecentDays({
        ...state.completedByDate,
        [todayKey]: [...completed],
      }, 180),
      recentNameIds: [normalizedNameId, ...state.recentNameIds.filter((item) => item !== normalizedNameId)].slice(0, 12),
    };

    persist(nextState);
    set(nextState);
  },
  toggleFavorite: (nameId) => {
    const normalizedNameId = nameId.trim();
    if (!normalizedNameId) return;

    const state = get();
    const favorites = new Set(state.favoriteIds);
    if (favorites.has(normalizedNameId)) favorites.delete(normalizedNameId);
    else favorites.add(normalizedNameId);

    const nextState = {
      ...state,
      favoriteIds: [...favorites].slice(0, 99),
      recentNameIds: [normalizedNameId, ...state.recentNameIds.filter((item) => item !== normalizedNameId)].slice(0, 12),
    };

    persist(nextState);
    set(nextState);
  },
  resetTodayProgress: () => {
    const state = get();
    const todayKey = getLocalDateKey();
    const nextState = {
      ...state,
      completedByDate: trimRecordToRecentDays({
        ...state.completedByDate,
        [todayKey]: [],
      }, 180),
    };

    persist(nextState);
    set(nextState);
  },
}));
