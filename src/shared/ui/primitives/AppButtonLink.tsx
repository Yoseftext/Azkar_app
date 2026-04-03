import type { ReactNode } from 'react';
import { Link, type LinkProps } from 'react-router-dom';
import { getButtonClass, type ButtonSize, type ButtonVariant } from '@/shared/ui/design/ui-classes';

interface AppButtonLinkProps extends Omit<LinkProps, 'className'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  className?: string;
  children: ReactNode;
}

export function AppButtonLink({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className,
  children,
  ...props
}: AppButtonLinkProps) {
  return (
    <Link className={getButtonClass({ variant, size, fullWidth, className })} {...props}>
      {children}
    </Link>
  );
}
