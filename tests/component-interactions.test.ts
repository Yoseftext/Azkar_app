import assert from 'node:assert/strict';
import test from 'node:test';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import './helpers/environment.ts';
import { renderWithDom } from './helpers/dom-harness.ts';
import { resetAllStores } from './helpers/reset-stores.ts';
import { SettingsPage } from '@/features/settings/pages/SettingsPage';
import { QuranPage } from '@/features/quran/pages/QuranPage';
import { DuasPage } from '@/features/duas/pages/DuasPage';
import { StoriesPage } from '@/features/stories/pages/StoriesPage';
import { usePreferencesStore } from '@/kernel/preferences/preferences-store';
import { useAuthStore } from '@/kernel/auth/auth-store';
import { useQuranStore } from '@/features/quran/state/quran-store';
import { useDuasStore } from '@/features/duas/state/duas-store';
import { useStoriesStore } from '@/features/stories/state/stories-store';
import { getLocalDateKey } from '@/shared/lib/date';
import { makeDuaCategory, makeDuaItem, makeStoryCategory, makeStoryItem } from './helpers/route-fixtures.ts';

test('SettingsPage DOM interactions toggle theme and invoke sign out action', async () => {
  resetAllStores();
  let signOutCalls = 0;
  useAuthStore.setState({ user: { uid: 'user-1', email: 'yosef@example.com', displayName: 'Yosef', photoURL: null }, isReady: true, isConfigured: true, signOut: async () => { signOutCalls += 1; } });
  const harness = await renderWithDom(React.createElement(MemoryRouter, null, React.createElement(SettingsPage)));
  try {
    assert.equal(usePreferencesStore.getState().themeMode, 'system');
    await harness.click(harness.findByText('dark', { exact: true, tagName: 'button' }));
    assert.equal(usePreferencesStore.getState().themeMode, 'dark');
    assert.equal(harness.document.documentElement.classList.contains('dark'), true);
    await harness.click(harness.findByText('light', { exact: true, tagName: 'button' }));
    assert.equal(usePreferencesStore.getState().themeMode, 'light');
    assert.equal(harness.document.documentElement.classList.contains('dark'), false);
    await harness.click(harness.findByText('تسجيل الخروج', { exact: true, tagName: 'button' }));
    assert.equal(signOutCalls, 1);
    assert.match(harness.bodyText(), /فتح الملف الشخصي/);
  } finally { await harness.cleanup(); }
});

test('QuranPage DOM interactions update search and open then close the reader', async () => {
  resetAllStores();
  useQuranStore.setState({ ...useQuranStore.getState(), isInitialized: true, searchQuery: '', activeSurahNumber: null, activeSurahName: null, activeVerses: [], bookmark: null, recentSurahNumbers: [18], dailyReadings: {} });
  const harness = await renderWithDom(React.createElement(QuranPage));
  try {
    await harness.change(harness.findById('quran-search'), '18');
    assert.equal(useQuranStore.getState().searchQuery, '18');
    assert.match(harness.bodyText(), /الكهف/);
    await harness.click(harness.findByText('الكهف', { tagName: 'button' }));
    assert.equal(useQuranStore.getState().activeSurahNumber, 18);
    assert.equal(useQuranStore.getState().activeSurahName, 'الكهف');
    assert.match(harness.bodyText(), /آية 1 من سورة الكهف/);
    await harness.click(harness.findByText('الرجوع للفهرس', { exact: true, tagName: 'button' }));
    assert.equal(useQuranStore.getState().activeSurahNumber, null);
    assert.match(harness.bodyText(), /فهرس السور/);
  } finally { await harness.cleanup(); }
});

