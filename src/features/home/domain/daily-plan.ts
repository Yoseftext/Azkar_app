import type { QuranBookmark } from '@/features/quran/domain/quran-types';

export interface DailyPlanSnapshot {
  totalTasks: number;
  completedTasks: number;
  firstIncompleteTaskTitle: string | null;
  masbahaTodayCount: number;
  masbahaTarget: number;
  azkarTodayCount: number;
  duasTodayCount: number;
  namesTodayCount: number;
  quranTodayReadings: number;
  quranBookmark: QuranBookmark | null;
}

export interface DailyPlanSummary {
  totalTasks: number;
  completedTasks: number;
  remainingTasks: number;
  completionRate: number;
  firstIncompleteTaskTitle: string | null;
  masbahaTodayCount: number;
  masbahaTarget: number;
  azkarTodayCount: number;
  duasTodayCount: number;
  namesTodayCount: number;
  quranTodayReadings: number;
  quranBookmark: QuranBookmark | null;
  isFullyCompleted: boolean;
}

export function buildDailyPlan(snapshot: DailyPlanSnapshot): DailyPlanSummary {
  const totalTasks = Math.max(0, snapshot.totalTasks);
  const completedTasks = Math.max(0, Math.min(snapshot.completedTasks, totalTasks));
  const remainingTasks = Math.max(totalTasks - completedTasks, 0);
  const completionRate = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  return {
    totalTasks,
    completedTasks,
    remainingTasks,
    completionRate,
    firstIncompleteTaskTitle: remainingTasks > 0 ? snapshot.firstIncompleteTaskTitle : null,
    masbahaTodayCount: Math.max(0, snapshot.masbahaTodayCount),
    masbahaTarget: Math.max(0, snapshot.masbahaTarget),
    azkarTodayCount: Math.max(0, snapshot.azkarTodayCount),
    duasTodayCount: Math.max(0, snapshot.duasTodayCount),
    namesTodayCount: Math.max(0, snapshot.namesTodayCount),
    quranTodayReadings: Math.max(0, snapshot.quranTodayReadings),
    quranBookmark: snapshot.quranBookmark,
    isFullyCompleted: totalTasks > 0 && completedTasks >= totalTasks,
  };
}
