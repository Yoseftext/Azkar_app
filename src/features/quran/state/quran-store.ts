import { create } from 'zustand';
import { getSurahMetaByNumber, loadSurahAyahs } from '@/content/loaders/load-quran';
import { LocalStorageEngine } from '@/kernel/storage/local-storage-engine';
import { STORAGE_KEYS } from '@/kernel/storage/storage-keys';
import { getLocalDateKey, trimRecordToRecentDays } from '@/shared/lib/date';
import type { PersistedQuranState, QuranBookmark, QuranState } from '@/features/quran/domain/quran-types';

interface QuranStore extends QuranState {
  initialize: () => void;
  setSearchQuery: (query: string) => void;
  openSurah: (surahNumber: number) => Promise<void>;
  closeReader: () => void;
  resumeBookmark: () => Promise<void>;
  clearBookmark: () => void;
}

const storage = new LocalStorageEngine();

const fallbackState: QuranState = {
  isInitialized: false,
  isLoading: false,
  error: null,
  activeSurahNumber: null,
  activeSurahName: null,
  activeVerses: [],
  searchQuery: '',
  bookmark: null,
  recentSurahNumbers: [],
  dailyReadings: {},
};

function normalizeBookmark(rawValue: QuranBookmark | null | undefined): QuranBookmark | null {
  if (!rawValue) return null;

  const surahNumber = Number(rawValue.surahNumber);
  const surahMeta = getSurahMetaByNumber(surahNumber);
  if (!surahMeta) return null;

  return {
    surahNumber,
    surahName: String(rawValue.surahName || surahMeta.surahName).trim() || surahMeta.surahName,
    verseCount: Number.isFinite(rawValue.verseCount) && Number(rawValue.verseCount) > 0 ? Math.floor(Number(rawValue.verseCount)) : surahMeta.verseCount,
    updatedAt: String(rawValue.updatedAt || new Date().toISOString()),
  };
}

function normalizePersistedState(rawValue: PersistedQuranState | null): PersistedQuranState {
  if (!rawValue) {
    return {
      bookmark: null,
      recentSurahNumbers: [],
      dailyReadings: {},
    };
  }

  const recentSurahNumbers = Array.isArray(rawValue.recentSurahNumbers)
    ? [...new Set(rawValue.recentSurahNumbers.map((value) => Number(value)).filter((value) => Number.isFinite(value) && value > 0 && value <= 114))].slice(0, 8)
    : [];

  const dailyReadings = trimRecordToRecentDays(
    Object.fromEntries(
      Object.entries(rawValue.dailyReadings ?? {}).map(([dateKey, surahNumbers]) => [
        dateKey,
        [...new Set(Array.isArray(surahNumbers) ? surahNumbers.map((value) => Number(value)).filter((value) => Number.isFinite(value) && value > 0 && value <= 114) : [])],
      ]),
    ),
    180,
  );

  return {
    bookmark: normalizeBookmark(rawValue.bookmark),
    recentSurahNumbers,
    dailyReadings,
  };
}

function persist(state: QuranState): void {
  const payload: PersistedQuranState = {
    bookmark: state.bookmark,
    recentSurahNumbers: state.recentSurahNumbers.slice(0, 8),
    dailyReadings: trimRecordToRecentDays(state.dailyReadings, 180),
  };

  storage.setItem(STORAGE_KEYS.quran, payload);
}

export const useQuranStore = create<QuranStore>((set, get) => ({
  ...fallbackState,
  initialize: () => {
    if (get().isInitialized) return;
    const stored = storage.getItem<PersistedQuranState>(STORAGE_KEYS.quran);
    const normalized = normalizePersistedState(stored);
    set({ ...normalized, isInitialized: true });
  },
  setSearchQuery: (query) => {
    set({ searchQuery: query });
  },
  openSurah: async (surahNumber) => {
    const state = get();
    set({ isLoading: true, error: null });

    try {
      const { surah, ayahs } = await loadSurahAyahs(surahNumber);
      const todayKey = getLocalDateKey();
      const todayReadings = new Set(state.dailyReadings[todayKey] ?? []);
      todayReadings.add(surah.surahNumber);

      const nextState: QuranState = {
        ...state,
        isLoading: false,
        error: null,
        activeSurahNumber: surah.surahNumber,
        activeSurahName: surah.surahName,
        activeVerses: ayahs,
        bookmark: {
          surahNumber: surah.surahNumber,
          surahName: surah.surahName,
          verseCount: surah.verseCount,
          updatedAt: new Date().toISOString(),
        },
        recentSurahNumbers: [surah.surahNumber, ...state.recentSurahNumbers.filter((value) => value !== surah.surahNumber)].slice(0, 8),
        dailyReadings: {
          ...state.dailyReadings,
          [todayKey]: [...todayReadings],
        },
      };

      persist(nextState);
      set(nextState);
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'تعذر تحميل السورة المطلوبة.',
      });
    }
  },
  closeReader: () => {
    set({ activeSurahNumber: null, activeSurahName: null, activeVerses: [], error: null });
  },
  resumeBookmark: async () => {
    const bookmark = get().bookmark;
    if (!bookmark) return;
    await get().openSurah(bookmark.surahNumber);
  },
  clearBookmark: () => {
    const nextState = {
      ...get(),
      bookmark: null,
    };
    persist(nextState);
    set(nextState);
  },
}));
