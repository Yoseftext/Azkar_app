import './helpers/environment.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import { filterLoadedAzkarCategories, loadAzkarCategories } from '@/content/loaders/load-azkar';
import { filterLoadedDuaCategories, loadDuaCategories, loadDuasSummary } from '@/content/loaders/load-duas';
import { filterLoadedAllahNames, getNameOfTheDayFromItems, loadAllahNames, normalizeAllahName, normalizeAllahNamesPayload } from '@/content/loaders/load-names';
import { buildStoryExcerpt, filterLoadedStoryCategories, loadStoryCategories, loadStoryItemById, normalizeLegacyStory, normalizeStoryCategories } from '@/content/loaders/load-stories';

test('azkar loader normalizes categories and supports ranked arabic text filtering', async () => {
  const categories = await loadAzkarCategories();
  assert.ok(categories.length > 0);
  assert.match(categories[0].slug, /^[-\w\u0600-\u06FF]+$/);
  const query = categories[0].items[0].text.slice(0, 8);
  const filtered = filterLoadedAzkarCategories(categories, query);
  assert.ok(filtered.length > 0);

  const normalizedTitleQuery = categories[0].title.replace(/[أإآٱ]/g, 'ا');
  const byTitle = filterLoadedAzkarCategories(categories, normalizedTitleQuery);
  assert.equal(byTitle[0]?.slug, categories[0]?.slug);
});

test('dua loader normalizes categories, summaries, and ranked arabic filtering', async () => {
  const categories = await loadDuaCategories();
  assert.ok(categories.length > 0);
  assert.match(categories[0].slug, /^dua-category-/);
  const summary = await loadDuasSummary();
  assert.ok(summary.categoryCount > 0);
  assert.ok(summary.itemCount >= summary.categoryCount);
  assert.ok(summary.featuredDua.length > 0);
  const filtered = filterLoadedDuaCategories(categories, categories[0].title.replace(/[أإآٱ]/g, 'ا'));
  assert.equal(filtered[0]?.slug, categories[0]?.slug);
});

test('names loader supports ranked search and deterministic day selection', async () => {
  const items = await loadAllahNames();
  assert.ok(items.length > 0);
  const match = filterLoadedAllahNames(items, `${items[0].name.replace(/[أإآٱ]/g, 'ا')} ${items[0].order}`);
  assert.equal(match[0]?.id, items[0]?.id);
  assert.ok(getNameOfTheDayFromItems(items));
});

test('names normalization applies fallbacks and robust arabic search normalization', () => {
  assert.deepEqual(normalizeAllahNamesPayload(null), []);
  assert.deepEqual(normalizeAllahNamesPayload({ ar: undefined }), []);

  const fallback = normalizeAllahName({ name: '   ', desc: '   ' }, 0);
  assert.equal(fallback.name, 'الاسم 1');
  assert.equal(fallback.description, 'لا يوجد وصف متاح حالياً.');

  const normalized = normalizeAllahNamesPayload({
    ar: [
      { name: 'ٱلرَّحْمَٰن', desc: 'واسع الرحمة' },
      { name: '', desc: '' },
    ],
  });

  assert.equal(normalized.length, 2);
  assert.match(normalized[0].normalizedSearch, /الرحمن/);
  assert.equal(normalized[1].name, 'الاسم 2');
});

test('stories loader normalizes stories and supports deep content filtering', async () => {
  const categories = await loadStoryCategories();
  assert.ok(categories.length > 0);
  const firstStory = categories[0].items[0];
  assert.equal(firstStory.storyLoaded, false);
  const query = (firstStory.lesson || firstStory.excerpt).slice(0, 12);
  const filtered = filterLoadedStoryCategories(categories, query);
  assert.ok(filtered.some((category) => category.items.some((story) => story.id === firstStory.id)));

  const hydrated = await loadStoryItemById(categories[0].slug, firstStory.id);
  assert.ok(hydrated);
  assert.equal(hydrated?.storyLoaded, true);
  assert.ok((hydrated?.story ?? '').length > 0);
});

test('stories normalization drops invalid items, filters empty categories, and builds stable excerpts', () => {
  assert.equal(buildStoryExcerpt('  نص قصير  '), 'نص قصير');
  const longStory = ` ${'قصة طويلة '.repeat(30)} `;
  const excerpt = buildStoryExcerpt(longStory);
  assert.ok(excerpt.endsWith('…'));
  assert.ok(excerpt.length <= 161);

  const invalid = normalizeLegacyStory({ title: 'بدون نص' }, 'الفئة', 'cat', 0);
  assert.equal(invalid, null);

  const normalizedStory = normalizeLegacyStory({ id: '42', title: 'قصة', story: '   محتوى القصة   ', lesson: '  عبرة  ' }, 'الفئة', 'cat', 1);
  assert.equal(normalizedStory?.legacyId, 42);
  assert.equal(normalizedStory?.lesson, 'عبرة');
  assert.equal(normalizedStory?.excerpt, 'محتوى القصة');

  const categories = normalizeStoryCategories({
    categories: [
      { name: 'فئة صالحة', stories: [{ title: 'قصة 1', story: 'نص 1' }, { title: ' ', story: 'مهمل' }] },
      { name: 'فئة فارغة', stories: [{ title: 'بدون نص' }] },
      {},
    ],
  });

  assert.equal(categories.length, 1);
  assert.equal(categories[0]?.itemCount, 1);
  assert.match(categories[0]?.slug ?? '', /^story-category-1-/);
  assert.equal(normalizeStoryCategories(null).length, 0);
});
