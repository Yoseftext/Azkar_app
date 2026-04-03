import { InteractiveTile } from '@/shared/ui/primitives/InteractiveTile';
import { AppCard } from '@/shared/ui/primitives/AppCard';
import type { HomeQuickAccessItem } from '@/features/home/domain/home-quick-access';

interface QuickAccessSectionProps {
  title: string;
  subtitle: string;
  items: HomeQuickAccessItem[];
}

export function QuickAccessSection({ title, subtitle, items }: QuickAccessSectionProps) {
  return (
    <AppCard title={title} subtitle={subtitle}>
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
