import { useEffect, useMemo } from 'react';
import { AppCard } from '@/shared/ui/primitives/AppCard';
import { EmptyState } from '@/shared/ui/feedback/EmptyState';
import { getAzkarActiveStreak, getAzkarCategoryProgressForToday, getAzkarCompletionCountForToday, getCompletedAzkarIdsForToday, getSelectedAzkarCategory, getVisibleAzkarCategories } from '@/features/azkar/domain/azkar-selectors';
import { useAzkarStore } from '@/features/azkar/state/azkar-store';

export function AzkarPage() {
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

  const quickCategories = recentCategorySlugs
    .map((slug) => categories.find((category) => category.slug === slug))
    .filter((category): category is NonNullable<typeof category> => Boolean(category));

  return (
    <div className="space-y-4">
      <AppCard title="قسم الأذكار" subtitle="الآن صار module فعلية: تحميل typed، تتبع إنجاز يومي، واختيار تصنيف مستقل عن الصفحة الرئيسية.">
        <div className="grid grid-cols-3 gap-3">
          <SummaryBox label="التصنيفات" value={String(categories.length)} />
          <SummaryBox label="منجز اليوم" value={String(completedToday)} />
          <SummaryBox label="سلسلة النشاط" value={`${activeStreak} يوم`} />
        </div>

        <div className="mt-4 rounded-3xl bg-slate-50 p-3 dark:bg-slate-800/70">
          <label htmlFor="azkar-search" className="text-xs font-semibold text-slate-500 dark:text-slate-300">
            ابحث في التصنيفات أو نص الذكر
          </label>
          <input
            id="azkar-search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="مثال: الصباح أو الحمد لله"
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-sky-500 dark:border-slate-700 dark:bg-slate-900"
          />
        </div>

        {quickCategories.length > 0 ? (
          <div className="mt-4">
            <p className="mb-2 text-xs font-semibold text-slate-500 dark:text-slate-300">تصنيفات حديثة</p>
            <div className="flex flex-wrap gap-2">
              {quickCategories.map((category) => {
                const progress = getAzkarCategoryProgressForToday(stateSnapshot, category.slug);
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
      {isLoading ? <AppCard><p className="text-sm text-slate-500 dark:text-slate-400">جاري تحميل الأذكار…</p></AppCard> : null}

      {!isLoading && visibleCategories.length === 0 ? (
        <EmptyState title="لا توجد نتائج" body="جرّب تغيير كلمة البحث أو امسح الفلتر الحالي لرؤية التصنيفات الكاملة." />
      ) : null}

      {visibleCategories.length > 0 ? (
        <AppCard title="التصنيفات" subtitle="اختيار التصنيف منفصل عن progress state، ولا يوجد orchestrator مركزي يربط كل شيء هنا.">
          <div className="flex flex-wrap gap-2">
            {visibleCategories.map((category) => {
              const progress = getAzkarCategoryProgressForToday(stateSnapshot, category.slug);
              const selected = selectedCategory?.slug === category.slug;
              return (
                <button
                  key={category.slug}
                  type="button"
                  onClick={() => setSelectedCategory(category.slug)}
                  className={[
                    'rounded-full border px-4 py-3 text-sm font-semibold transition',
                    selected
                      ? 'border-sky-500 bg-sky-50 text-sky-900 dark:border-sky-700 dark:bg-sky-950/40 dark:text-sky-100'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-sky-300 hover:text-sky-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200',
                  ].join(' ')}
                >
                  {category.title} <span className="text-xs">{progress.completed}/{progress.total}</span>
                </button>
              );
            })}
          </div>
        </AppCard>
      ) : null}

      {selectedCategory ? (
        <AppCard
          title={selectedCategory.title}
          subtitle={`تم إنجاز ${selectedProgress.completed} من ${selectedProgress.total} اليوم. repeat target لكل ذكر محفوظ داخل dataset نفسها.`}
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

          <ul className="space-y-3">
            {selectedCategory.items.map((item) => {
              const completed = completedSet.has(item.id);
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
                      aria-label={completed ? 'إلغاء إنجاز الذكر' : 'تأكيد إنجاز الذكر'}
                    >
                      ✓
                    </button>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm leading-8 text-slate-900 dark:text-slate-50">{item.text}</p>
                      <div className="mt-3 flex flex-wrap gap-2 text-xs">
                        <span className="rounded-full bg-sky-100 px-3 py-1 font-semibold text-sky-800 dark:bg-sky-950/50 dark:text-sky-200">
                          التكرار {item.repeatTarget}
                        </span>
                        {item.reference ? (
                          <span className="rounded-full bg-slate-200 px-3 py-1 font-semibold text-slate-700 dark:bg-slate-700 dark:text-slate-100">
                            {item.reference}
                          </span>
                        ) : null}
                        {completed ? (
                          <span className="rounded-full bg-emerald-100 px-3 py-1 font-semibold text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200">
                            تم اليوم
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
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
