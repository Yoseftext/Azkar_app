import { useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AppButton } from '@/shared/ui/primitives/AppButton';
import { AppCard } from '@/shared/ui/primitives/AppCard';
import { AppSearchField } from '@/shared/ui/primitives/AppSearchField';
import { StatTile } from '@/shared/ui/primitives/StatTile';
import { EmptyState } from '@/shared/ui/feedback/EmptyState';
import { SearchEmptyState } from '@/shared/ui/feedback/SearchEmptyState';
import { LoadStateNotice } from '@/shared/ui/feedback/LoadStateNotice';
import { NameOfTheDayCard } from '@/features/names-of-allah/components/NameOfTheDayCard';
import { NamesReviewQueue } from '@/features/names-of-allah/components/NamesReviewQueue';
import { buildNameOfTheDay, buildNamesReviewQueue } from '@/features/names-of-allah/domain/names-review-flow';
import {
  getFavoriteAllahNameCount,
  getFavoriteAllahNameIds,
  getNamesActiveStreak,
  getNamesCompletedCountForToday,
  getSelectedAllahName,
  getVisibleAllahNames,
} from '@/features/names-of-allah/domain/name-selectors';
import { useNamesOfAllahStore } from '@/features/names-of-allah/state/names-store';
import { getLocalDateKey } from '@/shared/lib/date';

