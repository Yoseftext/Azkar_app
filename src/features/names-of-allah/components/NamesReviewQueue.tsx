import type { NameReviewQueueItem } from '@/features/names-of-allah/domain/names-review-flow';
import { AppChip } from '@/shared/ui/primitives/AppChip';

interface NamesReviewQueueProps {
  items: NameReviewQueueItem[];
  activeId: string | null;
  onOpen: (id: string) => void;
}

export function NamesReviewQueue({ items, activeId, onOpen }: NamesReviewQueueProps) {
  if (items.length === 0) return null;

  return (
    <div>
      <p className="mb-2 text-xs font-semibold text-slate-500 dark:text-slate-300">مراجعة سريعة</p>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <AppChip
            key={item.id}
            variant={item.id === activeId ? 'active' : 'neutral'}
            onClick={() => onOpen(item.id)}
            title={item.hint}
          >
            {item.name}
          </AppChip>
        ))}
      </div>
    </div>
  );
}
