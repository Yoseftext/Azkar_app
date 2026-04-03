import { getStatTileClass, type StatVariant } from '@/shared/ui/design/ui-classes';

interface StatTileProps {
  label: string;
  value: string;
  hint: string;
  variant?: StatVariant;
}

export function StatTile({ label, value, hint, variant = 'slate' }: StatTileProps) {
  return (
    <div className={getStatTileClass(variant)}>
      <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-2 truncate text-xl font-bold text-slate-900 dark:text-slate-50">{value}</p>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{hint}</p>
    </div>
  );
}
