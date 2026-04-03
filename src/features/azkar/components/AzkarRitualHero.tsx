import { AppCard } from '@/shared/ui/primitives/AppCard';
import { AppButton } from '@/shared/ui/primitives/AppButton';
import { AppChip } from '@/shared/ui/primitives/AppChip';
import { cn } from '@/shared/lib/cn';
import type { AzkarRitualHero as AzkarRitualHeroData, AzkarSessionCard } from '@/features/azkar/domain/azkar-ritual-flow';

const TONE_CLASSES = {
  sky: 'border-sky-200 bg-sky-50/90 dark:border-sky-900/60 dark:bg-sky-950/30',
  amber: 'border-amber-200 bg-amber-50/90 dark:border-amber-900/60 dark:bg-amber-950/30',
  emerald: 'border-emerald-200 bg-emerald-50/90 dark:border-emerald-900/60 dark:bg-emerald-950/30',
} as const;

interface AzkarRitualHeroProps {
  hero: AzkarRitualHeroData | null;
  sessions: AzkarSessionCard[];
  onOpenCategory: (slug: string) => void;
}

export function AzkarRitualHero({ hero, sessions, onOpenCategory }: AzkarRitualHeroProps) {
  if (!hero && sessions.length === 0) return null;

  return (
    <AppCard className={cn('overflow-hidden border-2', hero ? TONE_CLASSES[hero.tone] : undefined)}>
      <div className="space-y-4">
        {hero ? (
          <div className="space-y-2" dir="rtl">
            <p className="text-xs font-semibold tracking-wide text-slate-500 dark:text-slate-400">جلسة مقترحة الآن</p>
            <h2 className="text-lg font-extrabold text-slate-950 dark:text-slate-50">{hero.title}</h2>
            <p className="text-sm leading-7 text-slate-700 dark:text-slate-200">{hero.body}</p>
            <AppButton fullWidth onClick={() => onOpenCategory(hero.slug)}>
              {hero.actionLabel}
            </AppButton>
          </div>
        ) : null}

        {sessions.length > 0 ? (
          <div>
            <p className="mb-2 text-xs font-semibold text-slate-500 dark:text-slate-300">جلسات سريعة</p>
            <div className="flex flex-wrap gap-2">
              {sessions.map((session) => (
                <AppChip key={session.slug} variant={hero?.slug === session.slug ? 'active' : 'neutral'} onClick={() => onOpenCategory(session.slug)}>
                  {session.title} • {session.completed}/{session.total}
                </AppChip>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </AppCard>
  );
}
