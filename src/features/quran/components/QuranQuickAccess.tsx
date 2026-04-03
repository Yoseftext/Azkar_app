import { AppCard } from '@/shared/ui/primitives/AppCard';
import { AppChip } from '@/shared/ui/primitives/AppChip';
import type { QuranQuickAccessItem } from '@/features/quran/domain/quran-reading-flow';

interface QuranQuickAccessProps {
  items: QuranQuickAccessItem[];
  onOpenSurah: (surahNumber: number) => void;
  onPreloadSurah: (surahNumber: number) => void;
}

export function QuranQuickAccess({ items, onOpenSurah, onPreloadSurah }: QuranQuickAccessProps) {
  if (items.length === 0) return null;

  return (
    <AppCard title="الوصول السريع" subtitle="استأنف بسهولة من آخر موضع أو من السور التي عدت إليها مؤخرًا.">
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <AppChip
            key={item.surahNumber}
            variant={item.badge ? 'active' : 'neutral'}
            onClick={() => onOpenSurah(item.surahNumber)}
            onMouseEnter={() => onPreloadSurah(item.surahNumber)}
            onFocus={() => onPreloadSurah(item.surahNumber)}
            onTouchStart={() => onPreloadSurah(item.surahNumber)}
          >
            {item.surahName}
            {item.badge ? ` • ${item.badge}` : ''}
          </AppChip>
        ))}
      </div>
    </AppCard>
  );
}
