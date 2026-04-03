import type { DailyPlanSummary } from '@/features/home/domain/daily-plan';
import type { HomeQuickAccessItem } from '@/features/home/domain/home-quick-access';
import type { GuidedPlanSummary } from '@/features/plans/domain/plan-types';

export interface AdaptiveHomeAction {
  id: string;
  title: string;
  body: string;
  to: string;
  icon: string;
  tone: 'sky' | 'emerald' | 'amber' | 'slate';
  score: number;
}

export interface AdaptiveHomeSnapshot {
  plan: DailyPlanSummary;
  activePlanSummary: GuidedPlanSummary | null;
  hasRecommendedPlan: boolean;
  storiesTodayCount: number;
  unlockedAchievementsCount: number;
}

function createAction(action: Omit<AdaptiveHomeAction, 'score'> & { score: number }): AdaptiveHomeAction {
  return action;
}

export function buildAdaptiveHomeActions(snapshot: AdaptiveHomeSnapshot): AdaptiveHomeAction[] {
  const actions: AdaptiveHomeAction[] = [];
  const { plan, activePlanSummary } = snapshot;

  if (activePlanSummary) {
    actions.push(createAction({
      id: 'plan',
      title: activePlanSummary.completedToday ? `حافظ على ${activePlanSummary.definition.title}` : `اليوم ${activePlanSummary.currentSession} من ${activePlanSummary.definition.title}`,
      body: activePlanSummary.completedToday
        ? 'جلستك اليوم مكتملة. افتح البرنامج لترى بقية الأيام والاتجاه العام.'
        : activePlanSummary.nextRequirementTitle
          ? `الخطوة الأقرب الآن: ${activePlanSummary.nextRequirementTitle}.`
          : 'برنامجك الحالي هو أسرع طريق للاستمرار بثبات اليوم.',
      to: '/plans',
      icon: activePlanSummary.definition.icon,
      tone: activePlanSummary.completedToday ? 'emerald' : 'amber',
      score: activePlanSummary.completedToday ? 84 : 98,
    }));
  } else if (snapshot.hasRecommendedPlan) {
    actions.push(createAction({
      id: 'plan-recommendation',
      title: 'ابدأ برنامجًا قصيرًا جاهزًا',
      body: 'إذا كنت تريد مسارًا واضحًا لعدة أيام، فالبرامج القصيرة أفضل بداية من التجربة الحرة.',
      to: '/plans',
      icon: '🧭',
      tone: 'sky',
      score: 66,
    }));
  }

  if (plan.remainingTasks > 0) {
    actions.push(createAction({
      id: 'tasks',
      title: `أغلق ${plan.remainingTasks} من ورد اليوم`,
      body: plan.firstIncompleteTaskTitle
        ? `ابدأ بـ ${plan.firstIncompleteTaskTitle} ثم أكمل الباقي بخطوات قصيرة.`
        : 'ورد اليوم لم يغلق بعد، والمهام هي أقصر طريق للعودة الآن.',
      to: '/tasks',
      icon: '✅',
      tone: 'sky',
      score: 96,
    }));
  }

  if (plan.quranBookmark && plan.quranTodayReadings === 0) {
    actions.push(createAction({
      id: 'quran-resume',
      title: `تابع سورة ${plan.quranBookmark.surahName}`,
      body: 'آخر موضع قراءة محفوظ وجاهز للمتابعة الآن بدون بحث إضافي.',
      to: '/quran',
      icon: '📖',
      tone: 'emerald',
      score: 90,
    }));
  } else if (plan.quranTodayReadings === 0) {
    actions.push(createAction({
      id: 'quran-start',
      title: 'افتح ورد القرآن اليوم',
      body: 'جلسة قراءة قصيرة الآن أقوى من تأجيل القراءة لوقت غير محدد.',
      to: '/quran',
      icon: '📖',
      tone: 'sky',
      score: 68,
    }));
  }

  if (plan.azkarTodayCount === 0) {
    actions.push(createAction({
      id: 'azkar',
      title: 'ابدأ جلسة أذكار قصيرة',
      body: 'الأذكار هي أسرع مسار لبداية ثابتة وخفيفة اليوم.',
      to: '/azkar',
      icon: '☀️',
      tone: 'sky',
      score: 86,
    }));
  }

  if (plan.namesTodayCount === 0) {
    actions.push(createAction({
      id: 'names',
      title: 'راجع اسمًا واحدًا اليوم',
      body: 'اسم واحد مع معنى مختصر يضيف عمقًا هادئًا ليومك.',
      to: '/names-of-allah',
      icon: '✨',
      tone: 'amber',
      score: 60,
    }));
  }

  if (plan.duasTodayCount === 0) {
    actions.push(createAction({
      id: 'duas',
      title: 'اختر دعاءً قصيرًا',
      body: 'دعاء واحد حاضر في يومك أفضل من قائمة طويلة لا تُفتح.',
      to: '/duas',
      icon: '🤲',
      tone: 'sky',
      score: 58,
    }));
  }

  if (plan.masbahaTodayCount < Math.min(Math.max(plan.masbahaTarget, 33), 100)) {
    actions.push(createAction({
      id: 'masbaha',
      title: 'جلسة تسبيح قصيرة تكفي الآن',
      body: `أنت الآن عند ${plan.masbahaTodayCount}، ويمكنك الاقتراب من الهدف بسرعة من جلسة واحدة.`,
      to: '/masbaha',
      icon: '📿',
      tone: 'emerald',
      score: 56,
    }));
  }

  if (plan.isFullyCompleted && snapshot.storiesTodayCount === 0) {
    actions.push(createAction({
      id: 'stories',
      title: 'اقرأ قصة قصيرة بهدوء',
      body: 'أغلقت الأساسيات اليوم، وهذا وقت مناسب لقراءة هادئة خفيفة.',
      to: '/stories',
      icon: '📚',
      tone: 'slate',
      score: 52,
    }));
  }

  if (plan.isFullyCompleted || snapshot.unlockedAchievementsCount > 0) {
    actions.push(createAction({
      id: 'stats',
      title: 'ألق نظرة على تقدمك',
      body: 'راجع انعكاس الأسبوع والإنجازات الأقرب بدل الانتقال العشوائي بين الأقسام.',
      to: '/stats',
      icon: '📊',
      tone: 'slate',
      score: plan.isFullyCompleted ? 54 : 42,
    }));
  }

  const seen = new Set<string>();
  return actions
    .sort((left, right) => right.score - left.score)
    .filter((item) => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    })
    .slice(0, 3);
}

