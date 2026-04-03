import { create } from 'zustand';
import { getLocalDateKey } from '@/shared/lib/date';
import {
  FALLBACK_TASKS_STATE,
  hydrateTaskItems,
  loadPersistedTasksState,
  persistTasksState,
  stripCompletedFlags,
} from '@/features/tasks/state/tasks-state';
import type { TaskGroup, TaskItem, TasksStateSnapshot } from '@/features/tasks/domain/task-types';

interface TasksStore extends TasksStateSnapshot {
  isInitialized: boolean;
  activeGroup: TaskGroup;
  initialize: () => void;
  setActiveGroup: (group: TaskGroup) => void;
  addPersonalTask: (title: string) => void;
  toggleTask: (taskId: string) => void;
  removeTask: (taskId: string) => void;
}

export const useTasksStore = create<TasksStore>((set, get) => ({
  ...FALLBACK_TASKS_STATE,
  isInitialized: false,
  activeGroup: 'wird',

  initialize: () => {
    if (get().isInitialized) return;
    const normalized = loadPersistedTasksState();
    persistTasksState(normalized);
    set({ ...normalized, isInitialized: true });
  },

  setActiveGroup: (group) => set({ activeGroup: group }),

  addPersonalTask: (title) => {
    const normalizedTitle = title.trim();
    if (!normalizedTitle) return;

    const currentState = get();
    const taskDefinition = {
      id: `personal-${crypto.randomUUID()}`,
      title: normalizedTitle,
      group: 'personal' as const,
      isDefault: false,
    };
    const nextItems = hydrateTaskItems([...stripCompletedFlags(currentState.items), taskDefinition], currentState.dailyCompletions);
    const nextState = {
      ...currentState,
      items: nextItems,
      activeGroup: 'personal' as const,
    };

    persistTasksState(nextState);
    set(nextState);
  },

  toggleTask: (taskId) => {
    const currentState = get();
    const task = currentState.items.find((item) => item.id === taskId);
    if (!task) return;

    const todayKey = getLocalDateKey();
    const currentDaySet = new Set(currentState.dailyCompletions[todayKey] ?? []);
    if (task.completed) currentDaySet.delete(taskId);
    else currentDaySet.add(taskId);

    const nextDailyCompletions = {
      ...currentState.dailyCompletions,
      [todayKey]: [...currentDaySet],
    };
    const nextState = {
      ...currentState,
      items: hydrateTaskItems(stripCompletedFlags(currentState.items), nextDailyCompletions),
      dailyCompletions: nextDailyCompletions,
    };

    persistTasksState(nextState);
    set(nextState);
  },

  removeTask: (taskId) => {
    const currentState = get();
    const currentTask = currentState.items.find((item) => item.id === taskId);
    if (!currentTask || currentTask.isDefault) return;

    const nextDailyCompletions = Object.fromEntries(
      Object.entries(currentState.dailyCompletions).map(([dateKey, ids]) => [dateKey, ids.filter((id) => id !== taskId)]),
    );
    const nextItems = hydrateTaskItems(
      stripCompletedFlags(currentState.items).filter((item) => item.id !== taskId),
      nextDailyCompletions,
    );
    const nextState = {
      ...currentState,
      items: nextItems,
      dailyCompletions: nextDailyCompletions,
    };

    persistTasksState(nextState);
    set(nextState);
  },
}));
