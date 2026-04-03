import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { getButtonClass, type ButtonSize, type ButtonVariant } from '@/shared/ui/design/ui-classes';

interface AppButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  children: ReactNode;
}

export function AppButton({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className,
  children,
  type = 'button',
  ...props
}: AppButtonProps) {
  return (
    <button
      type={type}
      className={getButtonClass({ variant, size, fullWidth, className })}
      {...props}
    >
      {children}
    </button>
  );
}
