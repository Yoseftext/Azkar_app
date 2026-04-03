import { useMemo } from 'react';
import { AppCard } from '@/shared/ui/primitives/AppCard';
import { StatTile } from '@/shared/ui/primitives/StatTile';
import { useTasksStore } from '@/features/tasks/state/tasks-store';
import { useMasbahaStore } from '@/features/masbaha/state/masbaha-store';
import { useQuranStore } from '@/features/quran/state/quran-store';
import { useAzkarStore } from '@/features/azkar/state/azkar-store';
import { useDuasStore } from '@/features/duas/state/duas-store';
import { useStoriesStore } from '@/features/stories/state/stories-store';
import { useNamesOfAllahStore } from '@/features/names-of-allah/state/names-store';
import { useAchievementsStore } from '@/features/achievements/state/achievements-store';
import { ACHIEVEMENT_DEFINITIONS } from '@/features/achievements/domain/achievement-definitions';
import { getLocalDateKey } from '@/shared/lib/date';
import { usePreferencesStore } from '@/kernel/preferences/preferences-store';
import { buildDailyPlan } from '@/features/home/domain/daily-plan';
import { buildDailyMicroContent } from '@/features/home/domain/daily-micro-content';
import { buildHomeHeroRecommendation, buildResumeRecommendations } from '@/features/home/domain/home-recommendations';
import { TodayHeroCard } from '@/features/home/components/TodayHeroCard';
import { ResumeSection } from '@/features/home/components/ResumeSection';
import { DailyMicroContent } from '@/features/home/components/DailyMicroContent';
import { HomeSetupCard } from '@/features/home/components/HomeSetupCard';
import { QuickAccessSection } from '@/features/home/components/QuickAccessSection';
import { buildHomeSetupCard } from '@/features/home/domain/home-onboarding';
import { FEATURED_QUICK_ACCESS, SECONDARY_QUICK_ACCESS } from '@/features/home/domain/home-quick-access';
import { buildAdaptiveHomeActions, rankAdaptiveQuickAccess } from '@/features/home/domain/home-adaptive';
import { AdaptiveActionSection } from '@/features/home/components/AdaptiveActionSection';
import { useHomeOnboarding } from '@/features/home/hooks/use-home-onboarding';
import { usePlansStore } from '@/features/plans/state/plans-store';
import { getGuidedPlanById, GUIDED_PLANS } from '@/features/plans/domain/plan-definitions';
import { buildGuidedPlanSummary, rankGuidedPlans } from '@/features/plans/domain/plan-progress';
import { PlansHomeCard } from '@/features/plans/components/PlansHomeCard';
import { ActivePlanCard } from '@/features/plans/components/ActivePlanCard';

