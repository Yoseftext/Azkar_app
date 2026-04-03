import type { NotificationSlot, NotificationSlotKey } from '@/features/notifications/domain/notification-types';
import { getLocalDateKey } from '@/shared/lib/date';

export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function getNotificationPermission(): NotificationPermission {
  return isNotificationSupported() ? Notification.permission : 'default';
}

export async function requestBrowserNotificationPermission(): Promise<boolean> {
  if (!isNotificationSupported()) return false;
  return (await Notification.requestPermission()) === 'granted';
}

export function buildCurrentMinute(): string {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

export function buildFireKey(slotKey: NotificationSlotKey, minute: string, now: Date = new Date()): string {
  const dateKey = getLocalDateKey(now);
  return `${dateKey}:${slotKey}:${minute}`;
}

export function showBrowserNotification(slot: NotificationSlot): void {
  try {
    // eslint-disable-next-line no-new
    new Notification('أذكار المسلم', {
      body: slot.message,
      icon: '/icons/icon-192x192.png',
      tag: `azkar-${slot.label}`,
    });
  } catch {
    // Ignore browser notification failures.
  }
}
