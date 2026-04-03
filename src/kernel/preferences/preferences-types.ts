export type ThemeMode = 'light' | 'dark' | 'system';
export type ColorTheme = 'sky' | 'sand' | 'emerald' | 'night';
export type TextSize = 'base' | 'large' | 'xlarge';
export type ReadingDensity = 'comfortable' | 'compact';
export type LineSpacing = 'relaxed' | 'spacious';
export type MotionMode = 'full' | 'reduced';

export interface PreferencesState {
  themeMode: ThemeMode;
  colorTheme: ColorTheme;
  textSize: TextSize;
  readingDensity: ReadingDensity;
  lineSpacing: LineSpacing;
  motionMode: MotionMode;
}
