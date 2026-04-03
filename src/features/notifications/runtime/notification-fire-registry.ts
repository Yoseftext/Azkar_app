import type { NotificationSlotKey } from '@/features/notifications/domain/notification-types';
import { buildFireKey } from '@/features/notifications/runtime/notification-runtime';
import { getLocalDateKey } from '@/shared/lib/date';

const firedKeys = new Set<string>();
let activeDateKey = getLocalDateKey();

function syncRegistryDate(now: Date): void {
  const currentDateKey = getLocalDateKey(now);
  if (currentDateKey === activeDateKey) return;
  activeDateKey = currentDateKey;
  firedKeys.clear();
}

export function shouldFireNotification(slotKey: NotificationSlotKey, minute: string, now: Date = new Date()): boolean {
  syncRegistryDate(now);
  const fireKey = buildFireKey(slotKey, minute, now);
  if (firedKeys.has(fireKey)) return false;
  firedKeys.add(fireKey);
  return true;
}

export function resetNotificationFireRegistryForTests(now: Date = new Date()): void {
  activeDateKey = getLocalDateKey(now);
  firedKeys.clear();
}
