import { getLocalDateKey } from '@/shared/lib/date';
import { isDocumentVisible } from '@/shared/runtime/browser-lifecycle';

export interface DayTransitionRuntime {
  checkForNewDay(): boolean;
  flushPendingAnnouncement(): boolean;
  hasPendingAnnouncement(): boolean;
  getLastObservedDateKey(): string;
}

export function createDayTransitionRuntime(
  getDateKey: () => string = getLocalDateKey,
  isVisible: () => boolean = isDocumentVisible,
): DayTransitionRuntime {
  let lastObservedDateKey = getDateKey();
  let pendingAnnouncementDateKey: string | null = null;

  return {
    checkForNewDay(): boolean {
      const today = getDateKey();
      if (today === lastObservedDateKey) return false;
      lastObservedDateKey = today;
      if (!isVisible()) {
        pendingAnnouncementDateKey = today;
        return false;
      }
      pendingAnnouncementDateKey = null;
      return true;
    },
    flushPendingAnnouncement(): boolean {
      if (!pendingAnnouncementDateKey || !isVisible()) return false;
      pendingAnnouncementDateKey = null;
      return true;
    },
    hasPendingAnnouncement(): boolean {
      return Boolean(pendingAnnouncementDateKey);
    },
    getLastObservedDateKey(): string {
      return lastObservedDateKey;
    },
  };
}
