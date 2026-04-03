import { AppCard } from '@/shared/ui/primitives/AppCard';
import { AppButton } from '@/shared/ui/primitives/AppButton';
import type { QuranHeroRecommendation } from '@/features/quran/domain/quran-reading-flow';

interface QuranHeroCardProps {
  hero: QuranHeroRecommendation;
  onResume: () => void;
  onOpenSurah: (surahNumber: number) => void;
}

export function QuranHeroCard({ hero, onResume, onOpenSurah }: QuranHeroCardProps) {
  const handleAction = () => {
    if (hero.action === 'resume') {
      onResume();
      return;
    }

    if (hero.surahNumber) {
      onOpenSurah(hero.surahNumber);
    }
  };

  return (
    <AppCard className="overflow-hidden border-2 border-emerald-200 bg-emerald-50/90 dark:border-emerald-900/60 dark:bg-emerald-950/30">
      <div className="space-y-4" dir="rtl">
        <div className="space-y-2">
          <p className="text-xs font-semibold tracking-wide text-slate-500 dark:text-slate-400">جلسة القراءة الحالية</p>
          <h2 className="text-lg font-extrabold text-slate-950 dark:text-slate-50">{hero.title}</h2>
          <p className="text-sm leading-7 text-slate-700 dark:text-slate-200">{hero.body}</p>
        </div>

        <AppButton fullWidth variant="success" onClick={handleAction}>
          {hero.actionLabel}
        </AppButton>
      </div>
    </AppCard>
  );
}