export function NamesOfAllahPage() {
  const [searchParams] = useSearchParams();
  const state = useNamesOfAllahStore();
  const ensureLoaded = useNamesOfAllahStore((store) => store.ensureLoaded);

  useEffect(() => {
    void ensureLoaded();
  }, [ensureLoaded]);

  useEffect(() => {
    const hasSearchQueryParam = searchParams.has('query');
    const searchQueryFromUrl = searchParams.get('query') ?? '';
    const nameFromUrl = searchParams.get('name')?.trim() ?? '';
    if (hasSearchQueryParam && searchQueryFromUrl !== state.searchQuery) state.setSearchQuery(searchQueryFromUrl);
    if (nameFromUrl && state.items.some((item) => item.id === nameFromUrl) && state.selectedNameId !== nameFromUrl) {
      state.setSelectedName(nameFromUrl);
    }
  }, [searchParams, state.items, state.searchQuery, state.selectedNameId, state.setSearchQuery, state.setSelectedName]);

  const todayKey = getLocalDateKey();
  const visibleItems = useMemo(() => getVisibleAllahNames(state), [state]);
  const selectedName = useMemo(() => getSelectedAllahName(state), [state]);
  const completedTodayCount = useMemo(() => getNamesCompletedCountForToday(state), [state]);
  const favoriteCount = useMemo(() => getFavoriteAllahNameCount(state), [state]);
  const favoriteIds = useMemo(() => getFavoriteAllahNameIds(state), [state]);
  const activeStreak = useMemo(() => getNamesActiveStreak(state), [state]);
  const completedTodaySet = useMemo(() => new Set(state.completedByDate[todayKey] ?? []), [state.completedByDate, todayKey]);
  const recentItems = useMemo(
    () => state.recentNameIds.map((id) => state.items.find((item) => item.id === id)).filter((item): item is NonNullable<typeof item> => Boolean(item)),
    [state.items, state.recentNameIds],
  );
  const nameOfTheDay = useMemo(() => buildNameOfTheDay(state), [state]);
  const reviewQueue = useMemo(() => buildNamesReviewQueue(state), [state]);

  return (
    <div className="space-y-4">
      <NameOfTheDayCard item={nameOfTheDay} onOpen={state.setSelectedName} onToggleCompleted={state.toggleCompleted} />

      <AppCard title="أسماء الله الحسنى" subtitle="تعلّم أسماء الله الحسنى وراجعها يوميًا بطريقة أوضح وأخف.">
        <div className="grid gap-3 md:grid-cols-4">
          <StatTile label="إجمالي الأسماء" value={String(state.items.length || 99)} hint="الأسماء الحسنى" variant="slate" />
          <StatTile label="منجز اليوم" value={String(completedTodayCount)} hint="مراجعة اليوم" variant="emerald" />
          <StatTile label="المفضلة" value={String(favoriteCount)} hint="المفضلة لديك" variant="amber" />
          <StatTile label="السلسلة" value={`${activeStreak} يوم`} hint="أيام نشطة" variant="sky" />
        </div>

        <div className="mt-4 space-y-4">
          <AppSearchField
            id="names-search"
            label="ابحث بالاسم أو المعنى أو الفائدة"
            query={state.searchQuery}
            onQueryChange={state.setSearchQuery}
            placeholder="ابحث بالاسم أو الوصف أو الرقم..."
          />
          <NamesReviewQueue items={reviewQueue} activeId={selectedName?.id ?? null} onOpen={state.setSelectedName} />
        </div>

        {state.isLoading ? <div className="mt-4"><LoadStateNotice title="جاري تحميل الأسماء" body="نجهز قائمة الأسماء والمراجعة السريعة لليوم." /></div> : null}
        {state.error ? <div className="mt-4"><LoadStateNotice title="تعذر تحميل الأسماء" body={state.error} tone="error" actionLabel="إعادة المحاولة" onAction={() => void ensureLoaded()} /></div> : null}

        {!state.isLoading && !state.error ? (
          visibleItems.length > 0 ? (
            <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)]">
              <div className="space-y-3 rounded-[28px] bg-slate-50 p-3 dark:bg-slate-800/70">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-slate-900 dark:text-slate-50">القائمة الظاهرة</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{visibleItems.length} اسم</p>
                </div>
                <div className="max-h-[480px] space-y-2 overflow-y-auto pr-1">
                  {visibleItems.map((item) => {
                    const isSelected = selectedName?.id === item.id;
                    const isFavorite = favoriteIds.has(item.id);
                    const isCompleted = completedTodaySet.has(item.id);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => state.setSelectedName(item.id)}
                        className={[
                          'w-full rounded-3xl border px-4 py-3 text-right transition',
                          isSelected
                            ? 'border-sky-400 bg-sky-50 dark:border-sky-700 dark:bg-slate-900'
                            : 'border-transparent bg-white hover:border-slate-200 dark:bg-slate-900/70 dark:hover:border-slate-700',
                        ].join(' ')}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">#{item.order}</p>
                            <p className="mt-1 text-lg font-bold text-slate-900 dark:text-slate-50">{item.name}</p>
                          </div>
                          <div className="flex flex-col items-end gap-1 text-[11px]">
                            {isFavorite ? <span className="rounded-full bg-amber-100 px-2 py-1 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">مفضلة</span> : null}
                            {isCompleted ? <span className="rounded-full bg-emerald-100 px-2 py-1 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200">منجز اليوم</span> : null}
                          </div>
                        </div>
                        <p className="mt-2 line-clamp-2 text-xs leading-6 text-slate-500 dark:text-slate-400">{item.description}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-4">
                {selectedName ? (
                  <AppCard title={selectedName.name} subtitle={`الترتيب #${selectedName.order}`} className="h-full">
                    <p className="app-reading-text text-base text-slate-700 dark:text-slate-200">{selectedName.description}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <AppButton onClick={() => state.toggleCompleted(selectedName.id)} variant={completedTodaySet.has(selectedName.id) ? 'outline' : 'success'}>
                        {completedTodaySet.has(selectedName.id) ? 'إلغاء مراجعة اليوم' : 'تأكيد مراجعة اليوم'}
                      </AppButton>
                      <AppButton onClick={() => state.toggleFavorite(selectedName.id)} variant="outline">
                        {favoriteIds.has(selectedName.id) ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}
                      </AppButton>
                    </div>
                  </AppCard>
                ) : (
                  <EmptyState title="لا توجد نتائج" body="غيّر عبارة البحث أو أعد ضبط الفلتر للوصول إلى الأسماء من جديد." />
                )}

                <AppCard title="آخر الأسماء المفتوحة" subtitle="استأنف من حيث توقفت">
                  {recentItems.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {recentItems.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => state.setSelectedName(item.id)}
                          className="rounded-full border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-sky-400 hover:text-sky-700 dark:border-slate-700 dark:text-slate-200 dark:hover:border-sky-700 dark:hover:text-sky-300"
                        >
                          {item.name}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500 dark:text-slate-400">لم تفتح أي اسم بعد — ابدأ بالبحث أو اختر اسماً من القائمة.</p>
                  )}
                </AppCard>

                <AppButton onClick={() => state.resetTodayProgress()} variant="outline" fullWidth>
                  تصفير مراجعة اليوم
                </AppButton>
              </div>
            </div>
          ) : (
            <div className="mt-4">
              {state.searchQuery.trim() ? (
                <SearchEmptyState title="لا توجد نتائج مطابقة" body="جرّب اسمًا أقصر أو امسح البحث الحالي لرؤية جميع الأسماء." onClear={() => state.setSearchQuery('')} />
              ) : (
                <EmptyState title="لا توجد أسماء متاحة" body="تعذر عرض القائمة الآن. حاول مجددًا بعد لحظات." />
              )}
            </div>
          )
        ) : null}
      </AppCard>
    </div>
  );
}
