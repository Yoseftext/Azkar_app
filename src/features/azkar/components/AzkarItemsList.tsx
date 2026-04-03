import { AppCard } from '@/shared/ui/primitives/AppCard';
import { AppButton } from '@/shared/ui/primitives/AppButton';
import type { AzkarCategory } from '@/features/azkar/domain/azkar-types';

interface AzkarItemsListProps {
  category: AzkarCategory;
  completedItemIds: Set<string>;
  completed: number;
  total: number;
  onToggleCompleted: (itemId: string) => void;
  onResetToday: () => void;
}

export function AzkarItemsList({
  category,
  completedItemIds,
  completed,
  total,
  onToggleCompleted,
  onResetToday,
}: AzkarItemsListProps) {
  return (
    <AppCard title={category.title} subtitle={`أنجزت ${completed} من ${total} اليوم. التكرار المطلوب محفوظ لكل ذكر داخل المحتوى نفسه.`}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="rounded-[var(--ui-radius-panel)] bg-emerald-50 px-4 py-3 dark:bg-emerald-950/30">
          <p className="text-xs text-emerald-700 dark:text-emerald-300">تقدم الجلسة</p>
          <p className="mt-1 text-lg font-bold text-emerald-900 dark:text-emerald-100">{completed} / {total}</p>
        </div>
        <AppButton variant="outline" onClick={onResetToday}>تصفير إنجاز اليوم</AppButton>
      </div>

      <ul className="space-y-3">
        {category.items.map((item) => {
          const isCompleted = completedItemIds.has(item.id);
          return (
            <li key={item.id} className="app-reading-surface rounded-[28px] border px-4 py-4">
              <div className="flex items-start gap-3">
                <button
                  type="button"
                  onClick={() => onToggleCompleted(item.id)}
                  className={[
                    'mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border text-sm font-bold transition',
                    isCompleted
                      ? 'border-emerald-500 bg-emerald-500 text-white'
                      : 'border-slate-300 text-slate-400 dark:border-slate-600 dark:text-slate-500',
                  ].join(' ')}
                  aria-label={isCompleted ? 'إلغاء إنجاز الذكر' : 'تأكيد إنجاز الذكر'}
                >
                  ✓
                </button>

                <div className="min-w-0 flex-1">
                  <p className="app-reading-text text-sm text-slate-900 dark:text-slate-50">{item.text}</p>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs">
                    <span className="rounded-full bg-sky-100 px-3 py-1 font-semibold text-sky-800 dark:bg-sky-950/50 dark:text-sky-200">
                      التكرار {item.repeatTarget}
                    </span>
                    {item.reference ? (
                      <span className="rounded-full bg-slate-200 px-3 py-1 font-semibold text-slate-700 dark:bg-slate-700 dark:text-slate-100">
                        {item.reference}
                      </span>
                    ) : null}
                    {isCompleted ? (
                      <span className="rounded-full bg-emerald-100 px-3 py-1 font-semibold text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200">
                        تم اليوم
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </AppCard>
  );
}
