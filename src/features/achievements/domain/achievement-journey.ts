import { ACHIEVEMENT_DEFINITIONS, getDefinition } from '@/features/achievements/domain/achievement-definitions';

export interface AchievementJourneySummary {
  unlockedCount: number;
  totalCount: number;
  progressPercent: number;
  nextMilestones: AchievementMilestoneStep[];
}

export interface AchievementMilestoneStep {
  id: string;
  title: string;
  description: string;
  icon: string;
  route: string;
  actionLabel: string;
}

const JOURNEY_ORDER: Array<{ id: string; route: string; actionLabel: string }> = [
  { id: 'tasbeeh_33', route: '/masbaha', actionLabel: 'ابدأ جلسة مسبحة' },
  { id: 'task_1', route: '/tasks', actionLabel: 'افتح مهام اليوم' },
  { id: 'azkar_day_1', route: '/azkar', actionLabel: 'ابدأ جلسة أذكار' },
  { id: 'streak_3', route: '/', actionLabel: 'ارجع للرئيسية' },
  { id: 'tasbeeh_100', route: '/masbaha', actionLabel: 'أكمل 100 تسبيحة' },
  { id: 'task_10', route: '/tasks', actionLabel: 'تابع مهامك' },
  { id: 'azkar_day_7', route: '/azkar', actionLabel: 'حافظ على الأذكار' },
  { id: 'streak_7', route: '/', actionLabel: 'تابع يومك' },
];

export function buildAchievementJourney(unlockedIds: string[]): AchievementJourneySummary {
  const unlockedSet = new Set(unlockedIds);
  const nextMilestones = JOURNEY_ORDER
    .filter((entry) => !unlockedSet.has(entry.id))
    .slice(0, 3)
    .map((entry) => {
      const definition = getDefinition(entry.id);
      if (!definition) {
        throw new Error(`Unknown achievement definition: ${entry.id}`);
      }
      return {
        id: entry.id,
        title: definition.title,
        description: definition.description,
        icon: definition.icon,
        route: entry.route,
        actionLabel: entry.actionLabel,
      };
    });

  return {
    unlockedCount: unlockedIds.length,
    totalCount: ACHIEVEMENT_DEFINITIONS.length,
    progressPercent: ACHIEVEMENT_DEFINITIONS.length === 0 ? 0 : Math.round((unlockedIds.length / ACHIEVEMENT_DEFINITIONS.length) * 100),
    nextMilestones,
  };
}
