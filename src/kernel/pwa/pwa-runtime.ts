/**
 * ====================================================================
 * PWA Runtime — إدارة Service Worker والتحديثات
 * ====================================================================
 * مُقسّم حسب المسؤوليات:
 *   - pwa-browser: حدود المتصفح و Service Worker APIs
 *   - pwa-update-state: حالة التحديث المعلّق وإشعار الواجهة
 *   - pwa-runtime: orchestration فقط
 * ====================================================================
 */
import {
  addServiceWorkerControllerChangeListener,
  getCacheStorage,
  getCurrentServiceWorkerUrl,
  getServiceWorkerController,
  getServiceWorkerRegistrations,
  hasServiceWorkerSupport,
  registerCurrentServiceWorker,
  reloadPage,
  waitForPageLoad,
} from '@/kernel/pwa/pwa-browser';
import { applyPendingWorkerUpdate, markPendingWorker, setUpdateAvailableListener } from '@/kernel/pwa/pwa-update-state';

const LEGACY_CACHE_PREFIXES = ['azkar-v'];

export function onUpdateAvailable(callback: () => void): void {
  setUpdateAvailableListener(callback);
}

export function applyPendingUpdate(): void {
  applyPendingWorkerUpdate();
}

export async function clearLegacyCaches(): Promise<void> {
  const cacheStorage = getCacheStorage();
  if (!cacheStorage) return;

  const cacheNames = await cacheStorage.keys();
  await Promise.all(
    cacheNames
      .filter((name) => LEGACY_CACHE_PREFIXES.some((prefix) => name.startsWith(prefix)))
      .map((name) => cacheStorage.delete(name)),
  );
}

function shouldUnregisterRegistration(registration: ServiceWorkerRegistration, currentSwUrl: string | null): boolean {
  const scriptUrl = registration.active?.scriptURL ?? registration.waiting?.scriptURL ?? registration.installing?.scriptURL ?? null;
  if (!scriptUrl) return true;
  return scriptUrl !== currentSwUrl;
}

export async function unregisterUnexpectedRegistrations(): Promise<void> {
  if (!hasServiceWorkerSupport()) return;

  const currentSwUrl = getCurrentServiceWorkerUrl();
  const registrations = await getServiceWorkerRegistrations();

  await Promise.all(
    registrations
      .filter((registration) => shouldUnregisterRegistration(registration, currentSwUrl))
      .map((registration) => registration.unregister()),
  );
}

function wireUpdateLifecycle(registration: ServiceWorkerRegistration): void {
  if (registration.waiting) {
    markPendingWorker(registration.waiting);
  }

  registration.addEventListener('updatefound', () => {
    const installing = registration.installing;
    if (!installing) return;

    installing.addEventListener('statechange', () => {
      if (installing.state === 'installed' && getServiceWorkerController()) {
        markPendingWorker(installing);
      }
    });
  });
}

function wireControllerRefresh(): void {
  let isRefreshing = false;
  addServiceWorkerControllerChangeListener(() => {
    if (isRefreshing) return;
    isRefreshing = true;
    reloadPage();
  });
}

export async function initializePwaRuntime(): Promise<void> {
  if (import.meta.env.DEV) return;
  if (!hasServiceWorkerSupport()) return;

  await waitForPageLoad();
  await clearLegacyCaches();
  await unregisterUnexpectedRegistrations();

  let registration: ServiceWorkerRegistration;
  try {
    registration = await registerCurrentServiceWorker();
  } catch (error) {
    console.error('[PWA] Service Worker registration failed:', error);
    return;
  }

  wireUpdateLifecycle(registration);
  wireControllerRefresh();
  await registration.update();
}
