import type { WeeklyReflection } from '@/features/stats/domain/stats-types';
import { AppButtonLink } from '@/shared/ui/primitives/AppButtonLink';
import { AppCard } from '@/shared/ui/primitives/AppCard';
import { AppChip } from '@/shared/ui/primitives/AppChip';

interface WeeklyReflectionCardProps {
  reflection: WeeklyReflection;
}

export function WeeklyReflectionCard({ reflection }: WeeklyReflectionCardProps) {
  return (
    <AppCard title="الانعكاس الأسبوعي" subtitle={reflection.summary}>
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <AppChip variant="subtle">الأقوى: {reflection.strongestAreaLabel}</AppChip>
          <AppChip variant="subtle">سلسلة النشاط: {reflection.activeDays} أيام</AppChip>
        </div>

        <ul className="space-y-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
          {reflection.highlights.map((item) => (
            <li key={item} className="rounded-[var(--ui-radius-panel)] bg-slate-50 px-3 py-2 dark:bg-slate-800/70">
              {item}
            </li>
          ))}
        </ul>

        <div className="rounded-[var(--ui-radius-panel)] bg-sky-50 p-4 dark:bg-sky-950/25">
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">{reflection.focus.title}</p>
          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{reflection.focus.body}</p>
          <div className="mt-3">
            <AppButtonLink to={reflection.focus.to} size="sm">{reflection.focus.ctaLabel}</AppButtonLink>
          </div>
        </div>
      </div>
    </AppCard>
  );
}
