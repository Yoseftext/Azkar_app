import { AppCard } from '@/shared/ui/primitives/AppCard';
import { AppButtonLink } from '@/shared/ui/primitives/AppButtonLink';
import type { AchievementJourneySummary } from '@/features/achievements/domain/achievement-journey';

interface AchievementJourneyCardProps {
  summary: AchievementJourneySummary;
}

export function AchievementJourneyCard({ summary }: AchievementJourneyCardProps) {
  return (
    <AppCard title="رحلة الإنجازات" subtitle={`أنجزت ${summary.unlockedCount} من ${summary.totalCount} حتى الآن.`}>
      <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
        <div className="h-full rounded-full bg-[var(--ui-primary-solid)] transition-all" style={{ width: `${summary.progressPercent}%` }} />
      </div>

      {summary.nextMilestones.length > 0 ? (
        <div className="mt-4 space-y-3">
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">الخطوات الأقرب الآن</p>
          <div className="space-y-3">
            {summary.nextMilestones.map((milestone) => (
              <div key={milestone.id} className="rounded-[28px] border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/70">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{milestone.icon}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-50">{milestone.title}</p>
                    <p className="mt-1 text-xs leading-6 text-slate-600 dark:text-slate-300">{milestone.description}</p>
                  </div>
                </div>
                <div className="mt-3">
                  <AppButtonLink to={milestone.route} variant="secondary" size="sm">
                    {milestone.actionLabel}
                  </AppButtonLink>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-4 rounded-[28px] border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">
          ما شاء الله، أنجزت كل المحطات الحالية. استمر على نفس الهدوء والثبات.
        </div>
      )}
    </AppCard>
  );
}
