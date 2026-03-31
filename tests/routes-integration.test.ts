import './helpers/environment.ts';

import { beforeEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderRouteWithShell } from './helpers/render-route.ts';
import { resetAllStores } from './helpers/reset-stores.ts';
import { getLocalDateKey } from '@/shared/lib/date';
import { HomePage } from '@/features/home/pages/HomePage';
import { TasksPage } from '@/features/tasks/pages/TasksPage';
import { QuranPage } from '@/features/quran/pages/QuranPage';
import { SettingsPage } from '@/features/settings/pages/SettingsPage';
import { AzkarPage } from '@/features/azkar/pages/AzkarPage';
import { DuasPage } from '@/features/duas/pages/DuasPage';
import { StoriesPage } from '@/features/stories/pages/StoriesPage';
import { NamesOfAllahPage } from '@/features/names-of-allah/pages/NamesOfAllahPage';
import { StatsPage } from '@/features/stats/pages/StatsPage';
import { ProfilePage } from '@/features/profile/pages/ProfilePage';
import { AboutPage } from '@/features/legal/pages/AboutPage';
import { PrivacyPage } from '@/features/legal/pages/PrivacyPage';
import { ContactPage } from '@/features/legal/pages/ContactPage';
import { useAuthStore } from '@/kernel/auth/auth-store';
import { useTasksStore } from '@/features/tasks/state/tasks-store';
import { useMasbahaStore } from '@/features/masbaha/state/masbaha-store';
import { useQuranStore } from '@/features/quran/state/quran-store';
import { useAzkarStore } from '@/features/azkar/state/azkar-store';
import { useDuasStore } from '@/features/duas/state/duas-store';
import { useStoriesStore } from '@/features/stories/state/stories-store';
import { useNamesOfAllahStore } from '@/features/names-of-allah/state/names-store';
import { usePreferencesStore } from '@/kernel/preferences/preferences-store';
import { makeAzkarCategory, makeAzkarItem, makeDuaCategory, makeDuaItem, makeQuranAyah, makeQuranBookmark, makeStoryCategory, makeStoryItem } from './helpers/route-fixtures.ts';

beforeEach(() => {
  resetAllStores();
});

