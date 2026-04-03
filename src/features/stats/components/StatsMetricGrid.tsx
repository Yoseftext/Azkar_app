import type { DashboardMetric } from '@/features/stats/domain/stats-types';
import { StatTile } from '@/shared/ui/primitives/StatTile';

const VARIANTS = ['sky', 'emerald', 'amber', 'slate'] as const;

interface StatsMetricGridProps {
  metrics: DashboardMetric[];
}

export function StatsMetricGrid({ metrics }: StatsMetricGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {metrics.map((metric, index) => (
        <StatTile
          key={metric.label}
          label={metric.label}
          value={metric.value}
          hint={metric.hint}
          variant={VARIANTS[index % VARIANTS.length]}
        />
      ))}
    </div>
  );
}
