import { create } from 'zustand';
import { LocalStorageEngine } from '@/kernel/storage/local-storage-engine';
import { STORAGE_KEYS } from '@/kernel/storage/storage-keys';
import { getLocalDateKey, trimRecordToRecentDays } from '@/shared/lib/date';
import type { PersistedTasksState, TaskGroup, TaskItem } from '@/features/tasks/domain/task-types';

interface TasksStore extends PersistedTasksState {
  isInitialized: boolean;
  activeGroup: TaskGroup;
  initialize: () => void;
  setActiveGroup: (group: TaskGroup) => void;
  addPersonalTask: (title: string) => void;
  toggleTask: (taskId: string) => void;
  removeTask: (taskId: string) => void;
}

const storage = new LocalStorageEngine();

const defaultTasks: TaskItem[] = [
  { id: 'wird-morning', title: 'أذكار الصباح', completed: false, group: 'wird', isDefault: true },
  { id: 'wird-evening', title: 'أذكار المساء', completed: false, group: 'wird', isDefault: true },
  { id: 'wird-masbaha', title: 'تسبيح 100 مرة', completed: false, group: 'wird', isDefault: true },
  { id: 'wird-quran', title: 'قراءة ورد القرآن', completed: false, group: 'wird', isDefault: true },
];

const fallbackState: PersistedTasksState = {
  items: defaultTasks,
  dailyCompletions: {},
  lastDailyResetKey: getLocalDateKey(),
};

function mergePersistedTasks(items: TaskItem[] | undefined): TaskItem[] {
  const persisted = items ?? [];
  const persistedMap = new Map(persisted.map((item) => [item.id, item]));
  const mergedDefaultTasks = defaultTasks.map((task) => ({
    ...task,
    completed: persistedMap.get(task.id)?.completed ?? false,
  }));
  const personalTasks = persisted.filter((task) => task.group === 'personal');

  return [...mergedDefaultTasks, ...personalTasks];
}

function normalizePersistedState(rawValue: PersistedTasksState | null): PersistedTasksState {
  if (!rawValue) return fallbackState;

  const mergedItems = mergePersistedTasks(rawValue.items);
  const safeDailyCompletions = trimRecordToRecentDays(
    Object.fromEntries(
      Object.entries(rawValue.dailyCompletions ?? {}).map(([dateKey, ids]) => [dateKey, [...new Set(Array.isArray(ids) ? ids.filter(Boolean) : [])]]),
    ),
    180,
  );

  return {
    items: mergedItems,
    dailyCompletions: safeDailyCompletions,
    lastDailyResetKey: rawValue.lastDailyResetKey || getLocalDateKey(),
  };
}

function applyDailyReset(state: PersistedTasksState): PersistedTasksState {
  const todayKey = getLocalDateKey();
  if (state.lastDailyResetKey === todayKey) return state;

  return {
    ...state,
    items: state.items.map((item) => ({ ...item, completed: false })),
    lastDailyResetKey: todayKey,
  };
}

function persist(state: PersistedTasksState): void {
  storage.setItem<PersistedTasksState>(STORAGE_KEYS.tasks, {
    ...state,
    dailyCompletions: trimRecordToRecentDays(state.dailyCompletions, 180),
  });
}

export const useTasksStore = create<TasksStore>((set, get) => ({
  ...fallbackState,
  isInitialized: false,
  activeGroup: 'wird',
  initialize: () => {
    if (get().isInitialized) return;
    const stored = storage.getItem<PersistedTasksState>(STORAGE_KEYS.tasks);
    const normalized = applyDailyReset(normalizePersistedState(stored));
    persist(normalized);
    set({ ...normalized, isInitialized: true });
  },
  setActiveGroup: (group) => set({ activeGroup: group }),
  addPersonalTask: (title) => {
    const normalizedTitle = title.trim();
    if (!normalizedTitle) return;

    const state = get();
    const newItem: TaskItem = {
      id: `personal-${crypto.randomUUID()}`,
      title: normalizedTitle,
      completed: false,
      group: 'personal',
      isDefault: false,
    };

    const nextState = {
      ...state,
      items: [...state.items, newItem],
      activeGroup: 'personal' as const,
    };

    persist(nextState);
    set(nextState);
  },
  toggleTask: (taskId) => {
    const state = get();
    const todayKey = getLocalDateKey();
    const currentItem = state.items.find((item) => item.id === taskId);
    if (!currentItem) return;

    const nextCompleted = !currentItem.completed;
    const items = state.items.map((item) => (item.id === taskId ? { ...item, completed: nextCompleted } : item));
    const currentDaySet = new Set(state.dailyCompletions[todayKey] ?? []);

    if (nextCompleted) {
      currentDaySet.add(taskId);
    } else {
      currentDaySet.delete(taskId);
    }

    const nextState = {
      ...state,
      items,
      dailyCompletions: {
        ...state.dailyCompletions,
        [todayKey]: [...currentDaySet],
      },
    };

    persist(nextState);
    set(nextState);
  },
  removeTask: (taskId) => {
    const state = get();
    const current = state.items.find((item) => item.id === taskId);
    if (!current || current.isDefault) return;

    const nextDailyCompletions = Object.fromEntries(
      Object.entries(state.dailyCompletions).map(([dateKey, ids]) => [dateKey, ids.filter((id) => id !== taskId)]),
    );

    const nextState = {
      ...state,
      items: state.items.filter((item) => item.id !== taskId),
      dailyCompletions: nextDailyCompletions,
    };

    persist(nextState);
    set(nextState);
  },
}));
