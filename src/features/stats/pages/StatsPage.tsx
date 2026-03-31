import { useMemo, useState } from 'react';
import { AppCard } from '@/shared/ui/primitives/AppCard';
import { buildStatsDashboard } from '@/features/stats/domain/stats-aggregators';
import type { PeriodFilter } from '@/shared/lib/date';
import { useTasksStore } from '@/features/tasks/state/tasks-store';
import { useMasbahaStore } from '@/features/masbaha/state/masbaha-store';
import { useQuranStore } from '@/features/quran/state/quran-store';
import { useAzkarStore } from '@/features/azkar/state/azkar-store';
import { useDuasStore } from '@/features/duas/state/duas-store';
import { useStoriesStore } from '@/features/stories/state/stories-store';
import { useNamesOfAllahStore } from '@/features/names-of-allah/state/names-store';

const filters: Array<{ key: PeriodFilter; label: string }> = [
  { key: 'day', label: 'اليوم' },
  { key: 'week', label: '7 أيام' },
  { key: 'month', label: 'الشهر' },
  { key: 'all', label: 'الكل' },
];

export function StatsPage() {
  const [filter, setFilter] = useState<PeriodFilter>('day');
  const taskItems = useTasksStore((state) => state.items);
  const dailyCompletions = useTasksStore((state) => state.dailyCompletions);
  const masbahaTarget = useMasbahaStore((state) => state.currentTarget);
  const masbahaTotalCount = useMasbahaStore((state) => state.totalCount);
  const masbahaDailyCounts = useMasbahaStore((state) => state.dailyCounts);
  const azkarCompletedByDate = useAzkarStore((state) => state.completedByDate);
  const quranBookmark = useQuranStore((state) => state.bookmark);
  const quranDailyReadings = useQuranStore((state) => state.dailyReadings);
  const duasCompletedByDate = useDuasStore((state) => state.completedByDate);
  const favoriteDuaIds = useDuasStore((state) => state.favoriteIds);
  const storiesCompletedByDate = useStoriesStore((state) => state.completedByDate);
  const favoriteStoryIds = useStoriesStore((state) => state.favoriteIds);
  const namesCompletedByDate = useNamesOfAllahStore((state) => state.completedByDate);
  const favoriteNameIds = useNamesOfAllahStore((state) => state.favoriteIds);

  const dashboard = useMemo(
    () => buildStatsDashboard(
      { items: taskItems, dailyCompletions },
      { currentTarget: masbahaTarget, totalCount: masbahaTotalCount, dailyCounts: masbahaDailyCounts },
      { completedByDate: azkarCompletedByDate },
      { bookmark: quranBookmark, dailyReadings: quranDailyReadings },
      { completedByDate: duasCompletedByDate, favoriteIds: favoriteDuaIds },
      { completedByDate: storiesCompletedByDate, favoriteIds: favoriteStoryIds },
      { completedByDate: namesCompletedByDate, favoriteIds: favoriteNameIds },
      filter,
    ),
    [azkarCompletedByDate, dailyCompletions, duasCompletedByDate, favoriteDuaIds, favoriteNameIds, favoriteStoryIds, filter, masbahaDailyCounts, masbahaTarget, masbahaTotalCount, namesCompletedByDate, quranBookmark, quranDailyReadings, storiesCompletedByDate, taskItems],
  );

  return (
    <div className="space-y-4">
      <AppCard title="الإحصائيات" subtitle="الصفحة الآن مبنية عبر aggregators مشتقة من stores مستقلة، مع إدخال الأذكار والأدعية والقصص والقرآن وأسماء الله الحسنى دون coupling مباشر مع صفحات القراءة أو العرض.">
        <div className="grid grid-cols-4 gap-2 rounded-3xl bg-slate-100 p-1 dark:bg-slate-800">
          {filters.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setFilter(item.key)}
              className={[
                'rounded-[20px] px-3 py-3 text-xs font-semibold transition',
                filter === item.key
                  ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white'
                  : 'text-slate-500 dark:text-slate-300',
              ].join(' ')}
            >
              {item.label}
            </button>
          ))}
        </div>
      </AppCard>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {dashboard.metrics.map((metric) => (
          <AppCard key={metric.label} title={metric.label} className="min-h-[132px]">
            <p className="text-3xl font-bold text-slate-900 dark:text-slate-50">{metric.value}</p>
            <p className="mt-3 text-xs leading-6 text-slate-500 dark:text-slate-400">{metric.hint}</p>
          </AppCard>
        ))}
      </div>

      <AppCard title="ملخص النشاط" subtitle="هذا القسم يقيس ناتج الفترة المختارة، مع الحفاظ على current state منفصلة عن historical aggregates.">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
          <SummaryRow label="مهام اليوم" value={String(dashboard.tasksCompletedToday)} />
          <SummaryRow label="أذكار اليوم" value={String(dashboard.azkarCompletedToday)} />
          <SummaryRow label="أدعية اليوم" value={String(dashboard.duasCompletedToday)} />
          <SummaryRow label="تسبيح اليوم" value={String(dashboard.masbahaTodayCount)} />
          <SummaryRow label="قصص اليوم" value={String(dashboard.storiesCompletedToday)} />
          <SummaryRow label="أسماء اليوم" value={String(dashboard.namesCompletedToday)} />
          <SummaryRow label="آيات اليوم" value={String(dashboard.quranVersesToday)} />
          <SummaryRow label="سلسلة الأذكار" value={`${dashboard.azkarActiveDays} يوم`} />
          <SummaryRow label="سلسلة الأدعية" value={`${dashboard.duasActiveDays} يوم`} />
          <SummaryRow label="سلسلة التسبيح" value={`${dashboard.masbahaStreak} يوم`} />
          <SummaryRow label="نشاط القرآن" value={`${dashboard.quranActiveDays} يوم`} />
          <SummaryRow label="سلسلة القصص" value={`${dashboard.storiesActiveDays} يوم`} />
          <SummaryRow label="سلسلة الأسماء" value={`${dashboard.namesActiveDays} يوم`} />
          <SummaryRow label="مفضلة الأدعية" value={String(dashboard.favoriteDuasCount)} />
          <SummaryRow label="مفضلة القصص" value={String(dashboard.favoriteStoriesCount)} />
          <SummaryRow label="مفضلة الأسماء" value={String(dashboard.favoriteNamesCount)} />
          <SummaryRow label="سلسلة النشاط المركبة" value={`${dashboard.activeDays} يوم`} />
        </div>
      </AppCard>

      <AppCard title="قراءة هندسية سريعة">
        <ul className="space-y-2 text-sm leading-6 text-slate-700 dark:text-slate-200">
          <li className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800/80">
            current completion rate = {dashboard.taskCompletionRate}%، وهذا يعكس حالة المهام الحالية فقط.
          </li>
          <li className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800/80">
            historical aggregation = {dashboard.tasksCompletedInRange} مهمة و{dashboard.azkarCompletedInRange} ذكرًا و{dashboard.duasCompletedInRange} دعاءً و{dashboard.storiesCompletedInRange} قصة و{dashboard.namesCompletedInRange} اسمًا و{dashboard.masbahaCountInRange} تسبيحة و{dashboard.quranVersesInRange} آية ضمن الفلتر المختار.
          </li>
          <li className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800/80">
            آخر سورة محفوظة = {dashboard.lastReadSurahName ?? 'لا توجد علامة قراءة بعد'}.
          </li>
          <li className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800/80">
            لا توجد imports متبادلة بين features؛ الصفحة تستهلك snapshot state وتبني dashboard مشتق فقط.
          </li>
        </ul>
      </AppCard>
    </div>
  );
}

interface SummaryRowProps {
  label: string;
  value: string;
}

function SummaryRow({ label, value }: SummaryRowProps) {
  return (
    <div className="rounded-3xl bg-slate-50 p-3 dark:bg-slate-800/70">
      <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-2 text-lg font-bold text-slate-900 dark:text-slate-50">{value}</p>
    </div>
  );
}
