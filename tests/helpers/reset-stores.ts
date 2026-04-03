import { useAuthStore } from '@/kernel/auth/auth-store';
import { usePreferencesStore } from '@/kernel/preferences/preferences-store';
import { useTasksStore } from '@/features/tasks/state/tasks-store';
import { useMasbahaStore, resetMasbahaStoreRuntimeForTests } from '@/features/masbaha/state/masbaha-store';
import { useQuranStore } from '@/features/quran/state/quran-store';
import { useAzkarStore } from '@/features/azkar/state/azkar-store';
import { useDuasStore } from '@/features/duas/state/duas-store';
import { useStoriesStore } from '@/features/stories/state/stories-store';
import { useNamesOfAllahStore } from '@/features/names-of-allah/state/names-store';
import { useNotificationsStore } from '@/features/notifications/state/notifications-store';
import { resetNotificationFireRegistryForTests } from '@/features/notifications/runtime/notification-fire-registry';
import { usePlansStore, resetPlansStoreForTests } from '@/features/plans/state/plans-store';
import { useToastStore, resetToastStoreForTests } from '@/shared/ui/feedback/toast-store';

const initialAuthState = { ...useAuthStore.getState() };
const initialPreferencesState = { ...usePreferencesStore.getState() };
const initialTasksState = { ...useTasksStore.getState() };
const initialMasbahaState = { ...useMasbahaStore.getState() };
const initialQuranState = { ...useQuranStore.getState() };
const initialAzkarState = { ...useAzkarStore.getState() };
const initialDuasState = { ...useDuasStore.getState() };
const initialStoriesState = { ...useStoriesStore.getState() };
const initialNamesState = { ...useNamesOfAllahStore.getState() };
const initialNotificationsState = { ...useNotificationsStore.getState() };
const initialPlansState = { ...usePlansStore.getState() };
const initialToastState = { ...useToastStore.getState() };

export function resetAllStores() {
  useAuthStore.setState({ ...initialAuthState }, true);
  usePreferencesStore.setState({ ...initialPreferencesState }, true);
  useTasksStore.setState({ ...initialTasksState }, true);
  resetMasbahaStoreRuntimeForTests();
  useMasbahaStore.setState({ ...initialMasbahaState }, true);
  useQuranStore.setState({ ...initialQuranState }, true);
  useAzkarStore.setState({ ...initialAzkarState }, true);
  useDuasStore.setState({ ...initialDuasState }, true);
  useStoriesStore.setState({ ...initialStoriesState }, true);
  useNamesOfAllahStore.setState({ ...initialNamesState }, true);
  resetNotificationFireRegistryForTests();
  useNotificationsStore.setState({ ...initialNotificationsState }, true);
  resetPlansStoreForTests();
  usePlansStore.setState({ ...initialPlansState }, true);
  resetToastStoreForTests();
  useToastStore.setState({ ...initialToastState }, true);
}
