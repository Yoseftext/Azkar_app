import { AppCard } from '@/shared/ui/primitives/AppCard';
import { AppButton } from '@/shared/ui/primitives/AppButton';
import type { GuidedPlanDefinition } from '@/features/plans/domain/plan-types';

interface PlanCatalogCardProps {
  plan: GuidedPlanDefinition;
  isActive: boolean;
  onStart: () => void;
}

export function PlanCatalogCard({ plan, isActive, onStart }: PlanCatalogCardProps) {
  return (
    <AppCard className={isActive ? 'border-2 border-[color:var(--ui-primary-soft-text)]/30' : undefined}>
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-2xl leading-none">{plan.icon}</span>
              <h3 className="text-base font-extrabold text-slate-950 dark:text-slate-50">{plan.title}</h3>
            </div>
            <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">{plan.subtitle}</p>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-200">{plan.durationDays} يوم</span>
        </div>

        <p className="text-sm leading-7 text-slate-700 dark:text-slate-200">{plan.description}</p>

        <ul className="space-y-2 text-xs leading-6 text-slate-500 dark:text-slate-400">
          {plan.requirements.map((requirement) => (
            <li key={requirement.id}>• {requirement.title}</li>
          ))}
        </ul>

        <AppButton onClick={onStart} variant={isActive ? 'secondary' : 'outline'} fullWidth>
          {isActive ? 'قيد التشغيل الآن' : 'ابدأ البرنامج'}
        </AppButton>
      </div>
    </AppCard>
  );
}
