import { useAuthStore } from '@/kernel/auth/auth-store';
import { usePreferencesStore } from '@/kernel/preferences/preferences-store';
import { useTasksStore } from '@/features/tasks/state/tasks-store';
import { useMasbahaStore } from '@/features/masbaha/state/masbaha-store';
import { useQuranStore } from '@/features/quran/state/quran-store';
import { useAzkarStore } from '@/features/azkar/state/azkar-store';
import { useDuasStore } from '@/features/duas/state/duas-store';
import { useStoriesStore } from '@/features/stories/state/stories-store';
import { useNamesOfAllahStore } from '@/features/names-of-allah/state/names-store';

const initialAuthState = { ...useAuthStore.getState() };
const initialPreferencesState = { ...usePreferencesStore.getState() };
const initialTasksState = { ...useTasksStore.getState() };
const initialMasbahaState = { ...useMasbahaStore.getState() };
const initialQuranState = { ...useQuranStore.getState() };
const initialAzkarState = { ...useAzkarStore.getState() };
const initialDuasState = { ...useDuasStore.getState() };
const initialStoriesState = { ...useStoriesStore.getState() };
const initialNamesState = { ...useNamesOfAllahStore.getState() };

export function resetAllStores() {
  useAuthStore.setState({ ...initialAuthState }, true);
  usePreferencesStore.setState({ ...initialPreferencesState }, true);
  useTasksStore.setState({ ...initialTasksState }, true);
  useMasbahaStore.setState({ ...initialMasbahaState }, true);
  useQuranStore.setState({ ...initialQuranState }, true);
  useAzkarStore.setState({ ...initialAzkarState }, true);
  useDuasStore.setState({ ...initialDuasState }, true);
  useStoriesStore.setState({ ...initialStoriesState }, true);
  useNamesOfAllahStore.setState({ ...initialNamesState }, true);
}
