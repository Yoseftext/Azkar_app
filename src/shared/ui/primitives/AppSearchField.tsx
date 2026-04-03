import type { InputHTMLAttributes } from 'react';
import { AppButton } from '@/shared/ui/primitives/AppButton';
import { AppTextField } from '@/shared/ui/primitives/AppTextField';

interface AppSearchFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  query: string;
  onQueryChange: (value: string) => void;
  onClear?: () => void;
  panelClassName?: string;
}

export function AppSearchField({
  label,
  query,
  onQueryChange,
  onClear,
  id,
  panelClassName,
  ...props
}: AppSearchFieldProps) {
  return (
    <div className="space-y-2">
      <AppTextField
        id={id}
        label={label}
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        panelClassName={panelClassName}
        {...props}
      />
      {query.trim() ? (
        <div className="flex justify-end">
          <AppButton size="sm" variant="outline" onClick={onClear ?? (() => onQueryChange(''))}>
            مسح البحث
          </AppButton>
        </div>
      ) : null}
    </div>
  );
}
