import { useMemo, useState } from 'react';
import { buildStatsDashboard, type BuildStatsInput } from '@/features/stats/domain/stats-aggregators';
import { buildStatsInsights, buildWeeklyReflection } from '@/features/stats/domain/stats-reflection';
import type { PeriodFilter } from '@/shared/lib/date';
import { AppCard } from '@/shared/ui/primitives/AppCard';
import { StatsFilterBar } from '@/features/stats/components/StatsFilterBar';
import { StatsMetricGrid } from '@/features/stats/components/StatsMetricGrid';
import { WeeklyReflectionCard } from '@/features/stats/components/WeeklyReflectionCard';
import { StatsInsightList } from '@/features/stats/components/StatsInsightList';
import { StatsDetailSection } from '@/features/stats/components/StatsDetailSection';
import { useTasksStore } from '@/features/tasks/state/tasks-store';
import { useMasbahaStore } from '@/features/masbaha/state/masbaha-store';
import { useQuranStore } from '@/features/quran/state/quran-store';
import { useAzkarStore } from '@/features/azkar/state/azkar-store';
import { useDuasStore } from '@/features/duas/state/duas-store';
import { useStoriesStore } from '@/features/stories/state/stories-store';
import { useNamesOfAllahStore } from '@/features/names-of-allah/state/names-store';

export function StatsPage() {
  const [filter, setFilter] = useState<PeriodFilter>('day');

  const taskItems = useTasksStore((s) => s.items);
  const dailyCompletions = useTasksStore((s) => s.dailyCompletions);
  const masbahaTarget = useMasbahaStore((s) => s.currentTarget);
  const masbahaTotalCount = useMasbahaStore((s) => s.totalCount);
  const masbahaDailyCounts = useMasbahaStore((s) => s.dailyCounts);
  const azkarByDate = useAzkarStore((s) => s.completedByDate);
  const quranBookmark = useQuranStore((s) => s.bookmark);
  const quranDailyReadings = useQuranStore((s) => s.dailyReadings);
  const duasByDate = useDuasStore((s) => s.completedByDate);
  const favDuaIds = useDuasStore((s) => s.favoriteIds);
  const storiesByDate = useStoriesStore((s) => s.completedByDate);
  const favStoryIds = useStoriesStore((s) => s.favoriteIds);
  const namesByDate = useNamesOfAllahStore((s) => s.completedByDate);
  const favNameIds = useNamesOfAllahStore((s) => s.favoriteIds);

  const input = useMemo<BuildStatsInput>(() => ({
    tasks: { items: taskItems, dailyCompletions },
    masbaha: { currentTarget: masbahaTarget, totalCount: masbahaTotalCount, dailyCounts: masbahaDailyCounts },
    azkar: { completedByDate: azkarByDate },
    quran: { bookmark: quranBookmark, dailyReadings: quranDailyReadings },
    duas: { completedByDate: duasByDate, favoriteIds: favDuaIds },
    stories: { completedByDate: storiesByDate, favoriteIds: favStoryIds },
    names: { completedByDate: namesByDate, favoriteIds: favNameIds },
    filter,
  }), [
    taskItems, dailyCompletions, masbahaTarget, masbahaTotalCount, masbahaDailyCounts,
    azkarByDate, quranBookmark, quranDailyReadings,
    duasByDate, favDuaIds, storiesByDate, favStoryIds, namesByDate, favNameIds, filter,
  ]);

  const dashboard = useMemo(() => buildStatsDashboard(input), [input]);
  const reflection = useMemo(() => buildWeeklyReflection(input), [input]);
  const insights = useMemo(() => buildStatsInsights(input), [input]);

  return (
    <div className="space-y-4">
      <AppCard title="صورة نشاطك" subtitle="اقرأ ما حدث هذا الأسبوع وما الذي يستحق التركيز الآن، ثم انزل إلى التفاصيل عند الحاجة.">
        <StatsFilterBar filter={filter} onChange={setFilter} />
      </AppCard>

      <WeeklyReflectionCard reflection={reflection} />

      <AppCard title="نشاطك" subtitle="المقاييس الأساسية للفترة المختارة بصياغة أبسط وأكثر قابلية للمقارنة.">
        <StatsMetricGrid metrics={dashboard.metrics} />
      </AppCard>

      <StatsInsightList insights={insights} />

      <div className="grid gap-4 lg:grid-cols-2">
        <StatsDetailSection
          title="المسبحة والأذكار"
          rows={[
            { label: 'التسبيح في الفترة', value: String(dashboard.masbahaCountInRange) },
            { label: 'تسبيح اليوم', value: String(dashboard.masbahaTodayCount) },
            { label: 'سلسلة المسبحة', value: `${dashboard.masbahaStreak} أيام` },
            { label: 'الأذكار المكتملة', value: String(dashboard.azkarCompletedInRange) },
            { label: 'الأذكار اليوم', value: String(dashboard.azkarCompletedToday) },
            { label: 'أيام حضور الأذكار', value: `${dashboard.azkarActiveDays} أيام` },
          ]}
        />

        <StatsDetailSection
          title="القرآن والورد"
          rows={[
            { label: 'آيات في الفترة', value: String(dashboard.quranVersesInRange) },
            { label: 'آيات اليوم', value: String(dashboard.quranVersesToday) },
            { label: 'أيام قراءة', value: `${dashboard.quranActiveDays} أيام` },
            { label: 'آخر سورة', value: dashboard.lastReadSurahName ?? 'لا يوجد' },
            { label: 'المهام المنجزة', value: String(dashboard.tasksCompletedInRange) },
            { label: 'معدل الإنجاز الحالي', value: `${dashboard.taskCompletionRate}%` },
          ]}
        />

        <StatsDetailSection
          title="المحتوى الداعم"
          rows={[
            { label: 'أدعية في الفترة', value: String(dashboard.duasCompletedInRange) },
            { label: 'أيام حضور الأدعية', value: `${dashboard.duasActiveDays} أيام` },
            { label: 'القصص المقروءة', value: String(dashboard.storiesCompletedInRange) },
            { label: 'أيام قراءة القصص', value: `${dashboard.storiesActiveDays} أيام` },
            { label: 'أسماء في الفترة', value: String(dashboard.namesCompletedInRange) },
            { label: 'أيام مراجعة الأسماء', value: `${dashboard.namesActiveDays} أيام` },
          ]}
        />

        <StatsDetailSection
          title="التفضيلات والحضور"
          rows={[
            { label: 'دعوات مفضلة', value: String(dashboard.favoriteDuasCount) },
            { label: 'قصص مفضلة', value: String(dashboard.favoriteStoriesCount) },
            { label: 'أسماء مفضلة', value: String(dashboard.favoriteNamesCount) },
            { label: 'سلسلة النشاط الحالية', value: `${dashboard.activeDays} أيام` },
            { label: 'مهام اليوم المنجزة', value: String(dashboard.tasksCompletedToday) },
            { label: 'الأسماء اليوم', value: String(dashboard.namesCompletedToday) },
          ]}
        />
      </div>
    </div>
  );
}
