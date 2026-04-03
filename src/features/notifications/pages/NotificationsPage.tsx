import { NotificationPermissionCard } from '@/features/notifications/components/NotificationPermissionCard';
import { NotificationSlotCard } from '@/features/notifications/components/NotificationSlotCard';
import { useNotificationsStore } from '@/features/notifications/state/notifications-store';
import { isNotificationSupported } from '@/features/notifications/runtime/notification-runtime';
import type { NotificationSlot } from '@/features/notifications/domain/notification-types';

type SlotKey = 'morning' | 'evening' | 'sleep';

const SLOT_KEYS: SlotKey[] = ['morning', 'evening', 'sleep'];

export function NotificationsPage() {
  const hasPermission = useNotificationsStore((state) => state.hasPermission);
  const requestPermission = useNotificationsStore((state) => state.requestPermission);
  const updateSlot = useNotificationsStore((state) => state.updateSlot);
  const morning = useNotificationsStore((state) => state.morning);
  const evening = useNotificationsStore((state) => state.evening);
  const sleep = useNotificationsStore((state) => state.sleep);

  const slots: Record<SlotKey, NotificationSlot> = { morning, evening, sleep };

  return (
    <div className="space-y-4">
      <NotificationPermissionCard
        hasPermission={hasPermission}
        isSupported={isNotificationSupported()}
        onRequestPermission={() => requestPermission()}
      />

      {SLOT_KEYS.map((slotKey) => (
        <NotificationSlotCard
          key={slotKey}
          slotKey={slotKey}
          slot={slots[slotKey]}
          hasPermission={hasPermission}
          onToggle={() => updateSlot(slotKey, { enabled: !slots[slotKey].enabled })}
          onTimeChange={(time) => updateSlot(slotKey, { time })}
        />
      ))}
    </div>
  );
}
