/**
 * ====================================================================
 * Achievement Definitions — تعريفات الإنجازات
 * ====================================================================
 * منقول وموسَّع من V2/js/infra/achievements-service.js
 * ====================================================================
 */
import type { AchievementDefinition } from '@/features/achievements/domain/achievement-types';

export const ACHIEVEMENT_DEFINITIONS: AchievementDefinition[] = [
  // التسبيح
  { id: 'tasbeeh_33',   title: 'بداية الذكر',     description: 'أكملت 33 تسبيحة',            icon: '🌱' },
  { id: 'tasbeeh_100',  title: 'ذاكر نشيط',        description: 'أكملت 100 تسبيحة',           icon: '⭐' },
  { id: 'tasbeeh_500',  title: 'ذاكر قوي',          description: 'أكملت 500 تسبيحة',           icon: '🔥' },
  { id: 'tasbeeh_1000', title: 'ذاكر مثابر',        description: 'أكملت 1000 تسبيحة',          icon: '💎' },
  // المهام
  { id: 'task_1',       title: 'أول مهمة',           description: 'أنجزت أول مهمة يومية',       icon: '✅' },
  { id: 'task_10',      title: 'منظم',               description: 'أنجزت 10 مهام',              icon: '📋' },
  { id: 'task_50',      title: 'مُنجز',              description: 'أنجزت 50 مهمة',              icon: '🏆' },
  // الأذكار
  { id: 'azkar_day_1',  title: 'أذكار اليوم',        description: 'أكملت أذكار يوم كامل',       icon: '☀️' },
  { id: 'azkar_day_7',  title: 'أسبوع أذكار',        description: 'أكملت أذكار 7 أيام متتالية', icon: '🗓️' },
  // الاستمرارية
  { id: 'streak_3',     title: '3 أيام التزام',      description: 'حافظت على 3 أيام متتالية',   icon: '📅' },
  { id: 'streak_7',     title: 'أسبوع التزام',       description: 'حافظت على 7 أيام متتالية',   icon: '🥇' },
  { id: 'streak_30',    title: 'شهر التزام',          description: 'حافظت على 30 يوماً متتالياً', icon: '👑' },
];

export function getDefinition(id: string): AchievementDefinition | undefined {
  return ACHIEVEMENT_DEFINITIONS.find((a) => a.id === id);
}
