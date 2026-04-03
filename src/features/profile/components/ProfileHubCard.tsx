import type { ProfileHubSummary } from '@/features/profile/domain/profile-hub';
import { AppButtonLink } from '@/shared/ui/primitives/AppButtonLink';
import { AppCard } from '@/shared/ui/primitives/AppCard';

interface ProfileHubCardProps {
  summary: ProfileHubSummary;
}

export function ProfileHubCard({ summary }: ProfileHubCardProps) {
  return (
    <AppCard title="مركزك الشخصي" subtitle="بدل التنقل بين الأقسام، هذه أفضل نقطتي رجوع لك الآن.">
      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-[var(--ui-radius-panel)] bg-slate-50 p-4 dark:bg-slate-800/70">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">استمر من هنا</p>
          <p className="mt-2 text-base font-semibold text-slate-900 dark:text-slate-50">{summary.resumeTitle}</p>
          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{summary.resumeBody}</p>
          <div className="mt-3">
            <AppButtonLink to={summary.resumeTo} size="sm">افتح الآن</AppButtonLink>
          </div>
        </div>

        <div className="rounded-[var(--ui-radius-panel)] bg-sky-50 p-4 dark:bg-sky-950/25">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">تركيز هذا الأسبوع</p>
          <p className="mt-2 text-base font-semibold text-slate-900 dark:text-slate-50">{summary.focusTitle}</p>
          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{summary.focusBody}</p>
          <div className="mt-3">
            <AppButtonLink to={summary.focusTo} size="sm" variant="secondary">خذ الخطوة التالية</AppButtonLink>
          </div>
        </div>
      </div>
    </AppCard>
  );
}
