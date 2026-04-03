import type { InputHTMLAttributes } from 'react';
import { cn } from '@/shared/lib/cn';
import { INPUT_CLASS, MUTED_PANEL_CLASS } from '@/shared/ui/design/ui-classes';

interface AppTextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  panelClassName?: string;
}

export function AppTextField({ label, className, panelClassName, id, ...props }: AppTextFieldProps) {
  return (
    <div className={cn(MUTED_PANEL_CLASS, panelClassName)}>
      <label htmlFor={id} className="text-xs font-semibold text-slate-500 dark:text-slate-300">
        {label}
      </label>
      <input id={id} className={cn('mt-2', INPUT_CLASS, className)} {...props} />
    </div>
  );
}
