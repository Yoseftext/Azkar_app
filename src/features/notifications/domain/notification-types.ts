export interface NotificationSlot {
  enabled: boolean;
  time: string;
  label: string;
  message: string;
}

export interface NotificationsState {
  isInitialized: boolean;
  hasPermission: boolean;
  morning: NotificationSlot;
  evening: NotificationSlot;
  sleep: NotificationSlot;
}

export type NotificationSlotKey = 'morning' | 'evening' | 'sleep';

export interface NotificationsStore extends NotificationsState {
  initialize: () => Promise<void>;
  requestPermission: () => Promise<boolean>;
  updateSlot: (key: NotificationSlotKey, patch: Partial<NotificationSlot>) => void;
  checkAndFire: () => void;
}

export const DEFAULT_NOTIFICATION_SLOTS: Record<NotificationSlotKey, NotificationSlot> = {
  morning: { enabled: false, time: '06:00', label: 'أذكار الصباح', message: 'حان وقت أذكار الصباح ☀️' },
  evening: { enabled: false, time: '16:00', label: 'أذكار المساء', message: 'حان وقت أذكار المساء 🌙' },
  sleep: { enabled: false, time: '21:00', label: 'أذكار النوم', message: 'لا تنسَ أذكار النوم 😴' },
};

export const FALLBACK_NOTIFICATIONS_STATE: NotificationsState = {
  isInitialized: false,
  hasPermission: false,
  ...DEFAULT_NOTIFICATION_SLOTS,
};
