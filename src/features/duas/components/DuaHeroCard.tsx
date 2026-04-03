import type { DuaHeroModel } from '@/features/duas/domain/dua-supportive-flow';
import { AppButton } from '@/shared/ui/primitives/AppButton';
import { AppCard } from '@/shared/ui/primitives/AppCard';

interface DuaHeroCardProps {
  hero: DuaHeroModel | null;
  onOpen: (slug: string) => void;
}

export function DuaHeroCard({ hero, onOpen }: DuaHeroCardProps) {
  if (!hero) return null;

  return (
    <AppCard title="الجرعة اليومية" subtitle={hero.progressLabel}>
      <div className="rounded-[var(--ui-radius-panel)] bg-emerald-50 p-4 dark:bg-emerald-950/30">
        <p className="text-lg font-bold text-slate-900 dark:text-slate-50">{hero.title}</p>
        <p className="mt-2 text-sm leading-7 text-slate-700 dark:text-slate-200">{hero.body}</p>
        <div className="mt-4">
          <AppButton onClick={() => onOpen(hero.slug)} variant="success" fullWidth>
            افتح هذه الفئة
          </AppButton>
        </div>
      </div>
    </AppCard>
  );
}
