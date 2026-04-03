export interface ServiceWorkerLikeRegistration {
  active?: ServiceWorker | null;
  waiting?: ServiceWorker | null;
  installing?: ServiceWorker | null;
  update: () => Promise<void>;
  unregister?: () => Promise<boolean>;
  addEventListener: (eventName: string, listener: EventListenerOrEventListenerObject) => void;
}

export function getWindowRef(): Window | null {
  return typeof window === 'undefined' ? null : window;
}

export function getNavigatorRef(): Navigator | null {
  return typeof navigator === 'undefined' ? null : navigator;
}

export function getDocumentRef(): Document | null {
  return typeof document === 'undefined' ? null : document;
}

export function getCacheStorage(): CacheStorage | null {
  const currentWindow = getWindowRef();
  if (!currentWindow || !('caches' in currentWindow)) return null;
  return currentWindow.caches;
}

export function hasServiceWorkerSupport(): boolean {
  const currentNavigator = getNavigatorRef();
  return Boolean(currentNavigator && 'serviceWorker' in currentNavigator);
}

export function getCurrentServiceWorkerUrl(): string | null {
  const currentWindow = getWindowRef();
  if (!currentWindow) return null;
  return new URL(`${import.meta.env.BASE_URL}sw.js`, currentWindow.location.origin).href;
}

export function getServiceWorkerController(): ServiceWorker | undefined {
  return hasServiceWorkerSupport() ? navigator.serviceWorker.controller ?? undefined : undefined;
}

export async function getServiceWorkerRegistrations(): Promise<readonly ServiceWorkerRegistration[]> {
  if (!hasServiceWorkerSupport()) return [];
  return navigator.serviceWorker.getRegistrations();
}

export async function registerCurrentServiceWorker(): Promise<ServiceWorkerRegistration> {
  return navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`);
}

export function addServiceWorkerControllerChangeListener(listener: () => void): void {
  if (!hasServiceWorkerSupport()) return;
  navigator.serviceWorker.addEventListener('controllerchange', listener);
}

export function reloadPage(): void {
  getWindowRef()?.location.reload();
}

export async function waitForPageLoad(): Promise<void> {
  const currentDocument = getDocumentRef();
  const currentWindow = getWindowRef();
  if (!currentWindow || !currentDocument || currentDocument.readyState === 'complete') return;

  await new Promise<void>((resolve) => {
    currentWindow.addEventListener('load', () => resolve(), { once: true });
  });
}
