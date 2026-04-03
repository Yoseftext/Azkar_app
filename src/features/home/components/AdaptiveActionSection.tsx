import { AppCard } from '@/shared/ui/primitives/AppCard';
import { InteractiveTile } from '@/shared/ui/primitives/InteractiveTile';
import type { AdaptiveHomeAction } from '@/features/home/domain/home-adaptive';

interface AdaptiveActionSectionProps {
  items: AdaptiveHomeAction[];
}

export function AdaptiveActionSection({ items }: AdaptiveActionSectionProps) {
  if (items.length === 0) return null;

  return (
    <AppCard title="الخطوة التالية الأنسب" subtitle="اختيارات مرتبة حسب برنامجك الحالي وما لم يُغلق بعد اليوم.">
      <div className="grid gap-3 md:grid-cols-3">
        {items.map((item) => (
          <InteractiveTile
            key={item.id}
            to={item.to}
            title={item.title}
            subtitle={item.body}
            leading={item.icon}
            trailing="←"
            className="min-h-[92px]"
          />
        ))}
      </div>
    </AppCard>
  );
}
