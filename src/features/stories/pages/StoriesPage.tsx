import { useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AppCard } from '@/shared/ui/primitives/AppCard';
import { AppSearchField } from '@/shared/ui/primitives/AppSearchField';
import { EmptyState } from '@/shared/ui/feedback/EmptyState';
import { SearchEmptyState } from '@/shared/ui/feedback/SearchEmptyState';
import { LoadStateNotice } from '@/shared/ui/feedback/LoadStateNotice';
import {
  getFavoriteStoryCount,
  getFavoriteStoryIds,
  getReadStoryIdsForToday,
  getSelectedStory,
  getSelectedStoryCategory,
  getStoriesActiveStreak,
  getStoryCategoryProgressForToday,
  getStoryCompletionCountForToday,
  getVisibleStoryCategories,
} from '@/features/stories/domain/story-selectors';
import { useStoriesStore } from '@/features/stories/state/stories-store';

export function StoriesPage() {
  const [searchParams] = useSearchParams();
  const initialize = useStoriesStore((state) => state.initialize);
  const ensureLoaded = useStoriesStore((state) => state.ensureLoaded);
  const categories = useStoriesStore((state) => state.categories);
  const isLoading = useStoriesStore((state) => state.isLoading);
  const error = useStoriesStore((state) => state.error);
  const searchQuery = useStoriesStore((state) => state.searchQuery);
  const selectedCategorySlug = useStoriesStore((state) => state.selectedCategorySlug);
  const selectedStoryId = useStoriesStore((state) => state.selectedStoryId);
  const completedByDate = useStoriesStore((state) => state.completedByDate);
  const favoriteIds = useStoriesStore((state) => state.favoriteIds);
  const recentCategorySlugs = useStoriesStore((state) => state.recentCategorySlugs);
  const recentStoryIds = useStoriesStore((state) => state.recentStoryIds);
  const setSearchQuery = useStoriesStore((state) => state.setSearchQuery);
  const setSelectedCategory = useStoriesStore((state) => state.setSelectedCategory);
  const setSelectedStory = useStoriesStore((state) => state.setSelectedStory);
  const toggleStoryCompleted = useStoriesStore((state) => state.toggleStoryCompleted);
  const toggleFavorite = useStoriesStore((state) => state.toggleFavorite);
  const resetTodayProgress = useStoriesStore((state) => state.resetTodayProgress);
  const loadMoreSelectedCategoryStories = useStoriesStore((state) => state.loadMoreSelectedCategoryStories);

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
      selectedStoryId,
      completedByDate,
      favoriteIds,
      recentCategorySlugs,
      recentStoryIds,
    }),
    [categories, completedByDate, error, favoriteIds, isLoading, recentCategorySlugs, recentStoryIds, searchQuery, selectedCategorySlug, selectedStoryId],
  );

  const visibleCategories = useMemo(() => getVisibleStoryCategories(stateSnapshot), [stateSnapshot]);
  const selectedCategory = useMemo(() => getSelectedStoryCategory(stateSnapshot), [stateSnapshot]);
  const selectedStory = useMemo(() => getSelectedStory(stateSnapshot), [stateSnapshot]);
  const completedToday = useMemo(() => getStoryCompletionCountForToday(stateSnapshot), [stateSnapshot]);
  const completedSet = useMemo(() => getReadStoryIdsForToday(stateSnapshot), [stateSnapshot]);
  const favoriteSet = useMemo(() => getFavoriteStoryIds(stateSnapshot), [stateSnapshot]);
  const favoriteCount = useMemo(() => getFavoriteStoryCount(stateSnapshot), [stateSnapshot]);
  const activeStreak = useMemo(() => getStoriesActiveStreak(stateSnapshot), [stateSnapshot]);
  const selectedProgress = selectedCategory ? getStoryCategoryProgressForToday(stateSnapshot, selectedCategory.slug) : { completed: 0, total: 0 };
  const hasMoreSelectedStories = Boolean(selectedCategory && selectedCategory.loadedSummaryBatchIndexes.length < selectedCategory.summaryBatchCount);

  const quickCategories = recentCategorySlugs
    .map((slug) => categories.find((category) => category.slug === slug))
    .filter((category): category is NonNullable<typeof category> => Boolean(category));

  const quickStories = recentStoryIds
    .map((storyId) => categories.flatMap((category) => category.items).find((item) => item.id === storyId))
    .filter((story): story is NonNullable<typeof story> => Boolean(story))
    .slice(0, 6);

  return (
    <div className="space-y-4">
      <AppCard title="قسم القصص" subtitle="قصص إسلامية مختارة للقراءة والتأمل">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
          <SummaryBox label="الفئات" value={String(categories.length)} />
          <SummaryBox label="إجمالي القصص" value={String(categories.reduce((sum, category) => sum + category.itemCount, 0))} />
          <SummaryBox label="مقروء اليوم" value={String(completedToday)} />
          <SummaryBox label="المفضلة" value={String(favoriteCount)} />
          <SummaryBox label="سلسلة النشاط" value={`${activeStreak} يوم`} />
        </div>

        <div className="mt-4">
          <AppSearchField
            id="stories-search"
            label="ابحث في العنوان أو ملخص القصة أو العبرة"
            query={searchQuery}
            onQueryChange={setSearchQuery}
            placeholder="مثال: الصبر أو موسى أو الصحابة"
          />
        </div>

        {quickCategories.length > 0 ? (
          <div className="mt-4">
            <p className="mb-2 text-xs font-semibold text-slate-500 dark:text-slate-300">فئات حديثة</p>
            <div className="flex flex-wrap gap-2">
              {quickCategories.map((category) => {
                const progress = getStoryCategoryProgressForToday(stateSnapshot, category.slug);
                return (
                  <button
                    key={category.slug}
                    type="button"
                    onClick={() => setSelectedCategory(category.slug)}
                    className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-sky-300 hover:text-sky-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                  >
                    {category.title} • {progress.completed}/{progress.total}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        {quickStories.length > 0 ? (
          <div className="mt-4">
            <p className="mb-2 text-xs font-semibold text-slate-500 dark:text-slate-300">قصص فتحتها مؤخرًا</p>
            <div className="flex flex-wrap gap-2">
              {quickStories.map((story) => (
                <button
                  key={story.id}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(story.categorySlug);
                    setSelectedStory(story.id);
                  }}
                  className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-sky-300 hover:text-sky-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                >
                  {story.title}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </AppCard>

      {error ? <LoadStateNotice title="تعذر تحميل القصص" body={error} tone="error" actionLabel="إعادة المحاولة" onAction={() => void ensureLoaded()} /> : null}
      {isLoading ? <LoadStateNotice title="جاري تحميل القصص" body="نحضّر فئات القصص وملخصاتها لتبدأ القراءة بهدوء." /> : null}

      {!isLoading && visibleCategories.length === 0 ? (
        searchQuery.trim() ? (
          <SearchEmptyState title="لا توجد نتائج" body="جرّب عبارة بحث أقصر أو امسح البحث الحالي لرؤية فئات القصص الكاملة." onClear={() => setSearchQuery('')} />
        ) : (
          <EmptyState title="لا توجد فئات متاحة" body="تعذر عرض القصص الآن. حاول مجددًا بعد لحظات." />
        )
      ) : null}

      {visibleCategories.length > 0 ? (
        <AppCard title="فئات القصص" subtitle="اختر فئة لاستعراض قصصها">
          <div className="flex flex-wrap gap-2">
            {visibleCategories.map((category) => {
              const progress = getStoryCategoryProgressForToday(stateSnapshot, category.slug);
              const selected = selectedCategory?.slug === category.slug;
              return (
                <button
                  key={category.slug}
                  type="button"
                  onClick={() => setSelectedCategory(category.slug)}
                  className={[
                    'rounded-[24px] border px-4 py-3 text-sm font-semibold transition text-right',
                    selected
                      ? 'border-sky-500 bg-sky-50 text-sky-900 dark:border-sky-700 dark:bg-sky-950/40 dark:text-sky-100'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-sky-300 hover:text-sky-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200',
                  ].join(' ')}
                >
                  <p>{category.title}</p>
                  <p className="mt-1 text-xs font-medium opacity-80">{category.itemCount} قصة • {progress.completed}/{progress.total}</p>
                </button>
              );
            })}
          </div>
        </AppCard>
      ) : null}

      {selectedCategory ? (
        <div className="grid gap-4 lg:grid-cols-[1.05fr_1.4fr]">
          <AppCard
            title={selectedCategory.title}
            subtitle={selectedCategory.itemsLoaded ? `تمت قراءة ${selectedProgress.completed} من ${selectedProgress.total} اليوم داخل الفئة المختارة، والمحمل الآن ${selectedCategory.items.length} من ${selectedCategory.itemCount}.` : 'يتم الآن تحميل عناصر الفئة المختارة عند الطلب.'}
          >
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="rounded-3xl bg-emerald-50 px-4 py-3 dark:bg-emerald-950/30">
                <p className="text-xs text-emerald-700 dark:text-emerald-300">تقدم اليوم</p>
                <p className="mt-1 text-lg font-bold text-emerald-900 dark:text-emerald-100">{selectedProgress.completed} / {selectedProgress.total}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {hasMoreSelectedStories ? (
                  <button
                    type="button"
                    onClick={() => void loadMoreSelectedCategoryStories()}
                    className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-semibold text-sky-800 transition hover:border-sky-300 hover:text-sky-900 dark:border-sky-800 dark:bg-sky-950/30 dark:text-sky-100"
                  >
                    تحميل قصص إضافية
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={resetTodayProgress}
                  className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-rose-300 hover:text-rose-700 dark:border-slate-700 dark:text-slate-200"
                >
                  تصفير قراءة اليوم
                </button>
              </div>
            </div>

            {!selectedCategory.itemsLoaded ? (
              <div className="rounded-[28px] border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300">
                جاري تحميل قصص هذه الفئة عند الطلب…
              </div>
            ) : (
              <ul className="space-y-3">
                {selectedCategory.items.map((story) => {
                const selected = selectedStory?.id === story.id;
                const completed = completedSet.has(story.id);
                const favorited = favoriteSet.has(story.id);
                return (
                  <li key={story.id} className={[
                    'rounded-[28px] border px-4 py-4 transition',
                    selected
                      ? 'border-sky-500 bg-sky-50 dark:border-sky-700 dark:bg-sky-950/30'
                      : 'border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/80',
                  ].join(' ')}>
                    <button type="button" onClick={() => setSelectedStory(story.id)} className="block w-full text-right">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-slate-900 dark:text-slate-50">{story.title}</p>
                          <p className="mt-2 text-xs leading-6 text-slate-600 dark:text-slate-300">{story.excerpt}</p>
                        </div>
                        <div className="flex shrink-0 flex-wrap gap-2 text-xs">
                          {completed ? <span className="rounded-full bg-emerald-100 px-3 py-1 font-semibold text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200">مقروء اليوم</span> : null}
                          {favorited ? <span className="rounded-full bg-amber-100 px-3 py-1 font-semibold text-amber-800 dark:bg-amber-950/50 dark:text-amber-200">مفضلة</span> : null}
                        </div>
                      </div>
                    </button>
                  </li>
                );
                })}
              </ul>
            )}
          </AppCard>

          {selectedStory ? (
            <AppCard title={selectedStory.title} subtitle={selectedStory.lesson ?? 'لا توجد عبرة مرفقة لهذه القصة.'}>
              <div className="mb-4 flex flex-wrap gap-2">
                {selectedStory.source ? (
                  <span className="rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                    المصدر: {selectedStory.source}
                  </span>
                ) : null}
                <button
                  type="button"
                  onClick={() => toggleFavorite(selectedStory.id)}
                  className={[
                    'rounded-full border px-3 py-2 text-xs font-semibold transition',
                    favoriteSet.has(selectedStory.id)
                      ? 'border-amber-400 bg-amber-50 text-amber-900 dark:border-amber-600 dark:bg-amber-950/40 dark:text-amber-100'
                      : 'border-slate-200 text-slate-600 hover:border-amber-300 hover:text-amber-700 dark:border-slate-700 dark:text-slate-200',
                  ].join(' ')}
                >
                  {favoriteSet.has(selectedStory.id) ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}
                </button>
                <button
                  type="button"
                  onClick={() => toggleStoryCompleted(selectedStory.id)}
                  className={[
                    'rounded-full border px-3 py-2 text-xs font-semibold transition',
                    completedSet.has(selectedStory.id)
                      ? 'border-emerald-500 bg-emerald-500 text-white'
                      : 'border-slate-200 text-slate-600 hover:border-emerald-300 hover:text-emerald-700 dark:border-slate-700 dark:text-slate-200',
                  ].join(' ')}
                >
                  {completedSet.has(selectedStory.id) ? 'إلغاء قراءة اليوم' : 'تأكيد قراءة اليوم'}
                </button>
              </div>

              {selectedStory.storyLoaded === false ? (
                <div className="rounded-[28px] border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300">
                  جاري تحميل نص القصة المختارة…
                </div>
              ) : (
                <article className="rounded-[28px] bg-slate-50 p-4 dark:bg-slate-800/70">
                  <p className="app-reading-text whitespace-pre-line text-sm text-slate-900 dark:text-slate-50">{selectedStory.story}</p>
                </article>
              )}
            </AppCard>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

interface SummaryBoxProps {
  label: string;
  value: string;
}

function SummaryBox({ label, value }: SummaryBoxProps) {
  return (
    <div className="rounded-3xl bg-slate-50 p-3 dark:bg-slate-800/70">
      <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-2 text-lg font-bold text-slate-900 dark:text-slate-50">{value}</p>
    </div>
  );
}
