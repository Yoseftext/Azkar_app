import { AppCard } from '@/shared/ui/primitives/AppCard';
import { AppButton } from '@/shared/ui/primitives/AppButton';
import { PlanRequirementList } from '@/features/plans/components/PlanRequirementList';
import type { GuidedPlanSummary } from '@/features/plans/domain/plan-types';

interface ActivePlanCardProps {
  summary: GuidedPlanSummary;
  onCompleteToday: () => void;
  onStop: () => void;
  compact?: boolean;
}

export function ActivePlanCard({ summary, onCompleteToday, onStop, compact = false }: ActivePlanCardProps) {
  const title = `برنامجك الحالي: ${summary.definition.title}`;
  const subtitle = summary.completedToday
    ? `أنهيت جلسة اليوم. المتبقي ${summary.remainingSessions} جلسة.`
    : summary.canCompleteToday
      ? 'كل خطوات اليوم مكتملة. ثبّت التقدم الآن قبل الانتقال لليوم التالي.'
      : summary.nextRequirementTitle
        ? `الخطوة التالية: ${summary.nextRequirementTitle}`
        : summary.definition.subtitle;

  return (
    <AppCard title={title} subtitle={subtitle} className="border-2 border-[color:var(--ui-primary-soft-text)]/20">
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-[var(--ui-radius-panel)] bg-[var(--ui-primary-soft-bg)] p-3">
            <p className="text-xs text-slate-500 dark:text-slate-400">التقدم</p>
            <p className="mt-1 text-lg font-extrabold text-slate-900 dark:text-slate-50">{summary.progressPercent}%</p>
          </div>
          <div className="rounded-[var(--ui-radius-panel)] bg-slate-50 p-3 dark:bg-slate-800/70">
            <p className="text-xs text-slate-500 dark:text-slate-400">الجلسة الحالية</p>
            <p className="mt-1 text-lg font-extrabold text-slate-900 dark:text-slate-50">{summary.currentSession} / {summary.totalSessions}</p>
          </div>
          <div className="rounded-[var(--ui-radius-panel)] bg-slate-50 p-3 dark:bg-slate-800/70">
            <p className="text-xs text-slate-500 dark:text-slate-400">المتبقي</p>
            <p className="mt-1 text-lg font-extrabold text-slate-900 dark:text-slate-50">{summary.remainingSessions}</p>
          </div>
        </div>

        {!compact ? <PlanRequirementList items={summary.statuses} /> : null}

        <div className="flex flex-col gap-2 sm:flex-row">
          <AppButton onClick={onCompleteToday} disabled={!summary.canCompleteToday} fullWidth>
            {summary.completedToday ? 'جلسة اليوم محسوبة' : 'احتسب جلسة اليوم'}
          </AppButton>
          <AppButton variant="secondary" onClick={onStop} fullWidth>
            إيقاف البرنامج
          </AppButton>
        </div>
      </div>
    </AppCard>
  );
}
