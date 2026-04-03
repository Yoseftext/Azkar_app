import type { NotificationSlotKey } from '@/features/notifications/domain/notification-types';

export interface NotificationTimePreset {
  label: string;
  time: string;
}

const PRESETS: Record<NotificationSlotKey, NotificationTimePreset[]> = {
  morning: [
    { label: '05:30', time: '05:30' },
    { label: '06:00', time: '06:00' },
    { label: '06:30', time: '06:30' },
  ],
  evening: [
    { label: '17:00', time: '17:00' },
    { label: '18:00', time: '18:00' },
    { label: '19:00', time: '19:00' },
  ],
  sleep: [
    { label: '21:30', time: '21:30' },
    { label: '22:00', time: '22:00' },
    { label: '22:30', time: '22:30' },
  ],
};

export function getNotificationPresets(slotKey: NotificationSlotKey): NotificationTimePreset[] {
  return PRESETS[slotKey];
}
