import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { getChipClass, type ChipVariant } from '@/shared/ui/design/ui-classes';

interface AppChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ChipVariant;
  children: ReactNode;
}

export function AppChip({ variant = 'neutral', className, children, type = 'button', ...props }: AppChipProps) {
  return (
    <button type={type} className={getChipClass({ variant, className })} {...props}>
      {children}
    </button>
  );
}
