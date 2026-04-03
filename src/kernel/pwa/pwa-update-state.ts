let pendingWorker: ServiceWorker | null = null;
let onUpdateAvailableCallback: (() => void) | null = null;

export function setUpdateAvailableListener(callback: () => void): void {
  onUpdateAvailableCallback = callback;
}

export function markPendingWorker(worker: ServiceWorker): void {
  pendingWorker = worker;
  onUpdateAvailableCallback?.();
}

export function applyPendingWorkerUpdate(): void {
  if (!pendingWorker) return;
  pendingWorker.postMessage({ action: 'skipWaiting' });
  pendingWorker = null;
}

export function resetPendingWorkerState(): void {
  pendingWorker = null;
  onUpdateAvailableCallback = null;
}
