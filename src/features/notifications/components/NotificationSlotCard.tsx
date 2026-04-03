import { AppCard } from '@/shared/ui/primitives/AppCard';
import { AppChip } from '@/shared/ui/primitives/AppChip';
import type { NotificationSlot, NotificationSlotKey } from '@/features/notifications/domain/notification-types';
import { getNotificationPresets } from '@/features/notifications/domain/notification-presets';

interface NotificationSlotCardProps {
  slotKey: NotificationSlotKey;
  slot: NotificationSlot;
  hasPermission: boolean;
  onToggle: () => void;
  onTimeChange: (time: string) => void;
}

export function NotificationSlotCard({ slotKey, slot, hasPermission, onToggle, onTimeChange }: NotificationSlotCardProps) {
  const presets = getNotificationPresets(slotKey);

  return (
    <AppCard key={slotKey} title={slot.label} subtitle="يمكنك تفعيل التنبيه واختيار وقت جاهز أو ضبط وقت مخصص.">
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3 rounded-[28px] bg-slate-50 px-4 py-3 dark:bg-slate-800/70">
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">تفعيل التنبيه</p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{slot.enabled ? `مفعّل عند ${slot.time}` : 'غير مفعّل حاليًا'}</p>
          </div>
          <button
            type="button"
            disabled={!hasPermission}
            onClick={onToggle}
            className={[
              'relative h-6 w-11 rounded-full transition-colors',
              slot.enabled ? 'bg-[var(--ui-primary-solid)]' : 'bg-slate-300 dark:bg-slate-600',
              !hasPermission ? 'cursor-not-allowed opacity-40' : '',
            ].join(' ')}
            aria-checked={slot.enabled}
            role="switch"
            aria-label={`تفعيل تنبيه ${slot.label}`}
          >
            <span
              className={[
                'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform',
                slot.enabled ? 'translate-x-5' : 'translate-x-0.5',
              ].join(' ')}
            />
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {presets.map((preset) => (
            <AppChip
              key={preset.time}
              variant={slot.time === preset.time ? 'active' : 'neutral'}
              disabled={!hasPermission || !slot.enabled}
              onClick={() => onTimeChange(preset.time)}
              aria-label={`ضبط ${slot.label} على ${preset.label}`}
            >
              {preset.label}
            </AppChip>
          ))}
        </div>

        {slot.enabled ? (
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300" htmlFor={`notification-${slotKey}`}>
              وقت مخصص
            </label>
            <input
              id={`notification-${slotKey}`}
              type="time"
              value={slot.time}
              onChange={(event) => onTimeChange(event.target.value)}
              className="w-full rounded-[var(--ui-radius-control)] border border-slate-200 bg-white px-4 py-[var(--ui-control-padding-y)] text-sm outline-none transition focus:border-[color:var(--ui-primary-solid)] focus:ring-2 focus:ring-[color:var(--ui-primary-ring)] dark:border-slate-700 dark:bg-slate-900"
              disabled={!hasPermission}
            />
          </div>
        ) : null}
      </div>
    </AppCard>
  );
}