export function HomePage() {
  const todayKey = getLocalDateKey();
  const taskItems = useTasksStore((s) => s.items);
  const taskDailyCompletions = useTasksStore((s) => s.dailyCompletions[todayKey] ?? []);
  const masbahaTodayCount = useMasbahaStore((s) => s.dailyCounts[todayKey] ?? 0);
  const masbahaTarget = useMasbahaStore((s) => s.currentTarget);
  const azkarTodayCount = useAzkarStore((s) => s.completedByDate[todayKey]?.length ?? 0);
  const azkarRecentCategorySlugs = useAzkarStore((s) => s.recentCategorySlugs);
  const duasTodayCount = useDuasStore((s) => s.completedByDate[todayKey]?.length ?? 0);
  const duasRecentCategorySlugs = useDuasStore((s) => s.recentCategorySlugs);
  const storiesTodayCount = useStoriesStore((s) => s.completedByDate[todayKey]?.length ?? 0);
  const namesTodayCount = useNamesOfAllahStore((s) => s.completedByDate[todayKey]?.length ?? 0);
  const namesRecentIds = useNamesOfAllahStore((s) => s.recentNameIds);
  const loadedNames = useNamesOfAllahStore((s) => s.items);
  const quranBookmark = useQuranStore((s) => s.bookmark);
  const quranTodayReadings = useQuranStore((s) => s.dailyReadings[todayKey]?.length ?? 0);
  const unlockedIds = useAchievementsStore((s) => s.unlockedIds);
  const themeMode = usePreferencesStore((s) => s.themeMode);
  const colorTheme = usePreferencesStore((s) => s.colorTheme);
  const textSize = usePreferencesStore((s) => s.textSize);
  const readingDensity = usePreferencesStore((s) => s.readingDensity);
  const lineSpacing = usePreferencesStore((s) => s.lineSpacing);
  const motionMode = usePreferencesStore((s) => s.motionMode);
  const { dismissed: onboardingDismissed, dismiss: dismissOnboarding } = useHomeOnboarding();
  const activePlanId = usePlansStore((s) => s.activePlanId);
  const planProgressById = usePlansStore((s) => s.progressByPlanId);
  const completePlanToday = usePlansStore((s) => s.completeTodaySession);
  const stopPlan = usePlansStore((s) => s.stopPlan);

  const totalTasks = taskItems.length;
  const completedTasks = taskDailyCompletions.length;
  const taskProgress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  const firstIncompleteTaskTitle = useMemo(() => taskItems.find((item) => !item.completed)?.title ?? null, [taskItems]);

  const plan = useMemo(() => {
    return buildDailyPlan({
      totalTasks,
      completedTasks,
      firstIncompleteTaskTitle,
      masbahaTodayCount,
      masbahaTarget,
      azkarTodayCount,
      duasTodayCount,
      namesTodayCount,
      quranTodayReadings,
      quranBookmark,
    });
  }, [
    azkarTodayCount,
    completedTasks,
    duasTodayCount,
    firstIncompleteTaskTitle,
    masbahaTarget,
    masbahaTodayCount,
    namesTodayCount,
    quranBookmark,
    quranTodayReadings,
    totalTasks,
  ]);

  const guidedPlanSnapshot = useMemo(() => ({
    completedTasks,
    remainingTasks: Math.max(totalTasks - completedTasks, 0),
    azkarTodayCount,
    quranTodayReadings,
    duasTodayCount,
    namesTodayCount,
    masbahaTodayCount,
  }), [completedTasks, totalTasks, azkarTodayCount, quranTodayReadings, duasTodayCount, namesTodayCount, masbahaTodayCount]);

  const activeGuidedPlan = useMemo(() => getGuidedPlanById(activePlanId), [activePlanId]);
  const activeGuidedPlanSummary = useMemo(() => {
    if (!activeGuidedPlan) return null;
    return buildGuidedPlanSummary({
      definition: activeGuidedPlan,
      completedSessionKeys: planProgressById[activeGuidedPlan.id]?.completedSessionKeys ?? [],
      todayKey,
      snapshot: guidedPlanSnapshot,
    });
  }, [activeGuidedPlan, guidedPlanSnapshot, planProgressById, todayKey]);

  const recommendedGuidedPlan = useMemo(() => rankGuidedPlans(guidedPlanSnapshot, activePlanId, GUIDED_PLANS)[0] ?? null, [guidedPlanSnapshot, activePlanId]);

  const heroRecommendation = useMemo(() => buildHomeHeroRecommendation(plan), [plan]);
  const resumeRecommendations = useMemo(() => buildResumeRecommendations({
    quranBookmarkSurahName: quranBookmark?.surahName ?? null,
    quranTodayReadings,
    recentAzkarCategorySlug: azkarRecentCategorySlugs[0] ?? null,
    recentDuaCategorySlug: duasRecentCategorySlugs[0] ?? null,
    recentNameId: namesRecentIds[0] ?? null,
    loadedNames,
  }, plan), [
    azkarRecentCategorySlugs,
    duasRecentCategorySlugs,
    loadedNames,
    namesRecentIds,
    plan,
    quranBookmark,
    quranTodayReadings,
  ]);
  const microContent = useMemo(() => buildDailyMicroContent(loadedNames), [loadedNames]);
  const adaptiveSnapshot = useMemo(() => ({
    plan,
    activePlanSummary: activeGuidedPlanSummary,
    hasRecommendedPlan: Boolean(recommendedGuidedPlan),
    storiesTodayCount,
    unlockedAchievementsCount: unlockedIds.length,
  }), [plan, activeGuidedPlanSummary, recommendedGuidedPlan, storiesTodayCount, unlockedIds.length]);
  const adaptiveActions = useMemo(() => buildAdaptiveHomeActions(adaptiveSnapshot), [adaptiveSnapshot]);
  const featuredQuickAccess = useMemo(() => rankAdaptiveQuickAccess(FEATURED_QUICK_ACCESS, adaptiveSnapshot).slice(0, 6), [adaptiveSnapshot]);
  const secondaryQuickAccess = useMemo(() => rankAdaptiveQuickAccess(SECONDARY_QUICK_ACCESS, adaptiveSnapshot), [adaptiveSnapshot]);
  const setupCard = useMemo(() => buildHomeSetupCard({
    dismissed: onboardingDismissed,
    completedTasks,
    azkarTodayCount,
    quranTodayReadings,
    masbahaTodayCount,
    duasTodayCount,
    namesTodayCount,
    hasQuranBookmark: Boolean(quranBookmark),
    hasRecentAzkar: Boolean(azkarRecentCategorySlugs[0]),
    hasRecentDua: Boolean(duasRecentCategorySlugs[0]),
    hasRecentName: Boolean(namesRecentIds[0]),
    hasCustomizedReading:
      themeMode !== 'system' ||
      colorTheme !== 'sky' ||
      textSize !== 'base' ||
      readingDensity !== 'comfortable' ||
      lineSpacing !== 'relaxed' ||
      motionMode !== 'full',
  }), [
    onboardingDismissed,
    completedTasks,
    azkarTodayCount,
    quranTodayReadings,
    masbahaTodayCount,
    duasTodayCount,
    namesTodayCount,
    quranBookmark,
    azkarRecentCategorySlugs,
    duasRecentCategorySlugs,
    namesRecentIds,
    themeMode,
    colorTheme,
    textSize,
    readingDensity,
    lineSpacing,
    motionMode,
  ]);

  return (
    <div className="space-y-4">
      <HomeSetupCard model={setupCard} onDismiss={dismissOnboarding} />

      {activeGuidedPlanSummary ? (
        <ActivePlanCard summary={activeGuidedPlanSummary} onCompleteToday={completePlanToday} onStop={stopPlan} compact />
      ) : (
        <PlansHomeCard recommendedPlan={recommendedGuidedPlan} />
      )}

      <TodayHeroCard recommendation={heroRecommendation} />

      <AdaptiveActionSection items={adaptiveActions} />

      <ResumeSection items={resumeRecommendations} />

      <DailyMicroContent items={microContent} />

      <AppCard title="نشاط اليوم" subtitle="ملخص سريع يوضح أين وصلت اليوم قبل الانتقال لأي قسم.">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatTile label="المهام" value={`${completedTasks}/${totalTasks}`} hint={`${taskProgress}% إنجاز`} variant={taskProgress === 100 ? 'emerald' : 'sky'} />
          <StatTile label="تسبيح" value={String(masbahaTodayCount)} hint={`الهدف ${masbahaTarget}`} variant="sky" />
          <StatTile label="أذكار" value={String(azkarTodayCount)} hint="ذكر مكتمل" variant="sky" />
          <StatTile label="أدعية" value={String(duasTodayCount)} hint="دعاء اليوم" variant="sky" />
          <StatTile label="قصص" value={String(storiesTodayCount)} hint="قصة مقروءة" variant="slate" />
          <StatTile label="الأسماء" value={String(namesTodayCount)} hint="اسم مراجَع" variant="slate" />
          <StatTile label="القرآن" value={quranBookmark?.surahName ?? '—'} hint={`${quranTodayReadings} سورة اليوم`} variant="sky" />
          <StatTile label="إنجازات" value={String(unlockedIds.length)} hint={`من ${ACHIEVEMENT_DEFINITIONS.length}`} variant="amber" />
        </div>
      </AppCard>
      <QuickAccessSection
        title="ابدأ من الأساسيات"
        subtitle="أقصر طريق لأهم الأقسام اليومية بدل الزحام في شبكة واحدة كبيرة."
        items={featuredQuickAccess}
      />

      <QuickAccessSection
        title="باقي الأقسام"
        subtitle="محتوى أعمق ومراجعات وإعدادات ترجع إليها عند الحاجة."
        items={secondaryQuickAccess}
      />
    </div>
  );
}
