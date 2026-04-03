import { useCallback, useState } from 'react';
import { LocalStorageEngine } from '@/kernel/storage/local-storage-engine';

const storage = new LocalStorageEngine();
const HOME_ONBOARDING_STORAGE_KEY = 'azkar-next.home-onboarding-dismissed';

function readDismissed(): boolean {
  return storage.getItem<boolean>(HOME_ONBOARDING_STORAGE_KEY) === true;
}

export function useHomeOnboarding() {
  const [dismissed, setDismissed] = useState<boolean>(() => readDismissed());

  const dismiss = useCallback(() => {
    storage.setItem(HOME_ONBOARDING_STORAGE_KEY, true);
    setDismissed(true);
  }, []);

  return {
    dismissed,
    dismiss,
  };
}
