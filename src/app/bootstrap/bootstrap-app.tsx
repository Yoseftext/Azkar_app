/**
 * ====================================================================
 * bootstrap-app — نقطة دخول التطبيق
 * ====================================================================
 * إصلاح BUG-V3-01:
 *   initializePwaRuntime كانت تُستدعى خارج دورة React قبل اكتمال DOM.
 *   الآن تُستدعى داخل AppProviders بعد اكتمال التهيئة.
 * ====================================================================
 */
import type * as ReactNamespace from 'react';
import type * as ReactDOMNamespace from 'react-dom/client';
import { AppProviders } from '@/app/providers/AppProviders';
import { migrateLegacyData } from '@/kernel/storage/migrate-legacy';

export function bootstrapApp(
  React: typeof ReactNamespace,
  ReactDOM: typeof ReactDOMNamespace,
): void {
  const rootElement = document.getElementById('root');

  if (!rootElement) {
    throw new Error('Root element #root was not found.');
  }

  // BUG-V3-08: ترحيل بيانات V2 قبل أي store initialization
  migrateLegacyData();

  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <AppProviders />
    </React.StrictMode>,
  );
}
