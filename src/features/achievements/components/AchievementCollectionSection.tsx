import { AppCard } from '@/shared/ui/primitives/AppCard';
import type { AchievementDefinition } from '@/features/achievements/domain/achievement-types';

interface AchievementCollectionSectionProps {
  title: string;
  items: AchievementDefinition[];
  unlocked: boolean;
}

export function AchievementCollectionSection({ title, items, unlocked }: AchievementCollectionSectionProps) {
  if (items.length === 0) return null;

  return (
    <AppCard title={title}>
      <div className="grid grid-cols-2 gap-3">
        {items.map((item) => (
          <div
            key={item.id}
            className={[
              'rounded-3xl p-3 transition',
              unlocked
                ? 'border border-sky-200 bg-sky-50 dark:border-sky-800 dark:bg-sky-950/40'
                : 'bg-slate-50 opacity-60 dark:bg-slate-800/70',
            ].join(' ')}
          >
            <p className="text-2xl">{unlocked ? item.icon : '🔒'}</p>
            <p className="mt-2 text-sm font-bold text-slate-900 dark:text-slate-50">{item.title}</p>
            <p className="mt-1 text-xs leading-6 text-slate-500 dark:text-slate-400">{item.description}</p>
          </div>
        ))}
      </div>
    </AppCard>
  );
}
