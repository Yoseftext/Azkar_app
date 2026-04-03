import type { NameOfTheDayModel } from '@/features/names-of-allah/domain/names-review-flow';
import { AppButton } from '@/shared/ui/primitives/AppButton';
import { AppCard } from '@/shared/ui/primitives/AppCard';

interface NameOfTheDayCardProps {
  item: NameOfTheDayModel | null;
  onOpen: (id: string) => void;
  onToggleCompleted: (id: string) => void;
}

export function NameOfTheDayCard({ item, onOpen, onToggleCompleted }: NameOfTheDayCardProps) {
  if (!item) return null;

  return (
    <AppCard title="اسم اليوم" subtitle={item.isCompletedToday ? 'تمت مراجعته اليوم' : 'جرعة مراجعة خفيفة'}>
      <div className="rounded-[var(--ui-radius-panel)] bg-emerald-50 p-4 dark:bg-emerald-950/30">
        <p className="text-2xl font-black text-slate-900 dark:text-slate-50">{item.title}</p>
        <p className="mt-2 text-sm leading-7 text-slate-700 dark:text-slate-200">{item.body}</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <AppButton onClick={() => onOpen(item.id)} variant="primary" fullWidth>
            افتح اسم اليوم
          </AppButton>
          <AppButton onClick={() => onToggleCompleted(item.id)} variant={item.isCompletedToday ? 'outline' : 'success'} fullWidth>
            {item.isCompletedToday ? 'إلغاء مراجعة اليوم' : 'تأكيد مراجعة اليوم'}
          </AppButton>
        </div>
      </div>
    </AppCard>
  );
}
