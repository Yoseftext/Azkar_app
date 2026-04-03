import type { DailyPlanSummary } from '@/features/home/domain/daily-plan';
import type { WeeklyReflection } from '@/features/stats/domain/stats-types';

export interface ProfileHubSummary {
  resumeTitle: string;
  resumeBody: string;
  resumeTo: string;
  focusTitle: string;
  focusBody: string;
  focusTo: string;
}

export function buildProfileHub(plan: DailyPlanSummary, reflection: WeeklyReflection): ProfileHubSummary {
  if (plan.quranBookmark) {
    return {
      resumeTitle: `تابع سورة ${plan.quranBookmark.surahName}`,
      resumeBody: 'آخر موضع قراءة محفوظ لديك هو أقرب نقطة رجوع الآن دون بحث إضافي.',
      resumeTo: '/quran',
      focusTitle: reflection.focus.title,
      focusBody: reflection.focus.body,
      focusTo: reflection.focus.to,
    };
  }

  if (plan.remainingTasks > 0) {
    return {
      resumeTitle: 'أكمل ورد اليوم',
      resumeBody: plan.firstIncompleteTaskTitle
        ? `الخطوة التالية الواضحة لك الآن: ${plan.firstIncompleteTaskTitle}.`
        : 'ورد اليوم لم يكتمل بعد، ويمكنك إغلاق ما تبقى بسرعة من صفحة المهام.',
      resumeTo: '/tasks',
      focusTitle: reflection.focus.title,
      focusBody: reflection.focus.body,
      focusTo: reflection.focus.to,
    };
  }

  if (plan.masbahaTodayCount < Math.max(33, Math.min(plan.masbahaTarget, 100))) {
    return {
      resumeTitle: 'تابع جلسة التسبيح',
      resumeBody: `أنت الآن عند ${plan.masbahaTodayCount} من هدف ${plan.masbahaTarget}.`,
      resumeTo: '/masbaha',
      focusTitle: reflection.focus.title,
      focusBody: reflection.focus.body,
      focusTo: reflection.focus.to,
    };
  }

  return {
    resumeTitle: 'راجع ملخصك الأسبوعي',
    resumeBody: 'عندما لا يكون هناك شيء مفتوح بوضوح، أفضل خطوة هي قراءة انعكاسك الأسبوعي واختيار التالي بهدوء.',
    resumeTo: '/stats',
    focusTitle: reflection.focus.title,
    focusBody: reflection.focus.body,
    focusTo: reflection.focus.to,
  };
}
