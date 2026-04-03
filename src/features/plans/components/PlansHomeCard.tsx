import { AppCard } from '@/shared/ui/primitives/AppCard';
import { AppButtonLink } from '@/shared/ui/primitives/AppButtonLink';
import type { GuidedPlanDefinition } from '@/features/plans/domain/plan-types';

interface PlansHomeCardProps {
  recommendedPlan: GuidedPlanDefinition | null;
}

export function PlansHomeCard({ recommendedPlan }: PlansHomeCardProps) {
  if (!recommendedPlan) return null;

  return (
    <AppCard title="برنامج قصير مقترح" subtitle={recommendedPlan.subtitle}>
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl leading-none">{recommendedPlan.icon}</span>
          <div>
            <p className="text-base font-extrabold text-slate-950 dark:text-slate-50">{recommendedPlan.title}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{recommendedPlan.durationDays} يوم • {recommendedPlan.requirements.length} خطوات يومية</p>
          </div>
        </div>
        <p className="text-sm leading-7 text-slate-700 dark:text-slate-200">{recommendedPlan.description}</p>
        <AppButtonLink to="/plans" fullWidth>
          افتح البرامج القصيرة
        </AppButtonLink>
      </div>
    </AppCard>
  );
}
