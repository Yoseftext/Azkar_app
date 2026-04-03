/**
 * ====================================================================
 * Notifications Store — متجر إشعارات الأذكار
 * ====================================================================
 * مُقسّم حسب المسؤوليات:
 *   - notification-types: العقود والثوابت
 *   - notification-runtime: حدود Web Notifications API
 *   - notifications-persistence: التطبيع والحفظ
 *   - notifications-store: orchestration فقط
 * ====================================================================
 */
import { create } from 'zustand';
import {
  FALLBACK_NOTIFICATIONS_STATE,
  type NotificationsStore,
  type NotificationSlot,
  type NotificationSlotKey,
} from '@/features/notifications/domain/notification-types';
import {
  buildCurrentMinute,
  getNotificationPermission,
  isNotificationSupported,
  requestBrowserNotificationPermission,
  showBrowserNotification,
} from '@/features/notifications/runtime/notification-runtime';
import { shouldFireNotification, resetNotificationFireRegistryForTests } from '@/features/notifications/runtime/notification-fire-registry';
import { loadPersistedNotificationsState, persistNotificationsState } from '@/features/notifications/state/notifications-persistence';
import { showToast } from '@/shared/ui/feedback/toast-store';

export type { NotificationSlot, NotificationSlotKey, NotificationsState } from '@/features/notifications/domain/notification-types';

function persistStoreState(state: NotificationsStore): void {
  persistNotificationsState(state);
}

export const useNotificationsStore = create<NotificationsStore>((set, get) => ({
  ...FALLBACK_NOTIFICATIONS_STATE,

  initialize: async () => {
    if (get().isInitialized) return;
    if (!isNotificationSupported()) {
      set({ isInitialized: true, hasPermission: false });
      return;
    }

    const persisted = loadPersistedNotificationsState();
    set({
      ...persisted,
      isInitialized: true,
      hasPermission: getNotificationPermission() === 'granted',
    });
  },

  requestPermission: async () => {
    const granted = await requestBrowserNotificationPermission();
    set({ hasPermission: granted });
    return granted;
  },

  updateSlot: (key, patch) => {
    const currentState = get();
    const nextSlot: NotificationSlot = { ...currentState[key], ...patch };
    const nextState = { ...currentState, [key]: nextSlot };
    persistStoreState(nextState);
    set({ [key]: nextSlot });
    showToast('تم حفظ إعدادات التنبيه 🔔', 'success');
  },

  checkAndFire: () => {
    const currentState = get();
    if (!currentState.hasPermission) return;

    const minute = buildCurrentMinute();
    const slots: Array<[NotificationSlotKey, NotificationSlot]> = [
      ['morning', currentState.morning],
      ['evening', currentState.evening],
      ['sleep', currentState.sleep],
    ];

    for (const [slotKey, slot] of slots) {
      if (!slot.enabled || slot.time !== minute) continue;

      if (!shouldFireNotification(slotKey, minute)) continue;
      showBrowserNotification(slot);
    }
  },
}));


export function resetNotificationsStoreForTests(): void {
  resetNotificationFireRegistryForTests();
  useNotificationsStore.setState({ ...FALLBACK_NOTIFICATIONS_STATE, initialize: useNotificationsStore.getState().initialize, requestPermission: useNotificationsStore.getState().requestPermission, updateSlot: useNotificationsStore.getState().updateSlot, checkAndFire: useNotificationsStore.getState().checkAndFire }, true);
}