describe('route-level integration', () => {
  it('renders home dashboard metrics from multiple stores inside the shell header', () => {
    const todayKey = getLocalDateKey();
    const initialTasks = useTasksStore.getState().items;

    useAuthStore.setState({
      user: { uid: 'user-1', displayName: 'يوسف', email: 'yousef@example.com', photoURL: null },
      isReady: true,
      isConfigured: true,
    });
    useTasksStore.setState({
      items: initialTasks.map((item, index) => ({ ...item, completed: index < 2 })),
      dailyCompletions: { [todayKey]: ['wird-morning'] },
    });
    useMasbahaStore.setState({ currentTarget: 100, dailyCounts: { [todayKey]: 77 } });
    useAzkarStore.setState({ completedByDate: { [todayKey]: ['azkar-1', 'azkar-2'] } });
    useDuasStore.setState({ completedByDate: { [todayKey]: ['dua-1', 'dua-2', 'dua-3'] }, favoriteIds: ['dua-1', 'dua-2'] });
    useStoriesStore.setState({
      completedByDate: { [todayKey]: ['story-category-1-prophets::1'] },
      favoriteIds: ['story-category-1-prophets::1'],
      recentStoryIds: ['story-category-1-prophets::1'],
      categories: [
        {
          slug: 'story-category-1-prophets',
          title: 'قصص الأنبياء',
          itemCount: 1,
          preview: 'ملخص القصة',
          items: [
            {
              id: 'story-category-1-prophets::1',
              legacyId: 1,
              title: 'قصة موسى',
              story: 'نص طويل',
              lesson: 'الصبر',
              source: 'المصدر',
              categorySlug: 'story-category-1-prophets',
              categoryTitle: 'قصص الأنبياء',
              excerpt: 'ملخص القصة',
              isLoaded: true,
            },
          ],
        },
      ],
    });
    useNamesOfAllahStore.setState({ completedByDate: { [todayKey]: ['allah-name-1'] }, favoriteIds: ['allah-name-1', 'allah-name-2'] });
    useQuranStore.setState({
      bookmark: { surahNumber: 2, surahName: 'البقرة', verseCount: 286, updatedAt: '2026-03-31T08:00:00.000Z' },
      dailyReadings: { [todayKey]: [2, 18] },
    });

    const markup = renderRouteWithShell({ path: '/', page: createElement(HomePage) });

    assert.match(markup, /الرئيسية/);
    assert.match(markup, /يوسف/);
    assert.match(markup, /2\/4/);
    assert.match(markup, /77/);
    assert.match(markup, /البقرة/);
    assert.match(markup, /قصة موسى/);
    assert.match(markup, /أنجزت 1 مهمة اليوم/);
    assert.match(markup, /أسماء اليوم/);
    assert.match(markup, /الأذكار/);
    assert.match(markup, /الملف/);
  });

  it('renders tasks route with personal group state and delete affordance', () => {
    useTasksStore.setState({
      activeGroup: 'personal',
      items: [
        { id: 'wird-morning', title: 'أذكار الصباح', completed: false, group: 'wird', isDefault: true },
        { id: 'personal-1', title: 'ورد الحفظ', completed: true, group: 'personal', isDefault: false },
      ],
    });

    const markup = renderRouteWithShell({ path: '/tasks', page: createElement(TasksPage) });

    assert.match(markup, /المهام/);
    assert.match(markup, /المهام الشخصية/);
    assert.match(markup, /1 \/ 1/);
    assert.match(markup, /ورد الحفظ/);
    assert.match(markup, /حذف/);
    assert.match(markup, /إضافة مهمة شخصية/);
  });

  it('renders quran route with bookmark banner and recent surah shortcuts', () => {
    const todayKey = getLocalDateKey();

    useQuranStore.setState({
      bookmark: { surahNumber: 2, surahName: 'البقرة', verseCount: 286, updatedAt: '2026-03-30T22:00:00.000Z' },
      recentSurahNumbers: [2, 3],
      dailyReadings: { [todayKey]: [2] },
      searchQuery: '',
      activeSurahNumber: null,
      activeSurahName: null,
      activeVerses: [],
      isLoading: false,
      error: null,
    });

    const markup = renderRouteWithShell({ path: '/quran', page: createElement(QuranPage) });

    assert.match(markup, /القرآن/);
    assert.match(markup, /البقرة/);
    assert.match(markup, /استئناف القراءة/);
    assert.match(markup, /الوصول السريع/);
    assert.match(markup, /آل عمران/);
    assert.match(markup, /ابحث باسم السورة أو رقمها/);
  });


  it('renders quran reader route with active surah content, bookmark context, and recent shortcuts while the reader is open', () => {
    useQuranStore.setState({
      bookmark: makeQuranBookmark({ surahNumber: 18, surahName: 'الكهف', verseCount: 110, updatedAt: '2026-03-31T06:00:00.000Z' }),
      recentSurahNumbers: [18, 36],
      activeSurahNumber: 18,
      activeSurahName: 'الكهف',
      activeVerses: [
        makeQuranAyah({ chapter: 18, verse: 1, text: 'الْحَمْدُ لِلَّهِ الَّذِي أَنْزَلَ عَلَى عَبْدِهِ الْكِتَابَ' }),
        makeQuranAyah({ chapter: 18, verse: 2, text: 'قَيِّمًا لِيُنْذِرَ بَأْسًا شَدِيدًا' }),
      ],
      isLoading: false,
      error: null,
      searchQuery: 'الكهف',
    });

    const markup = renderRouteWithShell({ path: '/quran', page: createElement(QuranPage) });

    assert.match(markup, /قسم القرآن/);
    assert.match(markup, /آخر موضع قراءة/);
    assert.match(markup, /الكهف/);
    assert.match(markup, /سورة رقم 18/);
    assert.match(markup, /الرجوع للفهرس/);
    assert.match(markup, /الْحَمْدُ لِلَّهِ الَّذِي أَنْزَلَ عَلَى عَبْدِهِ الْكِتَابَ/);
    assert.match(markup, /﴿1﴾/);
    assert.match(markup, /يس/);
  });

  it('renders quran reader loading and error states without leaking stale verse content', () => {
    useQuranStore.setState({
      bookmark: makeQuranBookmark({ surahNumber: 12, surahName: 'يوسف', verseCount: 111 }),
      recentSurahNumbers: [12],
      activeSurahNumber: 12,
      activeSurahName: 'يوسف',
      activeVerses: [],
      isLoading: true,
      error: 'تعذر تحميل السورة المطلوبة.',
      searchQuery: '',
    });

    const markup = renderRouteWithShell({ path: '/quran', page: createElement(QuranPage) });

    assert.match(markup, /يوسف/);
    assert.match(markup, /جاري تحميل السورة…/);
    assert.match(markup, /تعذر تحميل السورة المطلوبة\./);
    assert.match(markup, /0 آية/);
    assert.doesNotMatch(markup, /﴿1﴾/);
  });

  it('renders quran index empty state when search does not match any surah', () => {
    useQuranStore.setState({
      searchQuery: 'سورة غير موجودة',
      activeSurahNumber: null,
      activeSurahName: null,
      activeVerses: [],
      isLoading: false,
      error: null,
      bookmark: null,
      recentSurahNumbers: [],
    });

    const markup = renderRouteWithShell({ path: '/quran', page: createElement(QuranPage) });

    assert.match(markup, /فهرس السور/);
    assert.match(markup, /لا توجد نتائج/);
    assert.match(markup, /جرّب اسم سورة آخر أو اكتب رقم السورة مباشرة/);
  });

  it('renders settings route from auth and preferences stores', () => {
    usePreferencesStore.setState({ themeMode: 'dark' });
    useAuthStore.setState({
      isConfigured: true,
      user: { uid: 'user-1', displayName: 'يوسف', email: 'yousef@example.com', photoURL: null },
      isReady: true,
    });

    const markup = renderRouteWithShell({ path: '/settings', page: createElement(SettingsPage) });

    assert.match(markup, /الإعدادات/);
    assert.match(markup, /dark/);
    assert.match(markup, /مسجل كـ يوسف/);
    assert.match(markup, /تسجيل الخروج/);
    assert.match(markup, /فتح الملف الشخصي/);
    assert.doesNotMatch(markup, /أضف متغيرات VITE_FIREBASE_\*/);
    assert.match(markup, /عن التطبيق/);
    assert.match(markup, /سياسة الخصوصية/);
  });



  it('renders azkar route with filtered categories, recent chips, and item-level progress state', () => {
    const todayKey = getLocalDateKey();

    useAzkarStore.setState({
      searchQuery: 'الصباح',
      selectedCategorySlug: 'azkar-evening',
      recentCategorySlugs: ['azkar-morning', 'azkar-evening'],
      completedByDate: { [todayKey]: ['zikr-morning-1'] },
      categories: [
        makeAzkarCategory({
          slug: 'azkar-morning',
          title: 'أذكار الصباح',
          items: [
            makeAzkarItem({ id: 'zikr-morning-1', text: 'أصبحنا وأصبح الملك لله', repeatTarget: 1, reference: 'مسلم', categorySlug: 'azkar-morning', categoryTitle: 'أذكار الصباح' }),
            makeAzkarItem({ id: 'zikr-morning-2', text: 'اللهم بك أصبحنا', repeatTarget: 1, reference: 'الترمذي', categorySlug: 'azkar-morning', categoryTitle: 'أذكار الصباح' }),
          ],
        }),
        makeAzkarCategory({
          slug: 'azkar-evening',
          title: 'أذكار المساء',
          items: [makeAzkarItem({ id: 'zikr-evening-1', text: 'أمسينا وأمسى الملك لله', repeatTarget: 1, reference: 'مسلم', categorySlug: 'azkar-evening', categoryTitle: 'أذكار المساء' })],
        }),
      ],
      isLoading: false,
      error: null,
    });

    const markup = renderRouteWithShell({ path: '/azkar', page: createElement(AzkarPage) });

    assert.match(markup, /قسم الأذكار/);
    assert.match(markup, /أذكار الصباح/);
    assert.match(markup, /تصنيفات حديثة/);
    assert.match(markup, /أصبحنا وأصبح الملك لله/);
    assert.match(markup, /التكرار 1/);
    assert.match(markup, /تم اليوم/);
    assert.match(markup, /تم إنجاز 1 من 2 اليوم/);
  });

  it('renders duas route with selected category hydration, sources, favorites, and completion badges', () => {
    const todayKey = getLocalDateKey();

    useDuasStore.setState({
      searchQuery: 'الكرب',
      selectedCategorySlug: 'dua-distress',
      recentCategorySlugs: ['dua-distress'],
      favoriteIds: ['dua-distress-1'],
      completedByDate: { [todayKey]: ['dua-distress-1'] },
      categories: [
        makeDuaCategory({
          slug: 'dua-distress',
          title: 'أدعية الكرب',
          items: [
            makeDuaItem({
              id: 'dua-distress-1',
              text: 'لا إله إلا أنت سبحانك إني كنت من الظالمين',
              source: 'القرآن',
              reference: 'الأنبياء 87',
              description: 'دعاء يونس عليه السلام',
              originalCategory: 'الكرب',
              categorySlug: 'dua-distress',
              categoryTitle: 'أدعية الكرب',
            }),
            makeDuaItem({
              id: 'dua-distress-2',
              text: 'اللهم رحمتك أرجو فلا تكلني إلى نفسي طرفة عين',
              source: 'السنة',
              reference: 'أبو داود',
              repeatTarget: 3,
              originalCategory: 'الكرب',
              categorySlug: 'dua-distress',
              categoryTitle: 'أدعية الكرب',
            }),
          ],
        }),
        makeDuaCategory({
          slug: 'dua-travel',
          title: 'دعاء السفر',
          items: [makeDuaItem({ id: 'dua-travel-1', text: 'سبحان الذي سخر لنا هذا', source: 'السنة', categorySlug: 'dua-travel', categoryTitle: 'دعاء السفر' })],
        }),
      ],
      isLoading: false,
      error: null,
    });

    const markup = renderRouteWithShell({ path: '/duas', page: createElement(DuasPage) });

    assert.match(markup, /قسم الأدعية/);
    assert.match(markup, /أدعية الكرب/);
    assert.doesNotMatch(markup, /دعاء السفر <\/p>/);
    assert.match(markup, /المفضلة/);
    assert.match(markup, /القرآن، السنة|السنة، القرآن/);
    assert.match(markup, /★ مفضلة/);
    assert.match(markup, /تم اليوم/);
    assert.match(markup, /الأصل: الكرب/);
    assert.match(markup, /دعاء يونس عليه السلام/);
  });

  it('renders stories route with batch-aware category state, load-more affordance, and selected story hydration state', () => {
    const todayKey = getLocalDateKey();

    useStoriesStore.setState({
      searchQuery: '',
      selectedCategorySlug: 'story-prophets',
      selectedStoryId: 'story-prophets::2',
      recentCategorySlugs: ['story-prophets'],
      recentStoryIds: ['story-prophets::2', 'story-prophets::1'],
      favoriteIds: ['story-prophets::2'],
      completedByDate: { [todayKey]: ['story-prophets::1'] },
      categories: [
        makeStoryCategory({
          slug: 'story-prophets',
          title: 'قصص الأنبياء',
          preview: 'قصص مختصرة مع عبر واضحة.',
          itemCount: 3,
          summaryBatchCount: 2,
          summaryBatchSize: 2,
          loadedSummaryBatchIndexes: [0],
          itemIds: ['story-prophets::1', 'story-prophets::2', 'story-prophets::3'],
          items: [
            makeStoryItem({
              id: 'story-prophets::1',
              legacyId: 1,
              title: 'قصة آدم',
              excerpt: 'بداية الخلق والتكليف.',
              story: 'نص قصة آدم',
              lesson: 'الرجوع إلى الله',
              source: 'القرآن',
              categorySlug: 'story-prophets',
              categoryTitle: 'قصص الأنبياء',
              storyLoaded: true,
            }),
            makeStoryItem({
              id: 'story-prophets::2',
              legacyId: 2,
              title: 'قصة نوح',
              excerpt: 'الصبر الطويل في الدعوة.',
              story: null,
              lesson: 'الثبات',
              source: 'القرآن',
              categorySlug: 'story-prophets',
              categoryTitle: 'قصص الأنبياء',
              storyLoaded: false,
            }),
          ],
        }),
        makeStoryCategory({
          slug: 'story-companions',
          title: 'قصص الصحابة',
          preview: 'نماذج من الثبات والبذل.',
          items: [
            makeStoryItem({
              id: 'story-companions::1',
              legacyId: 1,
              title: 'قصة أبي بكر',
              excerpt: 'سبق ورفق وتضحية.',
              story: 'نص قصة أبي بكر',
              lesson: 'الصدق',
              source: 'السيرة',
              categorySlug: 'story-companions',
              categoryTitle: 'قصص الصحابة',
            }),
          ],
        }),
      ],
      isLoading: false,
      error: null,
    });

    const markup = renderRouteWithShell({ path: '/stories', page: createElement(StoriesPage) });

    assert.match(markup, /قسم القصص/);
    assert.match(markup, /قصص الأنبياء/);
    assert.match(markup, /والمحمل الآن 2 من 3/);
    assert.match(markup, /تحميل قصص إضافية/);
    assert.match(markup, /قصة نوح/);
    assert.match(markup, /إزالة من المفضلة/);
    assert.match(markup, /جاري تحميل نص القصة المختارة/);
    assert.match(markup, /قصص فتحتها مؤخرًا/);
    assert.match(markup, /قصة آدم/);
  });

  it('renders non-bottom-nav route metadata for names of allah with selected detail', () => {
    const todayKey = getLocalDateKey();
    useNamesOfAllahStore.setState({
      items: [
        {
          id: 'allah-name-1',
          order: 1,
          name: 'ٱلرَّحْمَٰن',
          description: 'واسع الرحمة بخلقه.',
          normalizedSearch: 'الرحمن واسع الرحمه بخلقه 1',
        },
        {
          id: 'allah-name-2',
          order: 2,
          name: 'ٱلرَّحِيم',
          description: 'الرحيم بالمؤمنين.',
          normalizedSearch: 'الرحيم بالمؤمنين 2',
        },
      ],
      selectedNameId: 'allah-name-1',
      recentNameIds: ['allah-name-2', 'allah-name-1'],
      favoriteIds: ['allah-name-1'],
      completedByDate: { [todayKey]: ['allah-name-1'] },
      searchQuery: 'الرح',
      isLoading: false,
      error: null,
    });

    const markup = renderRouteWithShell({ path: '/names-of-allah', page: createElement(NamesOfAllahPage) });

    assert.match(markup, /أسماء الله الحسنى/);
    assert.match(markup, /ٱلرَّحْمَٰن/);
    assert.match(markup, /إضافة إلى المفضلة|إزالة من المفضلة/);
    assert.match(markup, /آخر الأسماء المفتوحة/);
    assert.match(markup, /ٱلرَّحِيم/);
    assert.match(markup, /القائمة الظاهرة/);
  });

  it('renders stats route from aggregated snapshots across all feature stores', () => {
    const todayKey = getLocalDateKey();

    useTasksStore.setState({
      items: [
        { id: 'wird-1', title: 'ورد 1', completed: true, group: 'wird', isDefault: true },
        { id: 'wird-2', title: 'ورد 2', completed: true, group: 'wird', isDefault: true },
        { id: 'personal-1', title: 'شخصية 1', completed: false, group: 'personal', isDefault: false },
        { id: 'personal-2', title: 'شخصية 2', completed: false, group: 'personal', isDefault: false },
      ],
      dailyCompletions: { [todayKey]: ['wird-1', 'wird-2'] },
    });
    useMasbahaStore.setState({ currentTarget: 100, totalCount: 555, dailyCounts: { [todayKey]: 77 } });
    useAzkarStore.setState({ completedByDate: { [todayKey]: ['azkar-1', 'azkar-2', 'azkar-3'] } });
    useDuasStore.setState({ completedByDate: { [todayKey]: ['dua-1'] }, favoriteIds: ['dua-1', 'dua-2'] });
    useStoriesStore.setState({ completedByDate: { [todayKey]: ['story-category-1-prophets::1'] }, favoriteIds: ['story-category-1-prophets::1'] });
    useNamesOfAllahStore.setState({ completedByDate: { [todayKey]: ['allah-name-1', 'allah-name-2'] }, favoriteIds: ['allah-name-1'] });
    useQuranStore.setState({
      bookmark: { surahNumber: 18, surahName: 'الكهف', verseCount: 110, updatedAt: '2026-03-31T09:00:00.000Z' },
      dailyReadings: { [todayKey]: [18] },
    });

    const markup = renderRouteWithShell({ path: '/stats', page: createElement(StatsPage) });

    assert.match(markup, /الإحصائيات/);
    assert.match(markup, /المهام المنجزة/);
    assert.match(markup, /معدل الإنجاز الحالي/);
    assert.match(markup, /50%/);
    assert.match(markup, /historical aggregation = 2 مهمة و3 ذكرًا و1 دعاءً و1 قصة و2 اسمًا و77 تسبيحة و110 آية ضمن الفلتر المختار\./);
    assert.match(markup, /آخر سورة محفوظة = الكهف\./);
    assert.match(markup, /مفضلة الأدعية/);
    assert.match(markup, /سلسلة النشاط المركبة/);
  });

  it('renders profile route with signed-in account snapshot and internal navigation links', () => {
    usePreferencesStore.setState({ themeMode: 'dark' });
    useAuthStore.setState({
      user: { uid: 'user-1', displayName: 'يوسف', email: 'yousef@example.com', photoURL: null },
      isConfigured: true,
      isReady: true,
    });

    const markup = renderRouteWithShell({ path: '/profile', page: createElement(ProfilePage) });

    assert.match(markup, /الملف الشخصي/);
    assert.match(markup, /يوسف/);
    assert.match(markup, /yousef@example\.com/);
    assert.match(markup, /جلسة نشطة/);
    assert.match(markup, /Firebase Auth فقط/);
    assert.match(markup, /dark/);
    assert.match(markup, /سياسة الخصوصية/);
    assert.match(markup, /تواصل معنا/);
  });

  it('renders profile route guest fallback when auth is not configured', () => {
    usePreferencesStore.setState({ themeMode: 'system' });
    useAuthStore.setState({ user: null, isConfigured: false, isReady: true });

    const markup = renderRouteWithShell({ path: '/profile', page: createElement(ProfilePage) });

    assert.match(markup, /الملف الشخصي/);
    assert.match(markup, /زائر/);
    assert.match(markup, /بدون جلسة دخول حالياً/);
    assert.match(markup, /غير مهيأ/);
    assert.match(markup, /local-first/);
    assert.match(markup, /الإعدادات/);
  });

  it('renders unified about route inside the app shell instead of legacy standalone html', () => {
    const markup = renderRouteWithShell({ path: '/about', page: createElement(AboutPage) });

    assert.match(markup, /عن التطبيق/);
    assert.match(markup, /Local-first/);
    assert.match(markup, /بدون إعلانات/);
    assert.match(markup, /سياسة الخصوصية/);
    assert.match(markup, /تواصل معنا/);
  });

  it('renders privacy route with current architecture guarantees instead of legacy ad-sync text', () => {
    const markup = renderRouteWithShell({ path: '/privacy', page: createElement(PrivacyPage) });

    assert.match(markup, /سياسة الخصوصية/);
    assert.match(markup, /Firebase/);
    assert.match(markup, /تسجيل الدخول فقط/);
    assert.match(markup, /local-first/);
    assert.doesNotMatch(markup, /إعلانات مكافآت/);
    assert.match(markup, /لا نستخدم Firestore/);
  });

  it('renders contact route with official mail actions and internal legal links', () => {
    const markup = renderRouteWithShell({ path: '/contact', page: createElement(ContactPage) });

    assert.match(markup, /تواصل معنا/);
    assert.match(markup, /yosefmoh372@gmail\.com/);
    assert.match(markup, /اقتراح ميزة أو قسم جديد/);
    assert.match(markup, /عن التطبيق/);
    assert.match(markup, /سياسة الخصوصية/);
  });
});
