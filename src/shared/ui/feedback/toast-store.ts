/**
 * ====================================================================
 * Toast Store — نظام الإشعارات المرئية
 * ====================================================================
 * بديل لـ emit(EVENTS.TOAST_SHOW) في V2.
 * يعمل كـ singleton Zustand store يمكن استدعاؤه من أي مكان.
 * ====================================================================
 */
import { create } from 'zustand';
import {
  buildToastKey,
  canShowToast,
  clearActiveToast,
  clearAllToastTimeouts,
  clearToastTimeout,
  getActiveToastId,
  registerActiveToast,
  resetToastRuntimeForTests,
  trackToastTimeout,
  trimToasts,
} from '@/shared/ui/feedback/toast-runtime';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  key: string;
}

interface ToastStore {
  toasts: ToastItem[];
  show: (message: string, type?: ToastType) => void;
  dismiss: (id: string) => void;
  dismissAll: () => void;
}

export const useToastStore = create<ToastStore>((set, get) => ({
  toasts: [],

  show: (message, type = 'info') => {
    const normalizedMessage = message.trim();
    if (!normalizedMessage) return;

    const key = buildToastKey(normalizedMessage, type);
    const activeToastId = getActiveToastId(key);
    if (activeToastId != null) {
      trackToastTimeout(activeToastId, () => {
        get().dismiss(activeToastId);
      }, 3500);
      return;
    }

    if (!canShowToast(key)) return;

    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const item: ToastItem = { id, key, message: normalizedMessage, type };
    registerActiveToast(key, id);

    set((state) => {
      const nextItems = [...state.toasts, item];
      const { nextToasts, evicted } = trimToasts(nextItems);
      for (const toast of evicted) {
        clearToastTimeout(toast.id);
        clearActiveToast(toast.key, toast.id);
      }
      return { toasts: nextToasts };
    });

    trackToastTimeout(id, () => {
      get().dismiss(id);
    }, 3500);
  },

  dismiss: (id) => set((state) => {
    const toast = state.toasts.find((item) => item.id === id);
    if (toast) {
      clearToastTimeout(id);
      clearActiveToast(toast.key, toast.id);
    }
    return { toasts: state.toasts.filter((item) => item.id !== id) };
  }),
  dismissAll: () => {
    clearAllToastTimeouts();
    for (const toast of get().toasts) {
      clearActiveToast(toast.key, toast.id);
    }
    set({ toasts: [] });
  },
}));

/**
 * دالة مساعدة للاستخدام خارج React (في stores وservices)
 */
export function showToast(message: string, type: ToastType = 'info'): void {
  useToastStore.getState().show(message, type);
}


export function resetToastStoreForTests(): void {
  resetToastRuntimeForTests();
  useToastStore.getState().dismissAll();
}
