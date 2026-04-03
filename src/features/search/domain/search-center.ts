import { loadAzkarCategorySummaries, filterLoadedAzkarCategories } from '@/content/loaders/load-azkar';
import { loadDuaCategorySummaries, filterLoadedDuaCategories } from '@/content/loaders/load-duas';
import { loadStoryCategorySummaries, filterLoadedStoryCategories } from '@/content/loaders/load-stories';
import { loadAllahNames, filterLoadedAllahNames } from '@/content/loaders/load-names';
import { filterQuranSurahs } from '@/content/loaders/load-quran';
import { normalizeSearchTerm } from '@/shared/lib/search';

export type SearchSectionKey = 'quran' | 'azkar' | 'duas' | 'stories' | 'names';

export interface SearchCenterResult {
  id: string;
  sectionKey: SearchSectionKey;
  sectionTitle: string;
  icon: string;
  title: string;
  subtitle: string;
  description?: string;
  route: string;
}

export interface SearchCenterGroup {
  sectionKey: SearchSectionKey;
  sectionTitle: string;
  icon: string;
  route: string;
  items: SearchCenterResult[];
}

const SECTION_META: Record<SearchSectionKey, { title: string; icon: string; route: string }> = {
  quran: { title: 'القرآن', icon: '📖', route: '/quran' },
  azkar: { title: 'الأذكار', icon: '☀️', route: '/azkar' },
  duas: { title: 'الأدعية', icon: '🤲', route: '/duas' },
  stories: { title: 'القصص', icon: '📚', route: '/stories' },
  names: { title: 'الأسماء الحسنى', icon: '✨', route: '/names-of-allah' },
};

const MAX_RESULTS_PER_SECTION = 4;

function withQuery(route: string, params: Record<string, string | number | null | undefined>): string {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === null || value === undefined || value === '') continue;
    searchParams.set(key, String(value));
  }
  const encoded = searchParams.toString();
  return encoded ? `${route}?${encoded}` : route;
}

function buildGroup(sectionKey: SearchSectionKey, items: SearchCenterResult[]): SearchCenterGroup {
  const meta = SECTION_META[sectionKey];
  return { sectionKey, sectionTitle: meta.title, icon: meta.icon, route: meta.route, items: items.slice(0, MAX_RESULTS_PER_SECTION) };
}

export async function searchAppContent(query: string): Promise<SearchCenterGroup[]> {
  const normalizedQuery = normalizeSearchTerm(query);
  if (!normalizedQuery) return [];
  const [azkarCategories, duaCategories, storyCategories, names] = await Promise.all([
    loadAzkarCategorySummaries(),
    loadDuaCategorySummaries(),
    loadStoryCategorySummaries(),
    loadAllahNames(),
  ]);

  const quranResults: SearchCenterResult[] = filterQuranSurahs(query).slice(0, MAX_RESULTS_PER_SECTION).map((surah) => ({
    id: `quran-${surah.surahNumber}`,
    sectionKey: 'quran',
    sectionTitle: SECTION_META.quran.title,
    icon: SECTION_META.quran.icon,
    title: surah.surahName,
    subtitle: `سورة رقم ${surah.surahNumber}`,
    description: `${surah.verseCount} آية`,
    route: withQuery(SECTION_META.quran.route, { query: surah.surahName, surah: surah.surahNumber }),
  }));
  const azkarResults: SearchCenterResult[] = filterLoadedAzkarCategories(azkarCategories, query).slice(0, MAX_RESULTS_PER_SECTION).map((category) => ({
    id: `azkar-${category.slug}`,
    sectionKey: 'azkar',
    sectionTitle: SECTION_META.azkar.title,
    icon: SECTION_META.azkar.icon,
    title: category.title,
    subtitle: `${category.itemCount} ذكر`,
    description: category.preview || 'افتح الفئة لمتابعة جلسة الأذكار.',
    route: withQuery(SECTION_META.azkar.route, { query: category.title, category: category.slug }),
  }));
  const duaResults: SearchCenterResult[] = filterLoadedDuaCategories(duaCategories, query).slice(0, MAX_RESULTS_PER_SECTION).map((category) => ({
    id: `dua-${category.slug}`,
    sectionKey: 'duas',
    sectionTitle: SECTION_META.duas.title,
    icon: SECTION_META.duas.icon,
    title: category.title,
    subtitle: `${category.itemCount} دعاء`,
    description: category.preview,
    route: withQuery(SECTION_META.duas.route, { query: category.title, category: category.slug }),
  }));
  const storyResults: SearchCenterResult[] = filterLoadedStoryCategories(storyCategories, query).slice(0, MAX_RESULTS_PER_SECTION).map((category) => ({
    id: `story-${category.slug}`,
    sectionKey: 'stories',
    sectionTitle: SECTION_META.stories.title,
    icon: SECTION_META.stories.icon,
    title: category.title,
    subtitle: `${category.itemCount} قصة`,
    description: category.preview,
    route: withQuery(SECTION_META.stories.route, { query: category.title, category: category.slug }),
  }));
  const nameResults: SearchCenterResult[] = filterLoadedAllahNames(names, query).slice(0, MAX_RESULTS_PER_SECTION).map((item) => ({
    id: item.id,
    sectionKey: 'names',
    sectionTitle: SECTION_META.names.title,
    icon: SECTION_META.names.icon,
    title: item.name,
    subtitle: `الاسم رقم ${item.order}`,
    description: item.description,
    route: withQuery(SECTION_META.names.route, { query: item.name, name: item.id }),
  }));

  return [buildGroup('quran', quranResults), buildGroup('azkar', azkarResults), buildGroup('duas', duaResults), buildGroup('stories', storyResults), buildGroup('names', nameResults)].filter((group) => group.items.length > 0);
}

export function getSearchQuickLinks(): Array<{ title: string; body: string; route: string; icon: string }> {
  return [
    { title: 'ابحث في القرآن', body: 'بالاسم أو رقم السورة', route: SECTION_META.quran.route, icon: SECTION_META.quran.icon },
    { title: 'ابحث في الأذكار', body: 'جلسات وفئات وأذكار شائعة', route: SECTION_META.azkar.route, icon: SECTION_META.azkar.icon },
    { title: 'ابحث في الأدعية', body: 'حسب الفئة أو المرجع', route: SECTION_META.duas.route, icon: SECTION_META.duas.icon },
    { title: 'ابحث في القصص', body: 'العنوان أو العبرة', route: SECTION_META.stories.route, icon: SECTION_META.stories.icon },
    { title: 'ابحث في الأسماء الحسنى', body: 'الاسم أو المعنى', route: SECTION_META.names.route, icon: SECTION_META.names.icon },
  ];
}
