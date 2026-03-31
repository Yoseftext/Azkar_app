import { useEffect, useMemo } from 'react';
import { AppCard } from '@/shared/ui/primitives/AppCard';
import { EmptyState } from '@/shared/ui/feedback/EmptyState';
import { getFavoriteAllahNameCount, getFavoriteAllahNameIds, getNameOfTheDay, getNamesActiveStreak, getNamesCompletedCountForToday, getSelectedAllahName, getVisibleAllahNames } from '@/features/names-of-allah/domain/name-selectors';
import { useNamesOfAllahStore } from '@/features/names-of-allah/state/names-store';
import { getLocalDateKey } from '@/shared/lib/date';

export function NamesOfAllahPage() {
  const state = useNamesOfAllahStore();
  const ensureLoaded = useNamesOfAllahStore((store) => store.ensureLoaded);

  useEffect(() => {
    void ensureLoaded();
  }, [ensureLoaded]);

  const todayKey = getLocalDateKey();
  const visibleItems = useMemo(() => getVisibleAllahNames(state), [state]);
  const selectedName = useMemo(() => getSelectedAllahName(state), [state]);
  const nameOfTheDay = useMemo(() => getNameOfTheDay(state), [state]);
  const completedTodayCount = useMemo(() => getNamesCompletedCountForToday(state), [state]);
  const favoriteCount = useMemo(() => getFavoriteAllahNameCount(state), [state]);
  const favoriteIds = useMemo(() => getFavoriteAllahNameIds(state), [state]);
  const activeStreak = useMemo(() => getNamesActiveStreak(state), [state]);
  const completedTodaySet = useMemo(() => new Set(state.completedByDate[todayKey] ?? []), [state.completedByDate, todayKey]);
  const recentItems = useMemo(
    () => state.recentNameIds.map((id) => state.items.find((item) => item.id === id)).filter((item): item is NonNullable<typeof item> => Boolean(item)),
    [state.items, state.recentNameIds],
  );

  return (
    <div className="space-y-4">
      <AppCard title="أسماء الله الحسنى" subtitle="module مستقلة مع lazy loader + search + favorites + daily progress، بدون بقاء القسم مجرد daily highlight ثابت.">
        <div className="grid gap-3 md:grid-cols-4">
          <StatPill label="إجمالي الأسماء" value={String(state.items.length || 99)} hint="الـ 99 اسمًا ضمن loader مستقلة." />
          <StatPill label="منجز اليوم" value={String(completedTodayCount)} hint="الأسماء التي راجعتها أو حفظتها اليوم." />
          <StatPill label="المفضلة" value={String(favoriteCount)} hint="اختياراتك السريعة للمراجعة لاحقًا." />
          <StatPill label="السلسلة" value={`${activeStreak} يوم`} hint="عدد الأيام المتتالية التي راجعت فيها الأسماء." />
        </div>

        {nameOfTheDay ? (
          <div className="mt-4 rounded-[28px] border border-emerald-200 bg-emerald-50/80 p-4 dark:border-emerald-900/60 dark:bg-emerald-950/30">
            <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">اسم اليوم</p>
            <p className="mt-2 text-2xl font-black text-slate-900 dark:text-slate-50">{nameOfTheDay.name}</p>
            <p className="mt-2 text-sm leading-7 text-slate-700 dark:text-slate-200">{nameOfTheDay.description}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => state.setSelectedName(nameOfTheDay.id)}
                className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
              >
                افتح اسم اليوم
              </button>
              <button
                type="button"
                onClick={() => state.toggleCompleted(nameOfTheDay.id)}
                className="rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:border-emerald-400 hover:text-emerald-700 dark:border-slate-700 dark:text-slate-200 dark:hover:border-emerald-700 dark:hover:text-emerald-300"
              >
                {completedTodaySet.has(nameOfTheDay.id) ? 'إلغاء إنجاز اليوم' : 'تأكيد مراجعة اليوم'}
              </button>
            </div>
          </div>
        ) : null}
      </AppCard>

      <AppCard title="البحث والمراجعة" subtitle="القائمة وdetail panel منفصلتان حتى لا يتحول الملف إلى God component أو تظل الحالة مبعثرة داخل الواجهة.">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <input
            value={state.searchQuery}
            onChange={(event) => state.setSearchQuery(event.target.value)}
            placeholder="ابحث بالاسم أو الوصف أو الرقم..."
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none ring-0 transition focus:border-sky-400 dark:border-slate-700 dark:bg-slate-800/80"
          />
          <button
            type="button"
            onClick={() => state.resetTodayProgress()}
            className="rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:border-rose-400 hover:text-rose-700 dark:border-slate-700 dark:text-slate-200 dark:hover:border-rose-700 dark:hover:text-rose-300"
          >
            تصفير مراجعة اليوم
          </button>
        </div>

        {state.isLoading ? <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">جارٍ تحميل الأسماء...</p> : null}
        {state.error ? <p className="mt-4 text-sm text-rose-600 dark:text-rose-300">{state.error}</p> : null}

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
                    <p className="text-base leading-8 text-slate-700 dark:text-slate-200">{selectedName.description}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => state.toggleCompleted(selectedName.id)}
                        className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
                      >
                        {completedTodaySet.has(selectedName.id) ? 'إلغاء مراجعة اليوم' : 'تأكيد مراجعة اليوم'}
                      </button>
                      <button
                        type="button"
                        onClick={() => state.toggleFavorite(selectedName.id)}
                        className="rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:border-amber-400 hover:text-amber-700 dark:border-slate-700 dark:text-slate-200 dark:hover:border-amber-700 dark:hover:text-amber-300"
                      >
                        {favoriteIds.has(selectedName.id) ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}
                      </button>
                    </div>
                  </AppCard>
                ) : (
                  <EmptyState title="لا توجد نتائج" body="غيّر عبارة البحث أو أعد ضبط الفلتر للوصول إلى الأسماء من جديد." />
                )}

                <AppCard title="آخر الأسماء المفتوحة" subtitle="مفيد للوصول السريع بدون ربط الصفحة بسجل routing خارجي.">
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
                    <p className="text-sm text-slate-500 dark:text-slate-400">لم تفتح أي اسم بعد داخل البنية الجديدة.</p>
                  )}
                </AppCard>
              </div>
            </div>
          ) : (
            <div className="mt-4">
              <EmptyState title="لا توجد نتائج مطابقة" body="جرّب البحث باسم أقصر أو امسح عبارة البحث الحالية." />
            </div>
          )
        ) : null}
      </AppCard>
    </div>
  );
}

interface StatPillProps {
  label: string;
  value: string;
  hint: string;
}

function StatPill({ label, value, hint }: StatPillProps) {
  return (
    <div className="rounded-3xl bg-slate-50 p-3 dark:bg-slate-800/70">
      <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-2 text-lg font-bold text-slate-900 dark:text-slate-50">{value}</p>
      <p className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400">{hint}</p>
    </div>
  );
}
