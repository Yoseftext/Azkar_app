import { QURAN_SURAHS, type QuranSurahMeta } from '@/content/loaders/quran-metadata';
import { compareSearchRank, normalizeSearchTerm, scoreSearchMatch } from '@/shared/lib/search';

export interface QuranAyah {
  chapter: number;
  verse: number;
  text: string;
}

interface LegacyAyah {
  chapter: number;
  verse: number;
  text: string;
}

const TOTAL_AYAHS = 6236;
const SURAH_PATH_PREFIX = '../quran/surahs/';

const surahModules = import.meta.glob<LegacyAyah[]>('../quran/surahs/*.json', {
  import: 'default',
});

const surahCache = new Map<number, QuranAyah[]>();

export function normalizeArabicSearchTerm(text: string): string {
  return normalizeSearchTerm(text);
}

export function getQuranSurahList(): QuranSurahMeta[] {
  return QURAN_SURAHS;
}

export function getSurahMetaByNumber(surahNumber: number): QuranSurahMeta | null {
  return QURAN_SURAHS.find((item) => item.surahNumber === surahNumber) ?? null;
}

export function filterQuranSurahs(query: string): QuranSurahMeta[] {
  const normalizedQuery = normalizeArabicSearchTerm(query);
  if (!normalizedQuery) return QURAN_SURAHS;

  return QURAN_SURAHS
    .map((item) => ({
      item,
      score: Math.max(
        scoreSearchMatch(normalizedQuery, item.surahName),
        scoreSearchMatch(normalizedQuery, String(item.surahNumber)),
        String(item.surahNumber) === query.trim() ? 130 : 0,
      ),
    }))
    .filter((entry) => entry.score > 0)
    .sort((left, right) => compareSearchRank({ score: left.score, value: left.item }, { score: right.score, value: right.item }, (a, b) => a.surahNumber - b.surahNumber))
    .map((entry) => entry.item);
}

export function loadQuranSummary(): { surahCount: number; ayahCount: number } {
  return {
    surahCount: QURAN_SURAHS.length,
    ayahCount: TOTAL_AYAHS,
  };
}

function getSurahModulePath(surahNumber: number): string {
  return `${SURAH_PATH_PREFIX}${String(surahNumber).padStart(3, '0')}.json`;
}

function normalizeAyahs(surahNumber: number, ayahs: LegacyAyah[]): QuranAyah[] {
  return ayahs.map((ayah, index) => ({
    chapter: Number.isFinite(ayah?.chapter) ? Number(ayah.chapter) : surahNumber,
    verse: Number.isFinite(ayah?.verse) ? Number(ayah.verse) : index + 1,
    text: String(ayah?.text || '').trim(),
  }));
}

export async function preloadSurahAyahs(surahNumber: number): Promise<void> {
  const surah = getSurahMetaByNumber(surahNumber);
  if (!surah || surahCache.has(surahNumber)) return;

  const modulePath = getSurahModulePath(surahNumber);
  const loadModule = surahModules[modulePath];
  if (!loadModule) return;

  const payload = await loadModule();
  surahCache.set(surahNumber, normalizeAyahs(surahNumber, payload));
}

export async function loadSurahAyahs(surahNumber: number): Promise<{ surah: QuranSurahMeta; ayahs: QuranAyah[] }> {
  const surah = getSurahMetaByNumber(surahNumber);
  if (!surah) {
    throw new Error('السورة المطلوبة غير موجودة.');
  }

  if (!surahCache.has(surahNumber)) {
    const modulePath = getSurahModulePath(surahNumber);
    const loadModule = surahModules[modulePath];

    if (!loadModule) {
      throw new Error('ملف السورة غير متاح في هذه النسخة.');
    }

    const payload = await loadModule();
    surahCache.set(surahNumber, normalizeAyahs(surahNumber, payload));
  }

  return {
    surah,
    ayahs: surahCache.get(surahNumber) ?? [],
  };
}
