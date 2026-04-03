import test from 'node:test';
import assert from 'node:assert/strict';
import { getAzkarResumeRecommendation, getAzkarRitualHero, getAzkarSessionCards } from '@/features/azkar/domain/azkar-ritual-flow';
import { getQuranDailySuggestion, getQuranHeroRecommendation, getQuranQuickAccessItems } from '@/features/quran/domain/quran-reading-flow';
import type { AzkarState } from '@/features/azkar/domain/azkar-types';
import type { QuranState } from '@/features/quran/domain/quran-types';

const azkarState: AzkarState = {
  isInitialized: true,
  isLoading: false,
  error: null,
  searchQuery: '',
  selectedCategorySlug: 'azkar-morning',
  recentCategorySlugs: ['azkar-evening', 'azkar-morning'],
  completedByDate: {
    '2026-04-03': ['m-1', 'e-1'],
  },
  categories: [
    {
      slug: 'azkar-morning',
      title: 'أذكار الصباح',
      itemCount: 2,
      preview: 'preview',
      itemIds: ['m-1', 'm-2'],
      itemsLoaded: true,
      items: [
        { id: 'm-1', legacyId: 1, categorySlug: 'azkar-morning', categoryTitle: 'أذكار الصباح', text: 'ذكر 1', repeatTarget: 1 },
        { id: 'm-2', legacyId: 2, categorySlug: 'azkar-morning', categoryTitle: 'أذكار الصباح', text: 'ذكر 2', repeatTarget: 1 },
      ],
    },
    {
      slug: 'azkar-evening',
      title: 'أذكار المساء',
      itemCount: 2,
      preview: 'preview',
      itemIds: ['e-1', 'e-2'],
      itemsLoaded: true,
      items: [
        { id: 'e-1', legacyId: 3, categorySlug: 'azkar-evening', categoryTitle: 'أذكار المساء', text: 'ذكر 3', repeatTarget: 1 },
        { id: 'e-2', legacyId: 4, categorySlug: 'azkar-evening', categoryTitle: 'أذكار المساء', text: 'ذكر 4', repeatTarget: 1 },
      ],
    },
    {
      slug: 'azkar-sleep',
      title: 'أذكار النوم',
      itemCount: 1,
      preview: 'preview',
      itemIds: ['s-1'],
      itemsLoaded: true,
      items: [
        { id: 's-1', legacyId: 5, categorySlug: 'azkar-sleep', categoryTitle: 'أذكار النوم', text: 'ذكر 5', repeatTarget: 1 },
      ],
    },
  ],
};

test('azkar ritual hero يفضّل الجلسة المناسبة للوقت إذا لم تكتمل', () => {
  const hero = getAzkarRitualHero(azkarState, new Date('2026-04-03T07:00:00.000Z'));
  assert.equal(hero?.slug, 'azkar-morning');
  assert.match(hero?.body ?? '', /أنجزت|لديك/);
});

test('azkar session cards تبني جلسات الصباح والمساء والنوم فقط عند توفرها', () => {
  const cards = getAzkarSessionCards(azkarState);
  assert.deepEqual(cards.map((card) => card.slug), ['azkar-morning', 'azkar-evening', 'azkar-sleep']);
});

test('azkar resume recommendation تعتمد على أحدث تصنيف معروف', () => {
  const resume = getAzkarResumeRecommendation(azkarState);
  assert.equal(resume?.slug, 'azkar-evening');
});

const quranState: QuranState = {
  isInitialized: true,
  isLoading: false,
  error: null,
  activeSurahNumber: null,
  activeSurahName: null,
  activeVerses: [],
  searchQuery: '',
  bookmark: {
    surahNumber: 18,
    surahName: 'الكهف',
    verseCount: 110,
    updatedAt: '2026-04-03T00:00:00.000Z',
  },
  recentSurahNumbers: [67, 36, 55],
  dailyReadings: {},
};

test('quran hero recommendation ترجّح الاستئناف عند وجود bookmark', () => {
  const hero = getQuranHeroRecommendation(quranState, new Date('2026-04-03T07:00:00.000Z'));
  assert.equal(hero.action, 'resume');
  assert.equal(hero.surahNumber, 18);
});

test('quran quick access تجمع bookmark وآخر السور بدون تكرار', () => {
  const items = getQuranQuickAccessItems(quranState);
  assert.equal(items[0]?.surahNumber, 18);
  assert.equal(items.length, 4);
});

test('quran daily suggestion تعطي سورة صالحة من الدورة اليومية', () => {
  const suggestion = getQuranDailySuggestion(new Date('2026-04-08T07:00:00.000Z'));
  assert.ok([18, 67, 36, 55, 56, 78, 87].includes(suggestion.surahNumber));
});
