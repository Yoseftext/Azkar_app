import type { StatsInsight } from '@/features/stats/domain/stats-types';
import { AppCard } from '@/shared/ui/primitives/AppCard';
import { StatTile } from '@/shared/ui/primitives/StatTile';

interface StatsInsightListProps {
  insights: StatsInsight[];
}

export function StatsInsightList({ insights }: StatsInsightListProps) {
  return (
    <AppCard title="ملخص ذكي" subtitle="بدل الأرقام الخام فقط، هذه هي القراءة العملية لما يحدث في نشاطك الآن.">
      <div className="grid gap-3 md:grid-cols-3">
        {insights.map((item) => (
          <StatTile key={item.id} label={item.title} value="↗" hint={item.body} variant={item.tone} />
        ))}
      </div>
    </AppCard>
  );
}
