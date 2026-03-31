import { QURAN_SURAHS } from '../../../src/content/loaders/quran-metadata.ts';

export function getQuranSurahList() {
  return [...QURAN_SURAHS];
}

export function getSurahMetaByNumber(surahNumber) {
  return QURAN_SURAHS.find((item) => item.surahNumber === surahNumber) ?? null;
}

export function filterQuranSurahs(query) {
  const normalized = String(query ?? '').trim();
  if (!normalized) {
    return getQuranSurahList();
  }

  return QURAN_SURAHS.filter((item) =>
    item.surahName.includes(normalized) || String(item.surahNumber).includes(normalized),
  );
}

export async function loadSurahAyahs(surahNumber) {
  const surah = getSurahMetaByNumber(surahNumber);
  if (!surah) {
    throw new Error('السورة المطلوبة غير موجودة.');
  }

  const sampleCount = Math.min(surah.verseCount, 3);
  const ayahs = Array.from({ length: sampleCount }, (_, index) => ({
    chapter: surah.surahNumber,
    verse: index + 1,
    text: `آية ${index + 1} من سورة ${surah.surahName}`,
  }));

  return { surah, ayahs };
}

export async function preloadSurahAyahs(surahNumber) {
  return loadSurahAyahs(surahNumber);
}
