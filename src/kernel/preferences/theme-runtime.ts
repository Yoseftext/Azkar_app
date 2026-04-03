import type { ThemeMode } from '@/kernel/preferences/preferences-types';

const SYSTEM_DARK_QUERY = '(prefers-color-scheme: dark)';
let disposeSystemThemeListener: (() => void) | null = null;

function getDocumentRoot(): HTMLElement | null {
  if (typeof document === 'undefined') return null;
  return document.documentElement ?? null;
}

function getSystemThemeMediaQuery(): MediaQueryList | null {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return null;
  return window.matchMedia(SYSTEM_DARK_QUERY);
}

export function resolveSystemTheme(): 'dark' | 'light' {
  return getSystemThemeMediaQuery()?.matches ? 'dark' : 'light';
}

export function applyTheme(themeMode: ThemeMode): void {
  const root = getDocumentRoot();
  if (!root?.classList) return;

  const resolvedTheme = themeMode === 'system' ? resolveSystemTheme() : themeMode;
  root.classList.toggle('dark', resolvedTheme === 'dark');
}

function removeSystemThemeListener(): void {
  disposeSystemThemeListener?.();
  disposeSystemThemeListener = null;
}

function attachSystemThemeListener(onChange: () => void): void {
  const mediaQuery = getSystemThemeMediaQuery();
  if (!mediaQuery) return;

  const handler = () => onChange();

  if (typeof mediaQuery.addEventListener === 'function') {
    mediaQuery.addEventListener('change', handler);
    disposeSystemThemeListener = () => mediaQuery.removeEventListener('change', handler);
    return;
  }

  if (typeof mediaQuery.addListener === 'function') {
    mediaQuery.addListener(handler);
    disposeSystemThemeListener = () => mediaQuery.removeListener(handler);
  }
}

export function syncThemeRuntime(themeMode: ThemeMode): void {
  removeSystemThemeListener();
  applyTheme(themeMode);

  if (themeMode !== 'system') return;
  attachSystemThemeListener(() => applyTheme('system'));
}

export function disposeThemeRuntime(): void {
  removeSystemThemeListener();
}
