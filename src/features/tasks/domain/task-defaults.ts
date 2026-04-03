import type { TaskDefinition } from '@/features/tasks/domain/task-types';

export const DEFAULT_TASK_DEFINITIONS: TaskDefinition[] = [
  { id: 'wird-morning', title: 'أذكار الصباح', group: 'wird', isDefault: true },
  { id: 'wird-evening', title: 'أذكار المساء', group: 'wird', isDefault: true },
  { id: 'wird-masbaha', title: 'تسبيح 100 مرة', group: 'wird', isDefault: true },
  { id: 'wird-quran', title: 'قراءة ورد القرآن', group: 'wird', isDefault: true },
];
