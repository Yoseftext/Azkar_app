import { useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AppCard } from '@/shared/ui/primitives/AppCard';
import { AppSearchField } from '@/shared/ui/primitives/AppSearchField';
import { EmptyState } from '@/shared/ui/feedback/EmptyState';
import { SearchEmptyState } from '@/shared/ui/feedback/SearchEmptyState';
import { LoadStateNotice } from '@/shared/ui/feedback/LoadStateNotice';
import {
  getAzkarActiveStreak,
  getAzkarCategoryProgressForToday,
  getAzkarCompletionCountForToday,
  getCompletedAzkarIdsForToday,
  getSelectedAzkarCategory,
  getVisibleAzkarCategories,
} from '@/features/azkar/domain/azkar-selectors';
import { getAzkarResumeRecommendation, getAzkarRitualHero, getAzkarSessionCards } from '@/features/azkar/domain/azkar-ritual-flow';
import { useAzkarStore } from '@/features/azkar/state/azkar-store';
import { AzkarRitualHero } from '@/features/azkar/components/AzkarRitualHero';
import { AzkarCategoryPicker } from '@/features/azkar/components/AzkarCategoryPicker';
import { AzkarItemsList } from '@/features/azkar/components/AzkarItemsList';
import { StatTile } from '@/shared/ui/primitives/StatTile';

