/**
 * ====================================================================
 * useAchievementsChecker — مراقب الإنجازات
 * ====================================================================
 * يشترك في الـ stores ذات الصلة ويشغّل check() عند أي تغيير.
 * يُستدعى مرة واحدة من AppProviders.
 * ====================================================================
 */
import { useEffect } from 'react';
import { useAchievementsStore } from '@/features/achievements/state/achievements-store';
import { useMasbahaStore } from '@/features/masbaha/state/masbaha-store';
import { useTasksStore } from '@/features/tasks/state/tasks-store';
import { useAzkarStore } from '@/features/azkar/state/azkar-store';
import { countTrailingActiveDays, getLocalDateKey } from '@/shared/lib/date';

export function useAchievementsChecker(): void {
  const check            = useAchievementsStore((s) => s.check);
  const tasbeehTotal     = useMasbahaStore((s) => s.totalCount);
  const taskItems        = useTasksStore((s) => s.items);
  const dailyCompletions = useTasksStore((s) => s.dailyCompletions);
  const azkarCompleted   = useAzkarStore((s) => s.completedByDate);

  useEffect(() => {
    // حساب المهام المكتملة عبر كل التاريخ
    const tasksCompletedTotal = Object.values(dailyCompletions).reduce(
      (sum, ids) => sum + ids.length,
      0,
    );

    // أيام الأذكار المكتملة (أيام بها على الأقل ذكر واحد)
    const azkarDaysCompleted = Object.keys(azkarCompleted).filter(
      (key) => (azkarCompleted[key]?.length ?? 0) > 0,
    ).length;

    // الاستمرارية
    const streakDays = countTrailingActiveDays(
      Object.keys(azkarCompleted).filter((k) => (azkarCompleted[k]?.length ?? 0) > 0),
    );

    check({ tasbeehTotal, tasksCompletedTotal, azkarDaysCompleted, streakDays });
  }, [check, tasbeehTotal, taskItems, dailyCompletions, azkarCompleted]);
}
