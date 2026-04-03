import { getSurahMetaByNumber } from '@/content/loaders/load-quran';
import type { QuranSurahMeta } from '@/content/loaders/quran-metadata';
import type { QuranState } from '@/features/quran/domain/quran-types';

const DAILY_READING_CYCLE = [18, 67, 36, 55, 56, 78, 87] as const;

export interface QuranHeroRecommendation {
  title: string;
  body: string;
  actionLabel: string;
  action: 'resume' | 'open-surah';
  surahNumber?: number;
}

export interface QuranQuickAccessItem {
  surahNumber: number;
  surahName: string;
  badge?: string;
}

export function getQuranDailySuggestion(date: Date = new Date()): QuranSurahMeta {
  const cycleIndex = (date.getDate() - 1) % DAILY_READING_CYCLE.length;
  return getSurahMetaByNumber(DAILY_READING_CYCLE[cycleIndex]) ?? getSurahMetaByNumber(18)!;
}

export function getQuranHeroRecommendation(state: QuranState, date: Date = new Date()): QuranHeroRecommendation {
  if (state.bookmark) {
    return {
      title: `تابع القراءة من ${state.bookmark.surahName}`,
      body: `آخر موضع محفوظ لديك هو ${state.bookmark.surahName}. افتحها مباشرة بدل البحث كل مرة.`,
      actionLabel: 'استئناف القراءة',
      action: 'resume',
      surahNumber: state.bookmark.surahNumber,
    };
  }

  const lastRecent = state.recentSurahNumbers[0];
  if (lastRecent) {
    const surah = getSurahMetaByNumber(lastRecent);
    if (surah) {
      return {
        title: `تابع من ${surah.surahName}`,
        body: `هذه آخر سورة فتحتها مؤخرًا. يمكنك الرجوع إليها سريعًا أو بدء ورد جديد بعدها.`,
        actionLabel: 'افتح السورة',
        action: 'open-surah',
        surahNumber: surah.surahNumber,
      };
    }
  }

  const suggestion = getQuranDailySuggestion(date);
  return {
    title: `ورد اليوم: ${suggestion.surahName}`,
    body: `ابدأ بجلسة قراءة خفيفة مع ${suggestion.surahName} (${suggestion.verseCount} آية).`,
    actionLabel: 'ابدأ ورد اليوم',
    action: 'open-surah',
    surahNumber: suggestion.surahNumber,
  };
}

export function getQuranQuickAccessItems(state: QuranState): QuranQuickAccessItem[] {
  const quickAccess = new Map<number, QuranQuickAccessItem>();

  if (state.bookmark) {
    quickAccess.set(state.bookmark.surahNumber, {
      surahNumber: state.bookmark.surahNumber,
      surahName: state.bookmark.surahName,
      badge: 'آخر موضع',
    });
  }

  state.recentSurahNumbers.forEach((surahNumber, index) => {
    const surah = getSurahMetaByNumber(surahNumber);
    if (!surah || quickAccess.has(surahNumber)) return;
    quickAccess.set(surahNumber, {
      surahNumber,
      surahName: surah.surahName,
      badge: index === 0 ? 'الأحدث' : undefined,
    });
  });

  return [...quickAccess.values()].slice(0, 5);
}
