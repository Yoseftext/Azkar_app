import { AppCard } from '@/shared/ui/primitives/AppCard';

interface SectionPlaceholderProps {
  title: string;
  body: string;
  tasks: string[];
}

export function SectionPlaceholder({ title, body, tasks }: SectionPlaceholderProps) {
  return (
    <div className="space-y-4">
      <AppCard title={title} subtitle={body}>
        <div className="rounded-3xl bg-slate-50 p-3 dark:bg-slate-800/70">
          <p className="text-sm leading-6 text-slate-700 dark:text-slate-200">
            هذا القسم موجود داخل البنية الجديدة، لكن ما زال في مرحلة النقل التدريجي من الـ legacy content/runtime.
          </p>
        </div>
      </AppCard>

      <AppCard title="مهام هذا القسم">
        <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-200">
          {tasks.map((task) => (
            <li key={task} className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800/80">
              {task}
            </li>
          ))}
        </ul>
      </AppCard>
    </div>
  );
}
