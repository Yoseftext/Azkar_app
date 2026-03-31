import './helpers/environment.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import { STORAGE_KEYS } from '@/kernel/storage/storage-keys';
import { useNamesOfAllahStore } from '@/features/names-of-allah/state/names-store';

function resetStore() {
  useNamesOfAllahStore.setState({
    isInitialized: false,
    isLoading: false,
    error: null,
    items: [],
    searchQuery: '',
    selectedNameId: null,
    completedByDate: {},
    favoriteIds: [],
    recentNameIds: [],
  });
}

test('names store initializes persisted values and restores a valid selected item on load', async () => {
  resetStore();
  window.localStorage.setItem(
    STORAGE_KEYS.names,
    JSON.stringify({
      searchQuery: 'رحمن',
      selectedNameId: 'missing-name',
      completedByDate: {
        '2026-03-31': ['allah-name-1', 'allah-name-1'],
      },
      favoriteIds: ['allah-name-1', 'allah-name-1', 'allah-name-2'],
      recentNameIds: ['allah-name-1', 'allah-name-1', 'allah-name-2'],
    }),
  );

  useNamesOfAllahStore.getState().initialize();
  await useNamesOfAllahStore.getState().ensureLoaded();
  const state = useNamesOfAllahStore.getState();

  assert.equal(state.searchQuery, 'رحمن');
  assert.deepEqual(state.completedByDate, { '2026-03-31': ['allah-name-1'] });
  assert.deepEqual(state.favoriteIds, ['allah-name-1', 'allah-name-2']);
  assert.deepEqual(state.recentNameIds, ['allah-name-1', 'allah-name-2']);
  assert.equal(state.selectedNameId, state.items[0]?.id ?? null);
});

test('names store updates visible selection, favorites, and daily completion', async () => {
  resetStore();
  useNamesOfAllahStore.getState().initialize();
  await useNamesOfAllahStore.getState().ensureLoaded();

  const targetName = useNamesOfAllahStore.getState().items.find((item) => item.name.includes('الرحمن')) ?? useNamesOfAllahStore.getState().items[0];
  useNamesOfAllahStore.getState().setSearchQuery(targetName.name);
  useNamesOfAllahStore.getState().setSelectedName(targetName.id);
  useNamesOfAllahStore.getState().toggleFavorite(targetName.id);
  useNamesOfAllahStore.getState().toggleCompleted(targetName.id);

  let state = useNamesOfAllahStore.getState();
  assert.equal(state.selectedNameId, targetName.id);
  assert.equal(state.recentNameIds[0], targetName.id);
  assert.deepEqual(state.favoriteIds, [targetName.id]);
  assert.deepEqual(state.completedByDate['2026-03-31'], [targetName.id]);

  useNamesOfAllahStore.getState().resetTodayProgress();
  state = useNamesOfAllahStore.getState();
  assert.deepEqual(state.completedByDate['2026-03-31'], []);
});
