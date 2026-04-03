import { cn } from '@/shared/lib/cn';

export const SURFACE_CARD_CLASS = cn(
  'rounded-[var(--ui-radius-card)] border border-white/60 bg-white/90 p-[var(--ui-card-padding)] shadow-sm backdrop-blur transition-[background-color,border-color,box-shadow]',
  'dark:border-slate-800 dark:bg-slate-900/85',
);

export const SURFACE_TILE_CLASS = cn(
  'rounded-[var(--ui-radius-card)] border border-slate-200 bg-slate-50 px-[var(--ui-card-padding)] py-[var(--ui-card-padding)] transition',
  'hover:border-[color:var(--ui-primary-strong)] hover:bg-[var(--ui-primary-soft-bg)] dark:border-slate-700 dark:bg-slate-800/70 dark:hover:border-[color:var(--ui-primary-soft-text)] dark:hover:bg-slate-800',
);

export const MUTED_PANEL_CLASS = 'rounded-[var(--ui-radius-panel)] bg-slate-50 p-[var(--ui-panel-padding)] dark:bg-slate-800/70';

export const INPUT_CLASS = cn(
  'w-full rounded-[var(--ui-radius-control)] border border-slate-200 bg-white px-4 py-[var(--ui-control-padding-y)] text-sm outline-none transition',
  'focus:border-[color:var(--ui-primary-solid)] focus:ring-2 focus:ring-[color:var(--ui-primary-ring)] dark:border-slate-700 dark:bg-slate-900',
);

const BUTTON_BASE_CLASS = cn(
  'inline-flex min-h-[44px] items-center justify-center gap-2 rounded-[var(--ui-radius-control)] px-4 py-[var(--ui-control-padding-y)] text-sm font-semibold transition',
  'focus:outline-none focus:ring-2 focus:ring-[color:var(--ui-primary-ring)] disabled:cursor-not-allowed disabled:opacity-60',
);

const BUTTON_VARIANTS = {
  primary: 'bg-[var(--ui-primary-solid)] text-[var(--ui-primary-contrast)] hover:bg-[var(--ui-primary-strong)]',
  secondary: 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700',
  outline: 'border border-slate-200 text-slate-700 hover:border-[color:var(--ui-primary-strong)] hover:text-[var(--ui-primary-strong)] dark:border-slate-700 dark:text-slate-200 dark:hover:border-[color:var(--ui-primary-soft-text)] dark:hover:text-[var(--ui-primary-soft-text)]',
  danger: 'bg-rose-600 text-white hover:bg-rose-700',
  success: 'bg-emerald-600 text-white hover:bg-emerald-700',
} as const;

const BUTTON_SIZES = {
  sm: 'min-h-[40px] px-3 py-2 text-xs',
  md: 'min-h-[44px] px-4 py-3 text-sm',
  lg: 'min-h-[48px] px-5 py-3.5 text-sm',
} as const;

export type ButtonVariant = keyof typeof BUTTON_VARIANTS;
export type ButtonSize = keyof typeof BUTTON_SIZES;

export function getButtonClass(options?: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  className?: string;
}) {
  const {
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    className,
  } = options ?? {};

  return cn(
    BUTTON_BASE_CLASS,
    BUTTON_VARIANTS[variant],
    BUTTON_SIZES[size],
    fullWidth && 'w-full',
    className,
  );
}

const CHIP_BASE_CLASS = cn(
  'inline-flex min-h-[40px] items-center justify-center rounded-full border px-3 py-2 text-xs font-semibold transition',
  'focus:outline-none focus:ring-2 focus:ring-[color:var(--ui-primary-ring)]',
);

const CHIP_VARIANTS = {
  neutral: 'border-slate-200 bg-white text-slate-700 hover:border-[color:var(--ui-primary-strong)] hover:text-[var(--ui-primary-strong)] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-[color:var(--ui-primary-soft-text)] dark:hover:text-[var(--ui-primary-soft-text)]',
  active: 'border-[color:var(--ui-primary-solid)] bg-[var(--ui-primary-solid)] text-[var(--ui-primary-contrast)] hover:border-[color:var(--ui-primary-strong)] hover:bg-[var(--ui-primary-strong)]',
  subtle: 'border-transparent bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700',
} as const;

export type ChipVariant = keyof typeof CHIP_VARIANTS;

export function getChipClass(options?: { variant?: ChipVariant; className?: string }) {
  const { variant = 'neutral', className } = options ?? {};
  return cn(CHIP_BASE_CLASS, CHIP_VARIANTS[variant], className);
}

const STAT_VARIANTS = {
  sky: 'bg-sky-50 dark:bg-sky-950/30',
  emerald: 'bg-emerald-50 dark:bg-emerald-950/30',
  amber: 'bg-amber-50 dark:bg-amber-950/30',
  slate: 'bg-slate-50 dark:bg-slate-800/70',
} as const;

export type StatVariant = keyof typeof STAT_VARIANTS;

export function getStatTileClass(variant: StatVariant = 'slate') {
  return cn('rounded-[var(--ui-radius-panel)] p-3', STAT_VARIANTS[variant]);
}