test('DuasPage DOM interactions toggle favorite and completion through visible controls', async () => {
  resetAllStores();
  const duaA = makeDuaItem({ id: 'dua-1', text: 'اللهم اغفر لي', source: 'السنة', categorySlug: 'daily-duas', categoryTitle: 'أدعية يومية' });
  const duaB = makeDuaItem({ id: 'dua-2', text: 'اللهم اهدني', source: 'القرآن', categorySlug: 'daily-duas', categoryTitle: 'أدعية يومية' });
  useDuasStore.setState({ ...useDuasStore.getState(), isInitialized: true, isLoading: false, error: null, searchQuery: '', selectedCategorySlug: 'daily-duas', completedByDate: {}, favoriteIds: [], recentCategorySlugs: ['daily-duas'], categories: [makeDuaCategory({ slug: 'daily-duas', title: 'أدعية يومية', items: [duaA, duaB], itemsLoaded: true })] });
  const harness = await renderWithDom(React.createElement(DuasPage));
  try {
    await harness.click(harness.findByText('☆ أضف للمفضلة', { exact: true, tagName: 'button' }));
    assert.deepEqual(useDuasStore.getState().favoriteIds, ['dua-1']);
    assert.match(harness.bodyText(), /اللهم اغفر لي/);
    await harness.click(harness.findByAttribute('aria-label', 'تأكيد إنجاز الدعاء'));
    const todayKey = getLocalDateKey();
    assert.deepEqual(useDuasStore.getState().completedByDate[todayKey], ['dua-1']);
    assert.match(harness.bodyText(), /تقدم اليوم/);
  } finally { await harness.cleanup(); }
});

test('StoriesPage DOM interactions load more items and toggle favorites inside the selected category', async () => {
  resetAllStores();
  const storyA = makeStoryItem({ id: 'story-category-1::1', legacyId: 1, title: 'القصة الأولى', categorySlug: 'story-category-1', categoryTitle: 'قصص تربوية', story: 'نص القصة الأولى' });
  const storyB = makeStoryItem({ id: 'story-category-1::2', legacyId: 2, title: 'القصة الثانية', categorySlug: 'story-category-1', categoryTitle: 'قصص تربوية', story: 'نص القصة الثانية' });
  const storyC = makeStoryItem({ id: 'story-category-1::3', legacyId: 3, title: 'القصة الثالثة', categorySlug: 'story-category-1', categoryTitle: 'قصص تربوية', story: null, storyLoaded: false });
  const seededCategory = makeStoryCategory({ slug: 'story-category-1', title: 'قصص تربوية', preview: 'ملخص فئة تربوية', itemsLoaded: true, itemCount: 3, itemIds: [storyA.id, storyB.id, storyC.id], summaryBatchCount: 2, summaryBatchSize: 2, loadedSummaryBatchIndexes: [0], items: [storyA, storyB] });
  const loadMoreSelectedCategoryStories = async () => {
    const current = useStoriesStore.getState();
    useStoriesStore.setState({ ...current, categories: current.categories.map((category) => category.slug === 'story-category-1' ? { ...category, items: [storyA, storyB, storyC], loadedSummaryBatchIndexes: [0,1] } : category) });
  };
  useStoriesStore.setState({ ...useStoriesStore.getState(), isInitialized: true, isLoading: false, error: null, searchQuery: '', selectedCategorySlug: 'story-category-1', selectedStoryId: storyA.id, completedByDate: {}, favoriteIds: [], recentCategorySlugs: ['story-category-1'], recentStoryIds: [storyA.id], categories: [seededCategory], loadMoreSelectedCategoryStories });
  const harness = await renderWithDom(React.createElement(StoriesPage));
  try {
    assert.match(harness.bodyText(), /المحمل الآن 2 من 3/);
    await harness.click(harness.findByText('تحميل قصص إضافية', { exact: true, tagName: 'button' }));
    assert.match(harness.bodyText(), /القصة الثالثة/);
    assert.equal(harness.queryByText('تحميل قصص إضافية', { exact: true, tagName: 'button' }), null);
    await harness.click(harness.findByText('إضافة للمفضلة', { exact: true, tagName: 'button' }));
    assert.deepEqual(useStoriesStore.getState().favoriteIds, [storyA.id]);
    assert.match(harness.bodyText(), /نص القصة الأولى/);
  } finally { await harness.cleanup(); }
});
