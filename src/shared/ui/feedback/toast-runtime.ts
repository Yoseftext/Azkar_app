import type { ToastType } from '@/shared/ui/feedback/toast-store';

const TOAST_DEDUPE_WINDOW_MS = 1_200;
const MAX_ACTIVE_TOASTS = 4;

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>();
const recentToastKeys = new Map<string, number>();
const activeToastIdsByKey = new Map<string, string>();

export function buildToastKey(message: string, type: ToastType): string {
  return `${type}:${message.trim()}`;
}

export function canShowToast(key: string, now: number = Date.now()): boolean {
  const lastShownAt = recentToastKeys.get(key);
  recentToastKeys.set(key, now);
  if (lastShownAt == null) return true;
  return now - lastShownAt >= TOAST_DEDUPE_WINDOW_MS;
}

export function getActiveToastId(key: string): string | undefined {
  return activeToastIdsByKey.get(key);
}

export function registerActiveToast(key: string, id: string): void {
  activeToastIdsByKey.set(key, id);
}

export function clearActiveToast(key: string, id: string): void {
  if (activeToastIdsByKey.get(key) !== id) return;
  activeToastIdsByKey.delete(key);
}

export function trackToastTimeout(id: string, callback: () => void, delayMs: number): void {
  clearToastTimeout(id);
  const timeoutId = globalThis.setTimeout(() => {
    toastTimeouts.delete(id);
    callback();
  }, delayMs);
  toastTimeouts.set(id, timeoutId);
}

export function clearToastTimeout(id: string): void {
  const timeoutId = toastTimeouts.get(id);
  if (timeoutId == null) return;
  globalThis.clearTimeout(timeoutId);
  toastTimeouts.delete(id);
}

export function clearAllToastTimeouts(): void {
  for (const timeoutId of toastTimeouts.values()) {
    globalThis.clearTimeout(timeoutId);
  }
  toastTimeouts.clear();
}

export function trimToasts<T extends { id: string; key: string }>(toasts: T[]): { nextToasts: T[]; evicted: T[] } {
  if (toasts.length <= MAX_ACTIVE_TOASTS) return { nextToasts: toasts, evicted: [] };
  const overflowCount = toasts.length - MAX_ACTIVE_TOASTS;
  return {
    nextToasts: toasts.slice(overflowCount),
    evicted: toasts.slice(0, overflowCount),
  };
}

export function resetToastRuntimeForTests(): void {
  clearAllToastTimeouts();
  recentToastKeys.clear();
  activeToastIdsByKey.clear();
}
