import { LocalStorageEngine } from '@/kernel/storage/local-storage-engine';
import { STORAGE_KEYS } from '@/kernel/storage/storage-keys';
import {
  DEFAULT_NOTIFICATION_SLOTS,
  FALLBACK_NOTIFICATIONS_STATE,
  type NotificationSlot,
  type NotificationsState,
} from '@/features/notifications/domain/notification-types';

const storage = new LocalStorageEngine();

export function normalizeNotificationSlot(raw: Partial<NotificationSlot> | undefined, defaults: NotificationSlot): NotificationSlot {
  if (!raw) return defaults;
  return {
    enabled: Boolean(raw.enabled),
    time: typeof raw.time === 'string' && /^\d{2}:\d{2}$/.test(raw.time) ? raw.time : defaults.time,
    label: defaults.label,
    message: defaults.message,
  };
}

export function loadPersistedNotificationsState(): NotificationsState {
  const stored = storage.getItem<Partial<NotificationsState>>(STORAGE_KEYS.notifications);
  return {
    ...FALLBACK_NOTIFICATIONS_STATE,
    morning: normalizeNotificationSlot(stored?.morning, DEFAULT_NOTIFICATION_SLOTS.morning),
    evening: normalizeNotificationSlot(stored?.evening, DEFAULT_NOTIFICATION_SLOTS.evening),
    sleep: normalizeNotificationSlot(stored?.sleep, DEFAULT_NOTIFICATION_SLOTS.sleep),
  };
}

export function persistNotificationsState(state: NotificationsState): void {
  storage.setItem(STORAGE_KEYS.notifications, {
    morning: state.morning,
    evening: state.evening,
    sleep: state.sleep,
  });
}
