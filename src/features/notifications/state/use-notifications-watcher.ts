/**
 * ====================================================================
 * useNotificationsWatcher — مراقب وقت الإشعارات
 * ====================================================================
 * checks every minute + on focus/visibility resume to reduce missed fires.
 * ====================================================================
 */
import { useEffect } from 'react';
import { useNotificationsStore } from '@/features/notifications/state/notifications-store';
import { startRuntimeInterval, subscribeFocusAndVisibleResume } from '@/shared/runtime/browser-lifecycle';

export function useNotificationsWatcher(): void {
  const checkAndFire = useNotificationsStore((state) => state.checkAndFire);

  useEffect(() => {
    const runCheck = () => checkAndFire();
    const stopInterval = startRuntimeInterval(runCheck, 60_000);
    const unsubscribeResume = subscribeFocusAndVisibleResume(runCheck);

    runCheck();

    return () => {
      stopInterval();
      unsubscribeResume();
    };
  }, [checkAndFire]);
}
