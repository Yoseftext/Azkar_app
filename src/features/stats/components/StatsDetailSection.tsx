import { AppCard } from '@/shared/ui/primitives/AppCard';

interface StatsDetailRow {
  label: string;
  value: string;
}

interface StatsDetailSectionProps {
  title: string;
  rows: StatsDetailRow[];
}

export function StatsDetailSection({ title, rows }: StatsDetailSectionProps) {
  return (
    <AppCard title={title}>
      <div className="space-y-1">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between border-b border-slate-100 py-2 last:border-0 dark:border-slate-800">
            <span className="text-sm text-slate-600 dark:text-slate-300">{row.label}</span>
            <span className="text-sm font-bold text-slate-900 dark:text-slate-50">{row.value}</span>
          </div>
        ))}
      </div>
    </AppCard>
  );
}
