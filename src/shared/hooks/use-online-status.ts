/**
 * ====================================================================
 * useOnlineStatus — مراقب حالة الاتصال
 * ====================================================================
 * MISSING-02: المستخدم لم يكن يعلم إذا كان التطبيق offline.
 *
 * - يُظهر toast عند الانقطاع وعند الاستعادة
 * - يُستدعى مرة واحدة من AppProviders
 * ====================================================================
 */
import { useEffect } from 'react';
import { subscribeOnlineOffline } from '@/shared/runtime/browser-lifecycle';
import { createOnlineStatusTransitionGuard } from '@/shared/runtime/online-status-runtime';
import { showToast } from '@/shared/ui/feedback/toast-store';

export function useOnlineStatus(): void {
  useEffect(() => {
    const transitions = createOnlineStatusTransitionGuard(
      () => {
        showToast('عاد الاتصال بالإنترنت ✅', 'success');
      },
      () => {
        showToast('أنت غير متصل بالإنترنت — التطبيق يعمل محلياً 📴', 'warning');
      },
    );

    return subscribeOnlineOffline(transitions.handleOnline, transitions.handleOffline);
  }, []);
}
