import { AppCard } from '@/shared/ui/primitives/AppCard';

export function ReadingPreviewCard() {
  return (
    <AppCard title="معاينة القراءة" subtitle="تتأثر هذه البطاقة بحجم الخط والمسافات والحركة واللون المختار مباشرة.">
      <div className="app-reading-surface space-y-3 rounded-[var(--ui-radius-card)] border p-[var(--ui-card-padding)]">
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">نموذج قصير</p>
        <p className="app-reading-text text-slate-900 dark:text-slate-50">
          اللهم أعنّي على ذكرك وشكرك وحسن عبادتك، واجعل يومي هذا أخفّ على القلب، أوضح في الخطوة التالية، وأهدأ في القراءة.
        </p>
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="rounded-full bg-[var(--ui-primary-soft-bg)] px-3 py-1 font-semibold text-[var(--ui-primary-soft-text)]">ذكر اليوم</span>
          <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">معاينة حيّة</span>
        </div>
      </div>
    </AppCard>
  );
}