export function AzkarPage() {
  const [searchParams] = useSearchParams();
  const initialize = useAzkarStore((state) => state.initialize);
  const ensureLoaded = useAzkarStore((state) => state.ensureLoaded);
  const categories = useAzkarStore((state) => state.categories);
  const isLoading = useAzkarStore((state) => state.isLoading);
  const error = useAzkarStore((state) => state.error);
  const searchQuery = useAzkarStore((state) => state.searchQuery);
  const selectedCategorySlug = useAzkarStore((state) => state.selectedCategorySlug);
  const completedByDate = useAzkarStore((state) => state.completedByDate);
  const recentCategorySlugs = useAzkarStore((state) => state.recentCategorySlugs);
  const setSearchQuery = useAzkarStore((state) => state.setSearchQuery);
  const setSelectedCategory = useAzkarStore((state) => state.setSelectedCategory);
  const toggleItemCompleted = useAzkarStore((state) => state.toggleItemCompleted);
  const resetTodayProgress = useAzkarStore((state) => state.resetTodayProgress);

  useEffect(() => {
    initialize();
    void ensureLoaded();
  }, [ensureLoaded, initialize]);

  useEffect(() => {
    const hasSearchQueryParam = searchParams.has('query');
    const searchQueryFromUrl = searchParams.get('query') ?? '';
    const categoryFromUrl = searchParams.get('category')?.trim() ?? '';
    if (hasSearchQueryParam && searchQueryFromUrl !== searchQuery) setSearchQuery(searchQueryFromUrl);
    if (categoryFromUrl && categories.some((category) => category.slug === categoryFromUrl) && selectedCategorySlug !== categoryFromUrl) {
      setSelectedCategory(categoryFromUrl);
    }
  }, [categories, searchParams, searchQuery, selectedCategorySlug, setSearchQuery, setSelectedCategory]);

  const stateSnapshot = useMemo(
    () => ({
      isInitialized: true,
      isLoading,
      error,
      categories,
      searchQuery,
      selectedCategorySlug,
      completedByDate,
      recentCategorySlugs,
    }),
    [categories, completedByDate, error, isLoading, recentCategorySlugs, searchQuery, selectedCategorySlug],
  );

  const visibleCategories = useMemo(() => getVisibleAzkarCategories(stateSnapshot), [stateSnapshot]);
  const selectedCategory = useMemo(() => getSelectedAzkarCategory(stateSnapshot), [stateSnapshot]);
  const completedToday = useMemo(() => getAzkarCompletionCountForToday(stateSnapshot), [stateSnapshot]);
  const completedSet = useMemo(() => getCompletedAzkarIdsForToday(stateSnapshot), [stateSnapshot]);
  const activeStreak = useMemo(() => getAzkarActiveStreak(stateSnapshot), [stateSnapshot]);
  const selectedProgress = selectedCategory ? getAzkarCategoryProgressForToday(stateSnapshot, selectedCategory.slug) : { completed: 0, total: 0 };
  const ritualHero = useMemo(() => getAzkarRitualHero(stateSnapshot), [stateSnapshot]);
  const sessionCards = useMemo(() => getAzkarSessionCards(stateSnapshot), [stateSnapshot]);
  const resumeCategory = useMemo(() => getAzkarResumeRecommendation(stateSnapshot), [stateSnapshot]);

  return (
    <div className="space-y-4">
      <AzkarRitualHero hero={ritualHero} sessions={sessionCards} onOpenCategory={setSelectedCategory} />

      <AppCard title="قسم الأذكار" subtitle="جلسات أسرع، استكمال أوضح، وبحث مباشر داخل التصنيفات ونصوص الأذكار.">
        <div className="grid grid-cols-3 gap-3">
          <StatTile label="التصنيفات" value={String(categories.length)} hint="محملة وجاهزة" />
          <StatTile label="منجز اليوم" value={String(completedToday)} hint="أذكار مؤداة" variant="emerald" />
          <StatTile label="سلسلة النشاط" value={`${activeStreak} يوم`} hint="أيام متتابعة" variant="amber" />
        </div>

        <div className="mt-4">
          <AppSearchField
            id="azkar-search"
            label="ابحث في التصنيفات أو نص الذكر"
            query={searchQuery}
            onQueryChange={setSearchQuery}
            placeholder="مثال: الصباح أو الحمد لله"
          />
        </div>

        {resumeCategory ? (
          <div className="mt-4 rounded-[var(--ui-radius-panel)] border border-slate-200 bg-slate-50 px-4 py-4 dark:border-slate-700 dark:bg-slate-800/70">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-300">تابع آخر جلسة</p>
            <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-slate-50">{resumeCategory.title}</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{resumeCategory.completed}/{resumeCategory.total} منجز اليوم</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCategory(resumeCategory.slug)}
                className="rounded-[var(--ui-radius-control)] border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-sky-300 hover:text-sky-700 dark:border-slate-700 dark:text-slate-200"
              >
                متابعة
              </button>
            </div>
          </div>
        ) : null}
      </AppCard>

      {error ? <LoadStateNotice title="تعذر تحميل الأذكار" body={error} tone="error" actionLabel="إعادة المحاولة" onAction={() => void ensureLoaded()} /> : null}
      {isLoading ? <LoadStateNotice title="جاري تحميل الأذكار" body="نجهز التصنيفات وعناصرها لتبدأ بسرعة ومن حيث توقفت." /> : null}

      {!isLoading && visibleCategories.length === 0 ? (
        searchQuery.trim() ? (
          <SearchEmptyState title="لا توجد نتائج" body="جرّب عبارة أقصر أو امسح البحث الحالي لرؤية التصنيفات الكاملة." onClear={() => setSearchQuery('')} />
        ) : (
          <EmptyState title="لا توجد نتائج" body="لا توجد تصنيفات متاحة الآن." />
        )
      ) : null}

      <AzkarCategoryPicker
        categories={visibleCategories}
        selectedSlug={selectedCategory?.slug ?? null}
        getProgressLabel={(slug) => {
          const progress = getAzkarCategoryProgressForToday(stateSnapshot, slug);
          return `${progress.completed}/${progress.total}`;
        }}
        onSelect={setSelectedCategory}
      />

      {selectedCategory ? (
        <AzkarItemsList
          category={selectedCategory}
          completedItemIds={completedSet}
          completed={selectedProgress.completed}
          total={selectedProgress.total}
          onToggleCompleted={toggleItemCompleted}
          onResetToday={resetTodayProgress}
        />
      ) : null}
    </div>
  );
}
