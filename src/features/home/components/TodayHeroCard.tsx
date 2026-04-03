import { cn } from '@/shared/lib/cn';
import { AppCard } from '@/shared/ui/primitives/AppCard';
import { AppButtonLink } from '@/shared/ui/primitives/AppButtonLink';
import type { HomeHeroRecommendation } from '@/features/home/domain/home-recommendations';

const TONE_CLASSES = {
  sky: 'border-sky-200 bg-sky-50/90 dark:border-sky-900/60 dark:bg-sky-950/30',
  emerald: 'border-emerald-200 bg-emerald-50/90 dark:border-emerald-900/60 dark:bg-emerald-950/30',
  amber: 'border-amber-200 bg-amber-50/90 dark:border-amber-900/60 dark:bg-amber-950/30',
} as const;

interface TodayHeroCardProps {
  recommendation: HomeHeroRecommendation;
}

export function TodayHeroCard({ recommendation }: TodayHeroCardProps) {
  return (
    <AppCard className={cn('overflow-hidden border-2', TONE_CLASSES[recommendation.tone])}>
      <div className="space-y-4">
        <div className="space-y-2" dir="rtl">
          <p className="text-xs font-semibold tracking-wide text-slate-500 dark:text-slate-400">أولوية اليوم</p>
          <h2 className="text-lg font-extrabold text-slate-950 dark:text-slate-50">{recommendation.title}</h2>
          <p className="text-sm leading-7 text-slate-700 dark:text-slate-200">{recommendation.body}</p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <AppButtonLink to={recommendation.primaryTo} fullWidth>
            {recommendation.primaryLabel}
          </AppButtonLink>
          {recommendation.secondaryLabel && recommendation.secondaryTo ? (
            <AppButtonLink to={recommendation.secondaryTo} variant="secondary" fullWidth>
              {recommendation.secondaryLabel}
            </AppButtonLink>
          ) : null}
        </div>
      </div>
    </AppCard>
  );
}
