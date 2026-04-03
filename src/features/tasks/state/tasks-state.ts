import { LocalStorageEngine } from '@/kernel/storage/local-storage-engine';
import { STORAGE_KEYS } from '@/kernel/storage/storage-keys';
import { getLocalDateKey, trimRecordToRecentDays } from '@/shared/lib/date';
import { DEFAULT_TASK_DEFINITIONS } from '@/features/tasks/domain/task-defaults';
import type { PersistedTaskItem, PersistedTasksState, TaskDefinition, TaskItem, TasksStateSnapshot } from '@/features/tasks/domain/task-types';

const storage = new LocalStorageEngine();

export const FALLBACK_TASKS_STATE: TasksStateSnapshot = {
  items: DEFAULT_TASK_DEFINITIONS.map((task) => ({ ...task, completed: false })),
  dailyCompletions: {},
  lastDailyResetKey: getLocalDateKey(),
};

function normalizeTaskDefinitions(items: PersistedTaskItem[] | undefined): TaskDefinition[] {
  const persistedItems = Array.isArray(items) ? items : [];
  const persistedMap = new Map(persistedItems.map((item) => [item.id, item]));
  const mergedDefaults = DEFAULT_TASK_DEFINITIONS.map((task) => {
    const persisted = persistedMap.get(task.id);
    return persisted ? { ...task, title: String(persisted.title ?? task.title).trim() || task.title } : task;
  });

  const personalTasks = persistedItems
    .filter((item) => item.group === 'personal')
    .map((item, index) => ({
      id: item.id ?? `personal-${index}`,
      title: String(item.title ?? '').trim() || `مهمة ${index + 1}`,
      group: 'personal' as const,
      isDefault: false,
    }));

  return [...mergedDefaults, ...personalTasks];
}

function normalizeDailyCompletions(rawValue: Record<string, string[]> | undefined): Record<string, string[]> {
  return trimRecordToRecentDays(
    Object.fromEntries(
      Object.entries(rawValue ?? {}).map(([dateKey, ids]) => [dateKey, [...new Set(Array.isArray(ids) ? ids.filter(Boolean) : [])]]),
    ),
    180,
  );
}

export function hydrateTaskItems(items: TaskDefinition[], dailyCompletions: Record<string, string[]>, dateKey: string = getLocalDateKey()): TaskItem[] {
  const completedIds = new Set(dailyCompletions[dateKey] ?? []);
  return items.map((item) => ({ ...item, completed: completedIds.has(item.id) }));
}

export function stripCompletedFlags(items: TaskItem[]): PersistedTaskItem[] {
  return items.map(({ completed: _completed, ...item }) => item);
}

export function normalizePersistedTasksState(rawValue: PersistedTasksState | null): TasksStateSnapshot {
  if (!rawValue) return FALLBACK_TASKS_STATE;

  const todayKey = getLocalDateKey();
  const dailyCompletions = normalizeDailyCompletions(rawValue.dailyCompletions);
  const taskDefinitions = normalizeTaskDefinitions(rawValue.items);

  return {
    items: hydrateTaskItems(taskDefinitions, dailyCompletions, todayKey),
    dailyCompletions,
    lastDailyResetKey: rawValue.lastDailyResetKey || todayKey,
  };
}

export function applyDailyReset(state: TasksStateSnapshot): TasksStateSnapshot {
  const todayKey = getLocalDateKey();
  if (state.lastDailyResetKey === todayKey) return {
    ...state,
    items: hydrateTaskItems(stripCompletedFlags(state.items), state.dailyCompletions, todayKey),
  };

  return {
    ...state,
    items: hydrateTaskItems(stripCompletedFlags(state.items), state.dailyCompletions, todayKey),
    lastDailyResetKey: todayKey,
  };
}

export function persistTasksState(state: TasksStateSnapshot): void {
  storage.setItem<PersistedTasksState>(STORAGE_KEYS.tasks, {
    items: stripCompletedFlags(state.items),
    dailyCompletions: trimRecordToRecentDays(state.dailyCompletions, 180),
    lastDailyResetKey: state.lastDailyResetKey,
  });
}

export function loadPersistedTasksState(): TasksStateSnapshot {
  const stored = storage.getItem<PersistedTasksState>(STORAGE_KEYS.tasks);
  return applyDailyReset(normalizePersistedTasksState(stored));
}
