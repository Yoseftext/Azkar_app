import { AppCard } from '@/shared/ui/primitives/AppCard';
import { AppButtonLink } from '@/shared/ui/primitives/AppButtonLink';
import type { DailyMicroContentCard } from '@/features/home/domain/daily-micro-content';

interface DailyMicroContentProps {
  items: DailyMicroContentCard[];
}

export function DailyMicroContent({ items }: DailyMicroContentProps) {
  return (
    <AppCard title="جرعة اليوم الخفيفة" subtitle="محتوى قصير جدًا يساعدك على العودة اليومية بدون مقاومة أو تشتيت.">
      <div className="grid gap-3 md:grid-cols-3">
        {items.map((item) => (
          <article key={item.id} className="rounded-[var(--ui-radius-panel)] bg-slate-50 p-4 dark:bg-slate-800/70">
            <div className="space-y-2" dir="rtl">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-50">{item.title}</h3>
              <p className="min-h-[88px] text-sm leading-7 text-slate-700 dark:text-slate-200">{item.body}</p>
              <AppButtonLink to={item.to} variant="secondary" size="sm" fullWidth>
                {item.ctaLabel}
              </AppButtonLink>
            </div>
          </article>
        ))}
      </div>
    </AppCard>
  );
}
