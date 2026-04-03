/**
 * ====================================================================
 * useDayWatcher — مراقب اليوم الجديد
 * ====================================================================
 * المسؤوليات:
 * - يفحص كل دقيقة إذا تغيّر التاريخ
 * - يفحص أيضاً عند إعادة فتح التطبيق (visibilitychange + focus)
 * - يُظهر toast للمستخدم عند بدء يوم جديد
 *
 * لا يُعيد تعيين بيانات الـ stores —
 * الـ stores تعتمد على date keys فكل يوم له مفتاحه الخاص.
 * ====================================================================
 */
import { useEffect } from 'react';
import { startRuntimeInterval, subscribeFocusAndVisibleResume } from '@/shared/runtime/browser-lifecycle';
import { showToast } from '@/shared/ui/feedback/toast-store';
import { createDayTransitionRuntime } from '@/kernel/day-watcher/day-transition-runtime';

export function useDayWatcher(): void {
  useEffect(() => {
    const runtime = createDayTransitionRuntime();

    function announceNewDay(): void {
      showToast('بدأ يوم جديد — وُفِّقت لخير 🌅', 'info');
    }

    function check(): void {
      if (runtime.checkForNewDay()) announceNewDay();
    }

    function handleResume(): void {
      if (runtime.flushPendingAnnouncement()) {
        announceNewDay();
        return;
      }
      check();
    }

    const stopInterval = startRuntimeInterval(check, 60_000);
    const unsubscribeResume = subscribeFocusAndVisibleResume(handleResume);

    return () => {
      stopInterval();
      unsubscribeResume();
    };
  }, []);
}
