import { AppButton } from '@/shared/ui/primitives/AppButton';
import { cn } from '@/shared/lib/cn';

interface LoadStateNoticeProps {
  title: string;
  body: string;
  tone?: 'loading' | 'error';
  actionLabel?: string;
  onAction?: () => void;
}

const TONE_CLASS = {
  loading: 'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-200',
  error: 'border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-200',
} as const;

export function LoadStateNotice({ title, body, tone = 'loading', actionLabel, onAction }: LoadStateNoticeProps) {
  return (
    <div className={cn('rounded-[var(--ui-radius-card)] border px-4 py-4', TONE_CLASS[tone])} role={tone === 'error' ? 'alert' : 'status'}>
      <div className="space-y-2 text-right">
        <p className="text-sm font-bold">{title}</p>
        <p className="text-sm leading-6 opacity-90">{body}</p>
      </div>
      {actionLabel && onAction ? (
        <div className="mt-3 flex justify-start">
          <AppButton variant={tone === 'error' ? 'danger' : 'outline'} size="sm" onClick={onAction}>
            {actionLabel}
          </AppButton>
        </div>
      ) : null}
    </div>
  );
}
