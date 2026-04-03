import type {
  ColorTheme,
  LineSpacing,
  MotionMode,
  ReadingDensity,
  TextSize,
  ThemeMode,
} from '@/kernel/preferences/preferences-types';

export const THEME_MODE_LABELS: Record<ThemeMode, string> = {
  light: '☀️ فاتح',
  dark: '🌙 داكن',
  system: '⚙️ تلقائي',
};

export const THEME_MODE_SUMMARY_LABELS: Record<ThemeMode, string> = {
  light: 'فاتح',
  dark: 'داكن',
  system: 'تلقائي',
};

export const COLOR_THEME_LABELS: Record<ColorTheme, string> = {
  sky: 'Sky',
  sand: 'Sand',
  emerald: 'Emerald',
  night: 'Night',
};

export const COLOR_THEME_SUMMARY_LABELS: Record<ColorTheme, string> = {
  sky: 'Sky',
  sand: 'Sand',
  emerald: 'Emerald',
  night: 'Night',
};

export const TEXT_SIZE_LABELS: Record<TextSize, string> = {
  base: 'قياسي',
  large: 'كبير',
  xlarge: 'أكبر',
};

export const READING_DENSITY_LABELS: Record<ReadingDensity, string> = {
  comfortable: 'مريح',
  compact: 'مضغوط',
};

export const LINE_SPACING_LABELS: Record<LineSpacing, string> = {
  relaxed: 'متوازن',
  spacious: 'واسع',
};

export const MOTION_MODE_LABELS: Record<MotionMode, string> = {
  full: 'عادي',
  reduced: 'تقليل الحركة',
};
