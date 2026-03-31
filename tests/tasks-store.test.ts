import './helpers/environment.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import { STORAGE_KEYS } from '@/kernel/storage/storage-keys';
import { useTasksStore } from '@/features/tasks/state/tasks-store';

function resetStore() {
  useTasksStore.setState({
    items: [
      { id: 'wird-morning', title: 'أذكار الصباح', completed: false, group: 'wird', isDefault: true },
      { id: 'wird-evening', title: 'أذكار المساء', completed: false, group: 'wird', isDefault: true },
      { id: 'wird-masbaha', title: 'تسبيح 100 مرة', completed: false, group: 'wird', isDefault: true },
      { id: 'wird-quran', title: 'قراءة ورد القرآن', completed: false, group: 'wird', isDefault: true },
    ],
    dailyCompletions: {},
    lastDailyResetKey: '2026-03-31',
    isInitialized: false,
    activeGroup: 'wird',
  });
}

test('tasks initialize merges defaults with persisted personal tasks and resets stale day state', () => {
  resetStore();
  window.localStorage.setItem(STORAGE_KEYS.tasks, JSON.stringify({
    items: [
      { id: 'wird-morning', title: 'قديم', completed: true, group: 'wird', isDefault: true },
      { id: 'personal-1', title: 'مهمة شخصية', completed: true, group: 'personal', isDefault: false },
    ],
    dailyCompletions: {
      '2026-03-30': ['wird-morning', 'personal-1'],
    },
    lastDailyResetKey: '2026-03-30',
  }));

  useTasksStore.getState().initialize();
  const state = useTasksStore.getState();
  assert.equal(state.isInitialized, true);
  assert.equal(state.items.filter((item) => item.group === 'wird').length, 4);
  assert.equal(state.items.find((item) => item.id === 'personal-1')?.title, 'مهمة شخصية');
  assert.equal(state.items.every((item) => item.completed === false), true);
  assert.equal(state.lastDailyResetKey, '2026-03-31');
});

test('tasks store tracks daily completions and blocks deleting default tasks', () => {
  resetStore();
  useTasksStore.getState().initialize();
  useTasksStore.getState().toggleTask('wird-morning');
  useTasksStore.getState().removeTask('wird-morning');
  assert.equal(useTasksStore.getState().items.some((item) => item.id === 'wird-morning'), true);
  assert.deepEqual(useTasksStore.getState().dailyCompletions['2026-03-31'], ['wird-morning']);
});

test('tasks store adds and removes personal tasks cleanly', () => {
  resetStore();
  useTasksStore.getState().initialize();
  useTasksStore.getState().addPersonalTask('  مراجعة الورد  ');
  const createdId = useTasksStore.getState().items.find((item) => item.group === 'personal')?.id;
  assert.equal(createdId, 'personal-generated-id');
  assert.equal(useTasksStore.getState().activeGroup, 'personal');

  useTasksStore.getState().toggleTask(createdId);
  useTasksStore.getState().removeTask(createdId);
  assert.equal(useTasksStore.getState().items.some((item) => item.id === createdId), false);
  assert.equal(useTasksStore.getState().dailyCompletions['2026-03-31']?.includes(createdId), false);
});
