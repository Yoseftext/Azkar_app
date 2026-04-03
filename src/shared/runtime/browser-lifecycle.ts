export type Cleanup = () => void;

const RESUME_DEDUP_WINDOW_MS = 150;

function getWindow(): Window | null {
  return typeof window !== 'undefined' ? window : null;
}

function getDocument(): Document | null {
  return typeof document !== 'undefined' ? document : null;
}

export function isDocumentVisible(): boolean {
  const currentDocument = getDocument();
  if (!currentDocument) return true;
  if (typeof currentDocument.hidden === 'boolean') return !currentDocument.hidden;
  return currentDocument.visibilityState !== 'hidden';
}

export function startRuntimeInterval(callback: () => void, delayMs: number): Cleanup {
  const intervalId = globalThis.setInterval(callback, delayMs);
  return () => globalThis.clearInterval(intervalId);
}

function createResumeHandler(onResume: () => void): { handleResume: () => void; cleanup: Cleanup } {
  let isWithinDedupeWindow = false;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  const handleResume = () => {
    if (isWithinDedupeWindow) return;
    isWithinDedupeWindow = true;
    onResume();
    timeoutId = globalThis.setTimeout(() => {
      isWithinDedupeWindow = false;
      timeoutId = null;
    }, RESUME_DEDUP_WINDOW_MS);
  };

  return {
    handleResume,
    cleanup: () => {
      if (timeoutId) globalThis.clearTimeout(timeoutId);
      isWithinDedupeWindow = false;
      timeoutId = null;
    },
  };
}

export function subscribeFocusAndVisibleResume(onResume: () => void): Cleanup {
  const currentWindow = getWindow();
  const currentDocument = getDocument();
  if (!currentWindow || !currentDocument) return () => {};

  const { handleResume, cleanup } = createResumeHandler(onResume);
  const onVisibilityChange = () => {
    if (isDocumentVisible()) handleResume();
  };

  currentWindow.addEventListener('focus', handleResume);
  currentDocument.addEventListener('visibilitychange', onVisibilityChange);

  return () => {
    currentWindow.removeEventListener('focus', handleResume);
    currentDocument.removeEventListener('visibilitychange', onVisibilityChange);
    cleanup();
  };
}

export function subscribeOnlineOffline(onOnline: () => void, onOffline: () => void): Cleanup {
  const currentWindow = getWindow();
  if (!currentWindow) return () => {};

  currentWindow.addEventListener('online', onOnline);
  currentWindow.addEventListener('offline', onOffline);

  return () => {
    currentWindow.removeEventListener('online', onOnline);
    currentWindow.removeEventListener('offline', onOffline);
  };
}
