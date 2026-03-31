const LEGACY_CACHE_PREFIXES = ['azkar-v'];
const CURRENT_SW_URL = new URL(`${import.meta.env.BASE_URL}sw.js`, window.location.origin).href;

function getRegistrationScriptUrl(registration: ServiceWorkerRegistration): string | null {
  return registration.active?.scriptURL ?? registration.waiting?.scriptURL ?? registration.installing?.scriptURL ?? null;
}

export async function clearLegacyCaches(): Promise<void> {
  if (!('caches' in window)) return;

  const cacheNames = await window.caches.keys();
  await Promise.all(
    cacheNames
      .filter((cacheName) => LEGACY_CACHE_PREFIXES.some((prefix) => cacheName.startsWith(prefix)))
      .map((cacheName) => window.caches.delete(cacheName)),
  );
}

export async function unregisterUnexpectedRegistrations(): Promise<void> {
  if (!('serviceWorker' in navigator)) return;

  const registrations = await navigator.serviceWorker.getRegistrations();
  await Promise.all(
    registrations
      .filter((registration) => getRegistrationScriptUrl(registration) !== CURRENT_SW_URL)
      .map((registration) => registration.unregister()),
  );
}

export async function initializePwaRuntime(): Promise<void> {
  if (import.meta.env.DEV) return;
  if (!('serviceWorker' in navigator)) return;

  await clearLegacyCaches();
  await unregisterUnexpectedRegistrations();

  const registration = await navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`);
  await registration.update();

  if (registration.waiting) {
    registration.waiting.postMessage({ action: 'skipWaiting' });
  }

  registration.addEventListener('updatefound', () => {
    const installing = registration.installing;
    if (!installing) return;
    installing.addEventListener('statechange', () => {
      if (installing.state === 'installed' && navigator.serviceWorker.controller) {
        registration.waiting?.postMessage({ action: 'skipWaiting' });
      }
    });
  });
}
