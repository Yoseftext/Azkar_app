import type { ReactNode } from 'react';

interface AppCardProps {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}

export function AppCard({ title, subtitle, children, className = '' }: AppCardProps) {
  return (
    <section className={`rounded-[28px] border border-white/60 bg-white/90 p-4 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/85 ${className}`.trim()}>
      {(title || subtitle) && (
        <header className="mb-3">
          {title ? <h2 className="text-base font-bold text-slate-900 dark:text-slate-50">{title}</h2> : null}
          {subtitle ? <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{subtitle}</p> : null}
        </header>
      )}
      {children}
    </section>
  );
}
