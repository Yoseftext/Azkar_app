import { useMemo, useState } from 'react';
import { AppCard } from '@/shared/ui/primitives/AppCard';
import { AppButton } from '@/shared/ui/primitives/AppButton';
import { AppTextField } from '@/shared/ui/primitives/AppTextField';
import { EmptyState } from '@/shared/ui/feedback/EmptyState';
import { useTasksStore } from '@/features/tasks/state/tasks-store';
import type { TaskGroup } from '@/features/tasks/domain/task-types';

const tabs: Array<{ key: TaskGroup; label: string }> = [
  { key: 'wird', label: 'مهام الورد' },
  { key: 'personal', label: 'المهام الشخصية' },
];

export function TasksPage() {
  const [draft, setDraft] = useState('');
  const activeGroup = useTasksStore((state) => state.activeGroup);
  const items = useTasksStore((state) => state.items);
  const setActiveGroup = useTasksStore((state) => state.setActiveGroup);
  const addPersonalTask = useTasksStore((state) => state.addPersonalTask);
  const toggleTask = useTasksStore((state) => state.toggleTask);
  const removeTask = useTasksStore((state) => state.removeTask);


  const filteredItems = useMemo(
    () => items.filter((item) => item.group === activeGroup),
    [activeGroup, items],
  );

  const completedCount = filteredItems.filter((item) => item.completed).length;

  return (
    <div className="space-y-4">
      <AppCard title="لوحة المهام" subtitle="تابع تقدمك اليومي في المهام والورد">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-3xl bg-sky-50 p-3 dark:bg-sky-950/40">
            <p className="text-xs text-sky-700 dark:text-sky-300">المجموعة الحالية</p>
            <p className="mt-1 text-lg font-bold text-sky-900 dark:text-sky-100">{tabs.find((tab) => tab.key === activeGroup)?.label}</p>
          </div>
          <div className="rounded-3xl bg-emerald-50 p-3 dark:bg-emerald-950/40">
            <p className="text-xs text-emerald-700 dark:text-emerald-300">المنجز</p>
            <p className="mt-1 text-lg font-bold text-emerald-900 dark:text-emerald-100">{completedCount} / {filteredItems.length}</p>
          </div>
        </div>
      </AppCard>

      <AppCard>
        <div className="grid grid-cols-2 gap-2 rounded-3xl bg-slate-100 p-1 dark:bg-slate-800">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveGroup(tab.key)}
              className={[
                'rounded-[20px] px-4 py-3 text-sm font-semibold transition',
                activeGroup === tab.key
                  ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white'
                  : 'text-slate-500 dark:text-slate-300',
              ].join(' ')}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </AppCard>

      <AppCard title="إضافة مهمة شخصية" subtitle="يمكنك إضافة ورد أو مهمة شخصية جديدة">
        <form
          className="flex gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            addPersonalTask(draft);
            setDraft('');
          }}
        >
          <AppTextField
            id="task-draft"
            label="عنوان المهمة الجديدة"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="أضف ورداً أو مهمة شخصية"
            panelClassName="min-w-0 flex-1"
          />
          <AppButton type="submit">إضافة</AppButton>
        </form>
      </AppCard>

      {filteredItems.length === 0 ? (
        <EmptyState
          title="لا توجد مهام هنا بعد"
          body={activeGroup === 'personal' ? 'أضف مهمة شخصية جديدة، أو انتقل إلى مهام الورد لرؤية الخطوات الافتراضية لهذا اليوم.' : 'لا توجد مهام ورد ظاهرة الآن. جرّب التبديل إلى المهام الشخصية أو أعد ضبط القائمة.'}
          actionLabel={activeGroup === 'personal' ? 'اعرض مهام الورد' : 'اعرض المهام الشخصية'}
          onAction={() => setActiveGroup(activeGroup === 'personal' ? 'wird' : 'personal')}
        />
      ) : (
        <AppCard title="قائمة المهام">
          <ul className="space-y-3">
            {filteredItems.map((item) => (
              <li
                key={item.id}
                className="flex items-center gap-3 rounded-3xl border border-slate-200 bg-slate-50 px-3 py-3 dark:border-slate-700 dark:bg-slate-800/80"
              >
                <button
                  type="button"
                  onClick={() => toggleTask(item.id)}
                  className={[
                    'flex h-6 w-6 items-center justify-center rounded-full border text-xs font-bold transition',
                    item.completed
                      ? 'border-emerald-500 bg-emerald-500 text-white'
                      : 'border-slate-300 text-slate-400 dark:border-slate-600 dark:text-slate-500',
                  ].join(' ')}
                  aria-label={item.completed ? 'إلغاء الإنجاز' : 'تأكيد الإنجاز'}
                >
                  ✓
                </button>

                <div className="min-w-0 flex-1">
                  <p className={[
                    'truncate text-sm font-semibold',
                    item.completed ? 'text-emerald-700 line-through dark:text-emerald-300' : 'text-slate-900 dark:text-slate-100',
                  ].join(' ')}>
                    {item.title}
                  </p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {item.isDefault ? 'مهمة افتراضية' : 'مهمة شخصية'}
                  </p>
                </div>

                {!item.isDefault ? (
                  <button
                    type="button"
                    onClick={() => removeTask(item.id)}
                    className="rounded-2xl px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                  >
                    حذف
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
        </AppCard>
      )}
    </div>
  );
}
