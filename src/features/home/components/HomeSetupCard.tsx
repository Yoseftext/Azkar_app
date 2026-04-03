import { AppCard } from '@/shared/ui/primitives/AppCard';
import { AppButton } from '@/shared/ui/primitives/AppButton';
import { AppButtonLink } from '@/shared/ui/primitives/AppButtonLink';
import { AppChip } from '@/shared/ui/primitives/AppChip';
import type { HomeSetupCardModel } from '@/features/home/domain/home-onboarding';

interface HomeSetupCardProps {
  model: HomeSetupCardModel;
  onDismiss: () => void;
}

export function HomeSetupCard({ model, onDismiss }: HomeSetupCardProps) {
  if (!model.shouldShow) return null;

  return (
    <AppCard title={model.title} subtitle={model.body}>
      <div className="space-y-3" dir="rtl">
        <div className="grid gap-3 md:grid-cols-3">
          {model.steps.map((step, index) => (
            <article key={step.id} className="rounded-[var(--ui-radius-panel)] bg-slate-50 p-4 dark:bg-slate-800/70">
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">الخطوة {index + 1}</span>
                <AppChip variant={step.isComplete ? 'active' : 'subtle'}>
                  {step.isComplete ? 'تمت' : 'مقترحة'}
                </AppChip>
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-50">{step.title}</h3>
              <p className="mt-2 min-h-[72px] text-sm leading-7 text-slate-700 dark:text-slate-200">{step.body}</p>
              {!step.isComplete ? (
                <AppButtonLink to={step.to} variant="secondary" size="sm" fullWidth>
                  {step.ctaLabel}
                </AppButtonLink>
              ) : null}
            </article>
          ))}
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <AppButtonLink to={model.primaryTo} fullWidth>
            {model.primaryLabel}
          </AppButtonLink>
          <AppButton variant="secondary" fullWidth onClick={onDismiss}>
            أخفِ هذه البطاقة
          </AppButton>
        </div>
      </div>
    </AppCard>
  );
}
