export type TaskGroup = 'wird' | 'personal';

export interface TaskItem {
  id: string;
  title: string;
  completed: boolean;
  group: TaskGroup;
  isDefault: boolean;
}

export interface PersistedTasksState {
  items: TaskItem[];
  dailyCompletions: Record<string, string[]>;
  lastDailyResetKey: string;
}
