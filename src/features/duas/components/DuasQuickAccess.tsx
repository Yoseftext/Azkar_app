import type { DuaQuickAccessItem } from '@/features/duas/domain/dua-supportive-flow';
import { AppChip } from '@/shared/ui/primitives/AppChip';

interface DuasQuickAccessProps {
  items: DuaQuickAccessItem[];
  activeSlug: string | null;
  onOpen: (slug: string) => void;
}

export function DuasQuickAccess({ items, activeSlug, onOpen }: DuasQuickAccessProps) {
  if (items.length === 0) return null;

  return (
    <div>
      <p className="mb-2 text-xs font-semibold text-slate-500 dark:text-slate-300">وصول سريع</p>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <AppChip
            key={item.slug}
            variant={item.slug === activeSlug ? 'active' : 'neutral'}
            onClick={() => onOpen(item.slug)}
            title={item.hint}
          >
            {item.title}
          </AppChip>
        ))}
      </div>
    </div>
  );
}
