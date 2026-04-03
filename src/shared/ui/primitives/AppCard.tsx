import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';
import { SURFACE_CARD_CLASS } from '@/shared/ui/design/ui-classes';

interface AppCardProps {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}

export function AppCard({ title, subtitle, children, className = '' }: AppCardProps) {
  return (
    <section className={cn(SURFACE_CARD_CLASS, className)}>
      {(title || subtitle) && (
        <header className="mb-3">
          {title ? <h2 className="text-base font-bold text-slate-900 dark:text-slate-50">{title}</h2> : null}
          {subtitle ? <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">{subtitle}</p> : null}
        </header>
      )}
      {children}
    </section>
  );
}
