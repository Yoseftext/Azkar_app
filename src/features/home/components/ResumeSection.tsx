import { AppCard } from '@/shared/ui/primitives/AppCard';
import { InteractiveTile } from '@/shared/ui/primitives/InteractiveTile';
import type { ResumeRecommendation } from '@/features/home/domain/home-recommendations';

interface ResumeSectionProps {
  items: ResumeRecommendation[];
}

export function ResumeSection({ items }: ResumeSectionProps) {
  if (items.length === 0) return null;

  return (
    <AppCard title="تابع من حيث توقفت" subtitle="أقرب خطوات العودة هي استكمال آخر شيء بدأته بدل البحث من جديد.">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <InteractiveTile
            key={item.id}
            to={item.to}
            title={item.title}
            subtitle={item.body}
            leading={item.icon}
            trailing="←"
          />
        ))}
      </div>
    </AppCard>
  );
}
