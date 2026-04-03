import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/shared/lib/cn';
import { SURFACE_TILE_CLASS } from '@/shared/ui/design/ui-classes';

interface InteractiveTileProps {
  to: string;
  title: string;
  subtitle?: string;
  leading?: ReactNode;
  trailing?: ReactNode;
  className?: string;
}

export function InteractiveTile({ to, title, subtitle, leading, trailing, className }: InteractiveTileProps) {
  return (
    <Link to={to} className={cn(SURFACE_TILE_CLASS, className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3">
            {leading ? <span className="text-xl leading-none">{leading}</span> : null}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-slate-900 dark:text-slate-50">{title}</p>
              {subtitle ? <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{subtitle}</p> : null}
            </div>
          </div>
        </div>
        {trailing ? <span className="shrink-0 text-slate-400">{trailing}</span> : null}
      </div>
    </Link>
  );
}
