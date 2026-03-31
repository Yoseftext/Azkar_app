import type { QuranAyah } from '@/content/loaders/load-quran';

export interface QuranBookmark {
  surahNumber: number;
  surahName: string;
  verseCount: number;
  updatedAt: string;
}

export interface PersistedQuranState {
  bookmark: QuranBookmark | null;
  recentSurahNumbers: number[];
  dailyReadings: Record<string, number[]>;
}

export interface QuranState extends PersistedQuranState {
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  activeSurahNumber: number | null;
  activeSurahName: string | null;
  activeVerses: QuranAyah[];
  searchQuery: string;
}
