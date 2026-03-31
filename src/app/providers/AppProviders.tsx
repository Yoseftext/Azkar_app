import { useEffect } from 'react';
import { HashRouter } from 'react-router-dom';
import { AppRouter } from '@/app/router/AppRouter';
import { usePreferencesStore } from '@/kernel/preferences/preferences-store';
import { useAuthStore } from '@/kernel/auth/auth-store';
import { useTasksStore } from '@/features/tasks/state/tasks-store';
import { useMasbahaStore } from '@/features/masbaha/state/masbaha-store';
import { useQuranStore } from '@/features/quran/state/quran-store';
import { useAzkarStore } from '@/features/azkar/state/azkar-store';
import { useDuasStore } from '@/features/duas/state/duas-store';
import { useStoriesStore } from '@/features/stories/state/stories-store';
import { useNamesOfAllahStore } from '@/features/names-of-allah/state/names-store';

export function AppProviders() {
  const initializePreferences = usePreferencesStore((state) => state.initialize);
  const initializeAuth = useAuthStore((state) => state.initialize);
  const initializeTasks = useTasksStore((state) => state.initialize);
  const initializeMasbaha = useMasbahaStore((state) => state.initialize);
  const initializeQuran = useQuranStore((state) => state.initialize);
  const initializeAzkar = useAzkarStore((state) => state.initialize);
  const initializeDuas = useDuasStore((state) => state.initialize);
  const initializeStories = useStoriesStore((state) => state.initialize);
  const initializeNames = useNamesOfAllahStore((state) => state.initialize);

  useEffect(() => {
    initializePreferences();
    initializeAuth();
    initializeTasks();
    initializeMasbaha();
    initializeQuran();
    initializeAzkar();
    initializeDuas();
    initializeStories();
    initializeNames();
  }, [initializeAuth, initializeAzkar, initializeDuas, initializeMasbaha, initializeNames, initializePreferences, initializeQuran, initializeStories, initializeTasks]);

  return (
    <HashRouter>
      <AppRouter />
    </HashRouter>
  );
}