function scoreQuickAccess(item: HomeQuickAccessItem, snapshot: AdaptiveHomeSnapshot): number {
  const { plan, activePlanSummary } = snapshot;
  let score = item.baseRank ?? 0;

  switch (item.id) {
    case 'plans':
      score += activePlanSummary ? (activePlanSummary.completedToday ? 48 : 90) : (snapshot.hasRecommendedPlan ? 40 : 12);
      break;
    case 'tasks':
      score += plan.remainingTasks > 0 ? 82 : 20;
      break;
    case 'quran':
      score += plan.quranBookmark && plan.quranTodayReadings === 0 ? 78 : (plan.quranTodayReadings === 0 ? 46 : 18);
      if (activePlanSummary?.definition.focus === 'quran') score += 18;
      break;
    case 'azkar':
      score += plan.azkarTodayCount === 0 ? 74 : 22;
      if (activePlanSummary?.definition.focus === 'azkar') score += 18;
      break;
    case 'duas':
      score += plan.duasTodayCount === 0 ? 40 : 16;
      break;
    case 'names':
      score += plan.namesTodayCount === 0 ? 44 : 15;
      if (activePlanSummary?.definition.focus === 'names') score += 16;
      break;
    case 'masbaha':
      score += plan.masbahaTodayCount < Math.min(Math.max(plan.masbahaTarget, 33), 100) ? 42 : 16;
      break;
    case 'stories':
      score += plan.isFullyCompleted && snapshot.storiesTodayCount === 0 ? 28 : 12;
      break;
    case 'stats':
      score += plan.isFullyCompleted ? 30 : 10;
      break;
    case 'achievements':
      score += snapshot.unlockedAchievementsCount > 0 ? 24 : 8;
      break;
    case 'search':
      score += 36;
      break;
    case 'notifications':
      score += 10;
      break;
    case 'settings':
      score += 6;
      break;
    default:
      score += 0;
  }

  return score;
}

export function rankAdaptiveQuickAccess(items: HomeQuickAccessItem[], snapshot: AdaptiveHomeSnapshot): HomeQuickAccessItem[] {
  return [...items]
    .map((item) => ({ item, score: scoreQuickAccess(item, snapshot) }))
    .sort((left, right) => right.score - left.score)
    .map(({ item }) => item);
}
