import { create } from 'zustand';
import { LocalStorageEngine } from '@/kernel/storage/local-storage-engine';
import { STORAGE_KEYS } from '@/kernel/storage/storage-keys';
import type {
  ColorTheme,
  LineSpacing,
  MotionMode,
  PreferencesState,
  ReadingDensity,
  TextSize,
  ThemeMode,
} from '@/kernel/preferences/preferences-types';
import { syncReadingRuntime } from '@/kernel/preferences/reading-runtime';
import { syncThemeRuntime } from '@/kernel/preferences/theme-runtime';

interface PreferencesStore extends PreferencesState {
  initialize: () => void;
  setThemeMode: (themeMode: ThemeMode) => void;
  setColorTheme: (colorTheme: ColorTheme) => void;
  setTextSize: (textSize: TextSize) => void;
  setReadingDensity: (readingDensity: ReadingDensity) => void;
  setLineSpacing: (lineSpacing: LineSpacing) => void;
  setMotionMode: (motionMode: MotionMode) => void;
}

const storage = new LocalStorageEngine();
const fallbackState: PreferencesState = {
  themeMode: 'system',
  colorTheme: 'sky',
  textSize: 'base',
  readingDensity: 'comfortable',
  lineSpacing: 'relaxed',
  motionMode: 'full',
};

function normalizeThemeMode(themeMode: unknown): ThemeMode {
  return themeMode === 'dark' || themeMode === 'light' || themeMode === 'system' ? themeMode : fallbackState.themeMode;
}

function normalizeColorTheme(colorTheme: unknown): ColorTheme {
  return colorTheme === 'sky' || colorTheme === 'sand' || colorTheme === 'emerald' || colorTheme === 'night' ? colorTheme : fallbackState.colorTheme;
}

function normalizeTextSize(textSize: unknown): TextSize {
  return textSize === 'base' || textSize === 'large' || textSize === 'xlarge' ? textSize : fallbackState.textSize;
}

function normalizeReadingDensity(readingDensity: unknown): ReadingDensity {
  return readingDensity === 'comfortable' || readingDensity === 'compact' ? readingDensity : fallbackState.readingDensity;
}

function normalizeLineSpacing(lineSpacing: unknown): LineSpacing {
  return lineSpacing === 'relaxed' || lineSpacing === 'spacious' ? lineSpacing : fallbackState.lineSpacing;
}

function normalizeMotionMode(motionMode: unknown): MotionMode {
  return motionMode === 'full' || motionMode === 'reduced' ? motionMode : fallbackState.motionMode;
}

function normalizePreferences(stored?: Partial<PreferencesState> | null): PreferencesState {
  return {
    themeMode: normalizeThemeMode(stored?.themeMode),
    colorTheme: normalizeColorTheme(stored?.colorTheme),
    textSize: normalizeTextSize(stored?.textSize),
    readingDensity: normalizeReadingDensity(stored?.readingDensity),
    lineSpacing: normalizeLineSpacing(stored?.lineSpacing),
    motionMode: normalizeMotionMode(stored?.motionMode),
  };
}

function persistAndSync(nextState: PreferencesState): PreferencesState {
  storage.setItem(STORAGE_KEYS.preferences, nextState);
  syncThemeRuntime(nextState.themeMode);
  syncReadingRuntime(nextState);
  return nextState;
}

export const usePreferencesStore = create<PreferencesStore>((set, get) => ({
  ...fallbackState,
  initialize: () => {
    const stored = storage.getItem<PreferencesState>(STORAGE_KEYS.preferences);
    const nextState = normalizePreferences(stored);
    syncThemeRuntime(nextState.themeMode);
    syncReadingRuntime(nextState);
    set(nextState);
  },
  setThemeMode: (themeMode) => {
    const nextState = persistAndSync({ ...get(), themeMode: normalizeThemeMode(themeMode) });
    set(nextState);
  },
  setColorTheme: (colorTheme) => {
    const nextState = persistAndSync({ ...get(), colorTheme: normalizeColorTheme(colorTheme) });
    set(nextState);
  },
  setTextSize: (textSize) => {
    const nextState = persistAndSync({ ...get(), textSize: normalizeTextSize(textSize) });
    set(nextState);
  },
  setReadingDensity: (readingDensity) => {
    const nextState = persistAndSync({ ...get(), readingDensity: normalizeReadingDensity(readingDensity) });
    set(nextState);
  },
  setLineSpacing: (lineSpacing) => {
    const nextState = persistAndSync({ ...get(), lineSpacing: normalizeLineSpacing(lineSpacing) });
    set(nextState);
  },
  setMotionMode: (motionMode) => {
    const nextState = persistAndSync({ ...get(), motionMode: normalizeMotionMode(motionMode) });
    set(nextState);
  },
}));
