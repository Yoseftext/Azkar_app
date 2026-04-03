export type ConnectivityState = 'online' | 'offline';

export function readNavigatorOnlineStatus(): boolean {
  if (typeof navigator === 'undefined') return true;
  return typeof navigator.onLine === 'boolean' ? navigator.onLine : true;
}

export function createOnlineStatusTransitionGuard(
  onOnline: () => void,
  onOffline: () => void,
  initialOnline: boolean = readNavigatorOnlineStatus(),
) {
  let isOnline = initialOnline;

  return {
    getCurrentState(): ConnectivityState {
      return isOnline ? 'online' : 'offline';
    },

    handleOnline(): void {
      if (isOnline) return;
      isOnline = true;
      onOnline();
    },

    handleOffline(): void {
      if (!isOnline) return;
      isOnline = false;
      onOffline();
    },
  };
}
