import type { PreferencesState } from '@/kernel/preferences/preferences-types';

function getDocumentRoot(): HTMLElement | null {
  if (typeof document === 'undefined') return null;
  return document.documentElement ?? null;
}

export function syncReadingRuntime(preferences: PreferencesState): void {
  const root = getDocumentRoot();
  if (!root) return;

  const dataset = root.dataset;
  if (!dataset) return;

  dataset.uiTheme = preferences.colorTheme;
  dataset.textSize = preferences.textSize;
  dataset.readingDensity = preferences.readingDensity;
  dataset.lineSpacing = preferences.lineSpacing;
  dataset.motion = preferences.motionMode;
}
