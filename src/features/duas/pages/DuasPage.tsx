import { useEffect, useMemo } from 'react';
import { AppCard } from '@/shared/ui/primitives/AppCard';
import { EmptyState } from '@/shared/ui/feedback/EmptyState';
import {
  getCompletedDuaIdsForToday,
  getDuaCategoryProgressForToday,
  getDuaCompletionCountForToday,
  getDuasActiveStreak,
  getFavoriteDuaCount,
  getFavoriteDuaIds,
  getSelectedDuaCategory,
  getVisibleDuaCategories,
} from '@/features/duas/domain/dua-selectors';
import { useDuasStore } from '@/features/duas/state/duas-store';

export function DuasPage() {
  const initialize = useDuasStore((state) => state.initialize);
  const ensureLoaded = useDuasStore((state) => state.ensureLoaded);
  const categories = useDuasStore((state) => state.categories);
  const isLoading = useDuasStore((state) => state.isLoading);
  const error = useDuasStore((state) => state.error);
  const searchQuery = useDuasStore((state) => state.searchQuery);
  const selectedCategorySlug = useDuasStore((state) => state.selectedCategorySlug);
  const completedByDate = useDuasStore((state) => state.completedByDate);
  const favoriteIds = useDuasStore((state) => state.favoriteIds);
  const recentCategorySlugs = useDuasStore((state) => state.recentCategorySlugs);
  const setSearchQuery = useDuasStore((state) => state.setSearchQuery);
  const setSelectedCategory = useDuasStore((state) => state.setSelectedCategory);
  const toggleItemCompleted = useDuasStore((state) => state.toggleItemCompleted);
  const toggleFavorite = useDuasStore((state) => state.toggleFavorite);
  const resetTodayProgress = useDuasStore((state) => state.resetTodayProgress);

  useEffect(() => {
    initialize();
    void ensureLoaded();
  }, [ensureLoaded, initialize]);

  const stateSnapshot = useMemo(
    () => ({
      isInitialized: true,
      isLoading,
      error,
      categories,
      searchQuery,
      selectedCategorySlug,
      completedByDate,
      favoriteIds,
      recentCategorySlugs,
    }),
    [categories, completedByDate, error, favoriteIds, isLoading, recentCategorySlugs, searchQuery, selectedCategorySlug],
  );

  const visibleCategories = useMemo(() => getVisibleDuaCategories(stateSnapshot), [stateSnapshot]);
  const selectedCategory = useMemo(() => getSelectedDuaCategory(stateSnapshot), [stateSnapshot]);
  const completedToday = useMemo(() => getDuaCompletionCountForToday(stateSnapshot), [stateSnapshot]);
  const completedSet = useMemo(() => getCompletedDuaIdsForToday(stateSnapshot), [stateSnapshot]);
  const favoriteSet = useMemo(() => getFavoriteDuaIds(stateSnapshot), [stateSnapshot]);
  const favoriteCount = useMemo(() => getFavoriteDuaCount(stateSnapshot), [stateSnapshot]);
  const activeStreak = useMemo(() => getDuasActiveStreak(stateSnapshot), [stateSnapshot]);
  const selectedProgress = selectedCategory ? getDuaCategoryProgressForToday(stateSnapshot, selectedCategory.slug) : { completed: 0, total: 0 };

  const quickCategories = recentCategorySlugs
    .map((slug) => categories.find((category) => category.slug === slug))
    .filter((category): category is NonNullable<typeof category> => Boolean(category));

  return (
    <div className="space-y-4">
      <AppCard title="قسم الأدعية" subtitle="الآن صار module فعلية: lazy data load، favorites، progress يومي، وفصل واضح بين content وstate وUI.">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <SummaryBox label="الفئات" value={String(categories.length)} />
          <SummaryBox label="منجز اليوم" value={String(completedToday)} />
          <SummaryBox label="المفضلة" value={String(favoriteCount)} />
          <SummaryBox label="سلسلة النشاط" value={`${activeStreak} يوم`} />
        </div>

        <div className="mt-4 rounded-3xl bg-slate-50 p-3 dark:bg-slate-800/70">
          <label htmlFor="duas-search" className="text-xs font-semibold text-slate-500 dark:text-slate-300">
            ابحث في الفئات أو نص الدعاء أو المرجع
          </label>
          <input
            id="duas-search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="مثال: القرآن أو الكرب أو آية"
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-sky-500 dark:border-slate-700 dark:bg-slate-900"
          />
        </div>

        {quickCategories.length > 0 ? (
          <div className="mt-4">
            <p className="mb-2 text-xs font-semibold text-slate-500 dark:text-slate-300">فئات حديثة</p>
            <div className="flex flex-wrap gap-2">
              {quickCategories.map((category) => {
                const progress = getDuaCategoryProgressForToday(stateSnapshot, category.slug);
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
      </AppCard>

      {error ? <AppCard><p className="text-sm text-rose-600 dark:text-rose-300">{error}</p></AppCard> : null}
      {isLoading ? <AppCard><p className="text-sm text-slate-500 dark:text-slate-400">جاري تحميل الأدعية…</p></AppCard> : null}

      {!isLoading && visibleCategories.length === 0 ? (
        <EmptyState title="لا توجد نتائج" body="جرّب تغيير كلمة البحث أو امسح الفلتر الحالي لرؤية فئات الأدعية الكاملة." />
      ) : null}

      {visibleCategories.length > 0 ? (
        <AppCard title="فئات الأدعية" subtitle="الاختيار محفوظ محليًا، والبحث يعمل على عنوان الفئة ونصوص الأدعية داخلها دون أي orchestrator مركزي.">
          <div className="flex flex-wrap gap-2">
            {visibleCategories.map((category) => {
              const progress = getDuaCategoryProgressForToday(stateSnapshot, category.slug);
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
                  <p className="mt-1 text-xs font-medium opacity-80">{category.itemCount} دعاء • {progress.completed}/{progress.total}</p>
                </button>
              );
            })}
          </div>
        </AppCard>
      ) : null}

      {selectedCategory ? (
        <AppCard
          title={selectedCategory.title}
          subtitle={`تم إنجاز ${selectedProgress.completed} من ${selectedProgress.total} اليوم. المصادر المتاحة: ${selectedCategory.sources.join('، ') || 'غير محدد'}.`}
        >
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="rounded-3xl bg-emerald-50 px-4 py-3 dark:bg-emerald-950/30">
              <p className="text-xs text-emerald-700 dark:text-emerald-300">تقدم اليوم</p>
              <p className="mt-1 text-lg font-bold text-emerald-900 dark:text-emerald-100">{selectedProgress.completed} / {selectedProgress.total}</p>
            </div>
            <button
              type="button"
              onClick={resetTodayProgress}
              className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-rose-300 hover:text-rose-700 dark:border-slate-700 dark:text-slate-200"
            >
              تصفير إنجاز اليوم
            </button>
          </div>

          {!selectedCategory.itemsLoaded ? (
            <div className="rounded-[28px] border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300">
              جاري تحميل عناصر هذه الفئة عند الطلب…
            </div>
          ) : (
            <ul className="space-y-3">
              {selectedCategory.items.map((item) => {
              const completed = completedSet.has(item.id);
              const favorited = favoriteSet.has(item.id);
              return (
                <li key={item.id} className="rounded-[28px] border border-slate-200 bg-slate-50 px-4 py-4 dark:border-slate-700 dark:bg-slate-800/80">
                  <div className="flex items-start gap-3">
                    <button
                      type="button"
                      onClick={() => toggleItemCompleted(item.id)}
                      className={[
                        'mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-sm font-bold transition',
                        completed
                          ? 'border-emerald-500 bg-emerald-500 text-white'
                          : 'border-slate-300 text-slate-400 dark:border-slate-600 dark:text-slate-500',
                      ].join(' ')}
                      aria-label={completed ? 'إلغاء إنجاز الدعاء' : 'تأكيد إنجاز الدعاء'}
                    >
                      ✓
                    </button>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <p className="text-sm leading-8 text-slate-900 dark:text-slate-50">{item.text}</p>
                        <button
                          type="button"
                          onClick={() => toggleFavorite(item.id)}
                          className={[
                            'rounded-full border px-3 py-1 text-xs font-semibold transition',
                            favorited
                              ? 'border-amber-400 bg-amber-100 text-amber-900 dark:border-amber-600 dark:bg-amber-950/40 dark:text-amber-200'
                              : 'border-slate-300 bg-white text-slate-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-300',
                          ].join(' ')}
                        >
                          {favorited ? '★ مفضلة' : '☆ أضف للمفضلة'}
                        </button>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2 text-xs">
                        {item.repeatTarget ? (
                          <span className="rounded-full bg-sky-100 px-3 py-1 font-semibold text-sky-800 dark:bg-sky-950/50 dark:text-sky-200">
                            التكرار {item.repeatTarget}
                          </span>
                        ) : null}
                        {item.source ? (
                          <span className="rounded-full bg-violet-100 px-3 py-1 font-semibold text-violet-800 dark:bg-violet-950/50 dark:text-violet-200">
                            {item.source}
                          </span>
                        ) : null}
                        {item.reference ? (
                          <span className="rounded-full bg-slate-200 px-3 py-1 font-semibold text-slate-700 dark:bg-slate-700 dark:text-slate-100">
                            {item.reference}
                          </span>
                        ) : null}
                        {item.originalCategory ? (
                          <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-600 dark:bg-slate-900 dark:text-slate-300">
                            الأصل: {item.originalCategory}
                          </span>
                        ) : null}
                        {completed ? (
                          <span className="rounded-full bg-emerald-100 px-3 py-1 font-semibold text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200">
                            تم اليوم
                          </span>
                        ) : null}
                      </div>

                      {item.description ? (
                        <p className="mt-3 text-xs leading-6 text-slate-500 dark:text-slate-400">{item.description}</p>
                      ) : null}
                    </div>
                  </div>
                </li>
              );
              })}
            </ul>
          )}
        </AppCard>
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
