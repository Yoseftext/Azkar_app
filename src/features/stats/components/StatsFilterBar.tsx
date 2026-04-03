import type { PeriodFilter } from '@/shared/lib/date';
import { AppChip } from '@/shared/ui/primitives/AppChip';

const FILTERS: Array<{ key: PeriodFilter; label: string }> = [
  { key: 'day', label: 'اليوم' },
  { key: 'week', label: '7 أيام' },
  { key: 'month', label: 'الشهر' },
  { key: 'all', label: 'الكل' },
];

interface StatsFilterBarProps {
  filter: PeriodFilter;
  onChange: (filter: PeriodFilter) => void;
}

export function StatsFilterBar({ filter, onChange }: StatsFilterBarProps) {
  return (
    <div className="flex flex-wrap gap-2" aria-label="فلترة الإحصائيات">
      {FILTERS.map((item) => (
        <AppChip
          key={item.key}
          variant={filter === item.key ? 'active' : 'neutral'}
          onClick={() => onChange(item.key)}
          aria-pressed={filter === item.key}
        >
          {item.label}
        </AppChip>
      ))}
    </div>
  );
}
