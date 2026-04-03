import type { MasbahaSessionHeroModel } from '@/features/masbaha/domain/masbaha-session-flow';
import { AppButton } from '@/shared/ui/primitives/AppButton';
import { AppCard } from '@/shared/ui/primitives/AppCard';

interface MasbahaSessionHeroProps {
  hero: MasbahaSessionHeroModel;
  canReset: boolean;
  onIncrement: () => void;
  onReset: () => void;
}

export function MasbahaSessionHero({ hero, canReset, onIncrement, onReset }: MasbahaSessionHeroProps) {
  return (
    <AppCard title="جلسة اليوم" subtitle={hero.streakLabel}>
      <div className="rounded-[var(--ui-radius-panel)] bg-sky-50 p-4 dark:bg-sky-950/30">
        <p className="text-lg font-bold text-slate-900 dark:text-slate-50">{hero.title}</p>
        <p className="mt-2 text-sm leading-7 text-slate-700 dark:text-slate-200">{hero.body}</p>
        <p className="mt-3 text-xs font-semibold text-sky-700 dark:text-sky-300">{hero.progressLabel}</p>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <AppButton onClick={onIncrement} variant="primary" fullWidth>
            سبّح الآن
          </AppButton>
          <AppButton onClick={onReset} variant="outline" fullWidth disabled={!canReset}>
            تصفير الجلسة
          </AppButton>
        </div>
      </div>
    </AppCard>
  );
}
