import { AppCard } from '@/shared/ui/primitives/AppCard';
import { AppChip } from '@/shared/ui/primitives/AppChip';
import type { AzkarCategory } from '@/features/azkar/domain/azkar-types';

interface AzkarCategoryPickerProps {
  categories: AzkarCategory[];
  selectedSlug: string | null;
  getProgressLabel: (slug: string) => string;
  onSelect: (slug: string) => void;
}

export function AzkarCategoryPicker({ categories, selectedSlug, getProgressLabel, onSelect }: AzkarCategoryPickerProps) {
  if (categories.length === 0) return null;

  return (
    <AppCard title="التصنيفات" subtitle="اختر تصنيفًا لعرض أذكاره وتتبع تقدمك اليومي.">
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <AppChip
            key={category.slug}
            variant={selectedSlug === category.slug ? 'active' : 'neutral'}
            onClick={() => onSelect(category.slug)}
          >
            {category.title} • {getProgressLabel(category.slug)}
          </AppChip>
        ))}
      </div>
    </AppCard>
  );
}
