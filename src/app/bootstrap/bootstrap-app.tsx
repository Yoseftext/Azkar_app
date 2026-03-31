import type * as ReactNamespace from 'react';
import type * as ReactDOMNamespace from 'react-dom/client';
import { AppProviders } from '@/app/providers/AppProviders';
import { initializePwaRuntime } from '@/kernel/pwa/pwa-runtime';

export function bootstrapApp(
  React: typeof ReactNamespace,
  ReactDOM: typeof ReactDOMNamespace,
): void {
  const rootElement = document.getElementById('root');

  if (!rootElement) {
    throw new Error('Root element #root was not found.');
  }

  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <AppProviders />
    </React.StrictMode>,
  );
}

void initializePwaRuntime();
