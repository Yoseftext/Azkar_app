import './helpers/environment.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  filterQuranSurahs,
  getQuranSurahList,
  getSurahMetaByNumber,
  loadQuranSummary,
  loadSurahAyahs,
  normalizeArabicSearchTerm,
  preloadSurahAyahs,
} from '../src/content/loaders/load-quran.ts';

test('real quran loader exposes stable summary and normalized filtering against metadata', () => {
  const summary = loadQuranSummary();
  assert.equal(summary.surahCount, 114);
  assert.equal(summary.ayahCount, 6236);

  const surahs = getQuranSurahList();
  assert.equal(surahs.length, 114);
  assert.deepEqual(surahs[0], {
    surahNumber: 1,
    surahName: 'الفاتحة',
    verseCount: 7,
  });

  assert.equal(normalizeArabicSearchTerm('إبراهيم'), 'ابراهيم');
  assert.equal(normalizeArabicSearchTerm('فتىٰة'), 'فتيه');

  const byNormalizedName = filterQuranSurahs('الاسراء');
  assert.ok(byNormalizedName.some((surah) => surah.surahNumber === 17));

  const byNumber = filterQuranSurahs('112');
  assert.deepEqual(byNumber.map((surah) => surah.surahNumber), [112]);

  const byHamzaNormalization = filterQuranSurahs('الاعلي');
  assert.equal(byHamzaNormalization[0]?.surahNumber, 87);

  assert.equal(getSurahMetaByNumber(112)?.surahName, 'الإخلاص');
  assert.equal(getSurahMetaByNumber(999), null);
});

test('real quran loader preloads and loads actual surah ayahs from split JSON files', async () => {
  await preloadSurahAyahs(112);
  const payload = await loadSurahAyahs(112);

  assert.equal(payload.surah.surahNumber, 112);
  assert.equal(payload.surah.surahName, 'الإخلاص');
  assert.equal(payload.ayahs.length, 4);
  assert.deepEqual(payload.ayahs[0], {
    chapter: 112,
    verse: 1,
    text: 'قُلۡ هُوَ ٱللَّهُ أَحَدٌ',
  });
  assert.equal(payload.ayahs.at(-1)?.verse, 4);

  const secondRead = await loadSurahAyahs(112);
  assert.equal(secondRead.ayahs.length, 4);
  assert.equal(secondRead.ayahs[1]?.text, 'ٱللَّهُ ٱلصَّمَدُ');
});

test('real quran loader rejects invalid surah numbers and tolerates invalid preloads', async () => {
  await assert.doesNotReject(async () => {
    await preloadSurahAyahs(999);
  });

  await assert.rejects(
    async () => {
      await loadSurahAyahs(999);
    },
    (error: unknown) => error instanceof Error && error.message === 'السورة المطلوبة غير موجودة.',
  );
});
