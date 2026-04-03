export type TaskGroup = 'wird' | 'personal';

export interface TaskDefinition {
  id: string;
  title: string;
  group: TaskGroup;
  isDefault: boolean;
}

export interface TaskItem extends TaskDefinition {
  completed: boolean;
}

export interface PersistedTaskItem extends TaskDefinition {
  completed?: boolean;
}

export interface PersistedTasksState {
  items: PersistedTaskItem[];
  dailyCompletions: Record<string, string[]>;
  lastDailyResetKey: string;
}

export interface TasksStateSnapshot {
  items: TaskItem[];
  dailyCompletions: Record<string, string[]>;
  lastDailyResetKey: string;
}
