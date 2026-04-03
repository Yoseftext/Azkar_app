import test from 'node:test';
import assert from 'node:assert/strict';
import { buildMasbahaSessionHero, getMasbahaTargetPresets } from '@/features/masbaha/domain/masbaha-session-flow';
import { buildDuaHero, buildDuaQuickAccess } from '@/features/duas/domain/dua-supportive-flow';
import { buildNameOfTheDay, buildNamesReviewQueue } from '@/features/names-of-allah/domain/names-review-flow';
import type { DuasState } from '@/features/duas/domain/dua-types';
import type { NamesOfAllahState } from '@/features/names-of-allah/domain/name-types';

const masbahaState = {
  currentSessionCount: 12,
  currentTarget: 33,
  selectedPhrase: 'سبحان الله',
  dailyCounts: { '2026-04-03': 70, '2026-04-02': 15 },
};

test('masbaha hero يبني جلسة متابعة واضحة', () => {
  const hero = buildMasbahaSessionHero(masbahaState);
  assert.match(hero.title, /تابع/);
  assert.match(hero.body, /12 من 33/);
  assert.match(hero.progressLabel, /%|الدورة/);
});

test('masbaha target presets تحتفظ بالهدف الحالي حتى لو كان مخصصًا', () => {
  assert.deepEqual(getMasbahaTargetPresets(100), [33, 100, 300]);
  assert.deepEqual(getMasbahaTargetPresets(250), [33, 100, 300, 250]);
});

const duasState: DuasState = {
  isInitialized: true,
  isLoading: false,
  error: null,
  searchQuery: '',
  selectedCategorySlug: 'dua-travel',
  completedByDate: { '2026-04-03': ['dua-travel-1'] },
  favoriteIds: ['dua-distress-1', 'dua-distress-2'],
  recentCategorySlugs: ['dua-distress'],
  categories: [
    {
      slug: 'dua-distress',
      title: 'أدعية الكرب',
      itemCount: 2,
      preview: 'دعاء يونس عليه السلام',
      sources: ['القرآن', 'السنة'],
      itemIds: ['dua-distress-1', 'dua-distress-2'],
      itemsLoaded: true,
      items: [
        { id: 'dua-distress-1', text: 'لا إله إلا أنت سبحانك', reference: null, source: 'القرآن', repeatTarget: null, description: null, originalCategory: 'الكرب' },
        { id: 'dua-distress-2', text: 'اللهم رحمتك أرجو', reference: null, source: 'السنة', repeatTarget: null, description: null, originalCategory: 'الكرب' },
      ],
    },
    {
      slug: 'dua-travel',
      title: 'دعاء السفر',
      itemCount: 1,
      preview: 'سبحان الذي سخر لنا هذا',
      sources: ['السنة'],
      itemIds: ['dua-travel-1'],
      itemsLoaded: true,
      items: [
        { id: 'dua-travel-1', text: 'سبحان الذي سخر لنا هذا', reference: null, source: 'السنة', repeatTarget: null, description: null, originalCategory: 'السفر' },
      ],
    },
  ],
};

test('dua hero تفضّل الفئة الحديثة غير المكتملة أو اليومية', () => {
  const hero = buildDuaHero(duasState);
  assert.equal(hero?.slug, 'dua-distress');
  assert.match(hero?.body ?? '', /أكمل|دعاء/);
});

test('dua quick access تجمع الحالية والأحدث والمفضلة بدون تكرار', () => {
  const items = buildDuaQuickAccess(duasState);
  assert.equal(items[0]?.slug, 'dua-travel');
  assert.ok(items.some((item) => item.slug === 'dua-distress'));
  assert.equal(new Set(items.map((item) => item.slug)).size, items.length);
});

const namesState: NamesOfAllahState = {
  isInitialized: true,
  isLoading: false,
  error: null,
  searchQuery: '',
  selectedNameId: 'allah-name-1',
  completedByDate: { '2026-04-03': ['allah-name-1'] },
  favoriteIds: ['allah-name-2'],
  recentNameIds: ['allah-name-3', 'allah-name-1'],
  items: [
    { id: 'allah-name-1', order: 1, name: 'الله', description: 'الاسم الجامع.', normalizedSearch: 'الله الاسم الجامع 1' },
    { id: 'allah-name-2', order: 2, name: 'الرحمن', description: 'واسع الرحمة.', normalizedSearch: 'الرحمن واسع الرحمه 2' },
    { id: 'allah-name-3', order: 3, name: 'الرحيم', description: 'الرحيم بالمؤمنين.', normalizedSearch: 'الرحيم الرحيم بالمؤمنين 3' },
  ],
};

test('name of the day يبني بطاقة يومية مع حالة الإنجاز', () => {
  const item = buildNameOfTheDay(namesState);
  assert.ok(item);
  assert.match(item?.title ?? '', /الله|الرحمن|الرحيم/);
});

test('names review queue تبني مراجعة سريعة متنوعة بلا تكرار', () => {
  const queue = buildNamesReviewQueue(namesState);
  assert.ok(queue.length >= 3);
  assert.equal(new Set(queue.map((item) => item.id)).size, queue.length);
  assert.match(queue[0]?.hint ?? '', /آخر اسم فتحته|المفضلة|اسم اليوم/);
});
