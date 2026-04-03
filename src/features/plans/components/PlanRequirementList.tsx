import { AppButtonLink } from '@/shared/ui/primitives/AppButtonLink';
import type { GuidedPlanRequirementStatus } from '@/features/plans/domain/plan-types';

interface PlanRequirementListProps {
  items: GuidedPlanRequirementStatus[];
}

export function PlanRequirementList({ items }: PlanRequirementListProps) {
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item.id} className="rounded-[var(--ui-radius-panel)] border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800/70">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-slate-900 dark:text-slate-50">{item.title}</p>
              <p className="mt-1 text-xs leading-6 text-slate-500 dark:text-slate-400">{item.body}</p>
            </div>
            <span className={[
              'shrink-0 rounded-full px-3 py-1 text-xs font-bold',
              item.isCompleted
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-200',
            ].join(' ')}>
              {item.progressLabel}
            </span>
          </div>
          <div className="mt-3">
            <AppButtonLink to={item.to} variant={item.isCompleted ? 'secondary' : 'outline'} size="sm">
              {item.isCompleted ? 'افتح القسم' : 'ابدأ هذه الخطوة'}
            </AppButtonLink>
          </div>
        </li>
      ))}
    </ul>
  );
}
