import { create } from 'zustand';
import { LocalStorageEngine } from '@/kernel/storage/local-storage-engine';
import { STORAGE_KEYS } from '@/kernel/storage/storage-keys';
import type { PreferencesState, ThemeMode } from '@/kernel/preferences/preferences-types';

interface PreferencesStore extends PreferencesState {
  initialize: () => void;
  setThemeMode: (themeMode: ThemeMode) => void;
}

const storage = new LocalStorageEngine();
const fallbackState: PreferencesState = { themeMode: 'system' };

function normalizeThemeMode(themeMode: unknown): ThemeMode {
  return themeMode === 'dark' || themeMode === 'light' || themeMode === 'system' ? themeMode : 'system';
}

function resolveSystemTheme(): 'dark' | 'light' {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(themeMode: ThemeMode): void {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  if (!root?.classList) return;

  const resolvedTheme = themeMode === 'system' ? resolveSystemTheme() : themeMode;
  root.classList.toggle('dark', resolvedTheme === 'dark');
}

export const usePreferencesStore = create<PreferencesStore>((set) => ({
  ...fallbackState,
  initialize: () => {
    const stored = storage.getItem<PreferencesState>(STORAGE_KEYS.preferences);
    const nextState: PreferencesState = {
      themeMode: normalizeThemeMode(stored?.themeMode),
    };
    applyTheme(nextState.themeMode);
    set(nextState);
  },
  setThemeMode: (themeMode) => {
    const nextThemeMode = normalizeThemeMode(themeMode);
    storage.setItem(STORAGE_KEYS.preferences, { themeMode: nextThemeMode });
    applyTheme(nextThemeMode);
    set({ themeMode: nextThemeMode });
  },
}));
