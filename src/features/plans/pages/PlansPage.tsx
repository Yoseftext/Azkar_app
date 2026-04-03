import { useMemo } from 'react';
import { AppCard } from '@/shared/ui/primitives/AppCard';
import { useTasksStore } from '@/features/tasks/state/tasks-store';
import { useMasbahaStore } from '@/features/masbaha/state/masbaha-store';
import { useQuranStore } from '@/features/quran/state/quran-store';
import { useAzkarStore } from '@/features/azkar/state/azkar-store';
import { useDuasStore } from '@/features/duas/state/duas-store';
import { useNamesOfAllahStore } from '@/features/names-of-allah/state/names-store';
import { getLocalDateKey } from '@/shared/lib/date';
import { GUIDED_PLANS, getGuidedPlanById } from '@/features/plans/domain/plan-definitions';
import { buildGuidedPlanSummary, rankGuidedPlans } from '@/features/plans/domain/plan-progress';
import { usePlansStore } from '@/features/plans/state/plans-store';
import { ActivePlanCard } from '@/features/plans/components/ActivePlanCard';
import { PlanCatalogCard } from '@/features/plans/components/PlanCatalogCard';

export function PlansPage() {
  const todayKey = getLocalDateKey();
  const taskItems = useTasksStore((s) => s.items);
  const taskDailyCompletions = useTasksStore((s) => s.dailyCompletions[todayKey] ?? []);
  const masbahaTodayCount = useMasbahaStore((s) => s.dailyCounts[todayKey] ?? 0);
  const azkarTodayCount = useAzkarStore((s) => s.completedByDate[todayKey]?.length ?? 0);
  const duasTodayCount = useDuasStore((s) => s.completedByDate[todayKey]?.length ?? 0);
  const namesTodayCount = useNamesOfAllahStore((s) => s.completedByDate[todayKey]?.length ?? 0);
  const quranTodayReadings = useQuranStore((s) => s.dailyReadings[todayKey]?.length ?? 0);

  const activePlanId = usePlansStore((s) => s.activePlanId);
  const progressByPlanId = usePlansStore((s) => s.progressByPlanId);
  const startPlan = usePlansStore((s) => s.startPlan);
  const stopPlan = usePlansStore((s) => s.stopPlan);
  const completeTodaySession = usePlansStore((s) => s.completeTodaySession);

  const snapshot = useMemo(() => ({
    completedTasks: taskDailyCompletions.length,
    remainingTasks: Math.max(taskItems.length - taskDailyCompletions.length, 0),
    azkarTodayCount,
    quranTodayReadings,
    duasTodayCount,
    namesTodayCount,
    masbahaTodayCount,
  }), [taskDailyCompletions.length, taskItems.length, azkarTodayCount, quranTodayReadings, duasTodayCount, namesTodayCount, masbahaTodayCount]);

  const activePlan = getGuidedPlanById(activePlanId);
  const activeSummary = useMemo(() => {
    if (!activePlan) return null;
    return buildGuidedPlanSummary({
      definition: activePlan,
      completedSessionKeys: progressByPlanId[activePlan.id]?.completedSessionKeys ?? [],
      todayKey,
      snapshot,
    });
  }, [activePlan, progressByPlanId, snapshot, todayKey]);

  const rankedPlans = useMemo(() => rankGuidedPlans(snapshot, activePlanId, GUIDED_PLANS), [snapshot, activePlanId]);

  return (
    <div className="space-y-4">
      <AppCard title="البرامج القصيرة" subtitle="مسارات جاهزة ومحدودة المدة تساعدك على تثبيت عادة واضحة دون تشتيت أو ضغط زائد.">
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-[var(--ui-radius-panel)] bg-[var(--ui-primary-soft-bg)] p-3">
            <p className="text-xs text-slate-500 dark:text-slate-400">المتاح الآن</p>
            <p className="mt-1 text-lg font-extrabold text-slate-900 dark:text-slate-50">{GUIDED_PLANS.length}</p>
          </div>
          <div className="rounded-[var(--ui-radius-panel)] bg-slate-50 p-3 dark:bg-slate-800/70">
            <p className="text-xs text-slate-500 dark:text-slate-400">البرنامج النشط</p>
            <p className="mt-1 text-lg font-extrabold text-slate-900 dark:text-slate-50">{activePlan?.title ?? 'لا يوجد'}</p>
          </div>
          <div className="rounded-[var(--ui-radius-panel)] bg-slate-50 p-3 dark:bg-slate-800/70">
            <p className="text-xs text-slate-500 dark:text-slate-400">حالة اليوم</p>
            <p className="mt-1 text-lg font-extrabold text-slate-900 dark:text-slate-50">{activeSummary?.completedToday ? 'مكتملة' : activeSummary?.canCompleteToday ? 'جاهزة للتثبيت' : 'قيد التنفيذ'}</p>
          </div>
        </div>
      </AppCard>

      {activeSummary ? <ActivePlanCard summary={activeSummary} onCompleteToday={completeTodaySession} onStop={stopPlan} /> : null}

      <div className="grid gap-4 lg:grid-cols-2">
        {rankedPlans.map((plan) => (
          <PlanCatalogCard key={plan.id} plan={plan} isActive={plan.id === activePlanId} onStart={() => startPlan(plan.id)} />
        ))}
      </div>
    </div>
  );
}
