import type { ReactNode } from 'react';
import { AppChip } from '@/shared/ui/primitives/AppChip';

interface PreferenceOptionGroupProps<T extends string> {
  label: string;
  helper?: string;
  options: readonly T[];
  value: T;
  getLabel: (option: T) => ReactNode;
  onChange: (value: T) => void;
}

export function PreferenceOptionGroup<T extends string>({
  label,
  helper,
  options,
  value,
  getLabel,
  onChange,
}: PreferenceOptionGroupProps<T>) {
  return (
    <div className="space-y-2">
      <div>
        <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">{label}</p>
        {helper ? <p className="mt-1 text-xs leading-6 text-slate-500 dark:text-slate-400">{helper}</p> : null}
      </div>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <AppChip
            key={option}
            variant={value === option ? 'active' : 'neutral'}
            onClick={() => onChange(option)}
          >
            {getLabel(option)}
          </AppChip>
        ))}
      </div>
    </div>
  );
}
