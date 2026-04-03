import { EmptyState } from '@/shared/ui/feedback/EmptyState';
import { AppButton } from '@/shared/ui/primitives/AppButton';

interface SearchEmptyStateProps {
  title: string;
  body: string;
  onClear: () => void;
}

export function SearchEmptyState({ title, body, onClear }: SearchEmptyStateProps) {
  return (
    <div className="space-y-3">
      <EmptyState title={title} body={body} />
      <div className="flex justify-center">
        <AppButton variant="outline" size="sm" onClick={onClear}>
          امسح البحث
        </AppButton>
      </div>
    </div>
  );
}
