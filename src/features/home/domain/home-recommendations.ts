import { AZKAR_CATEGORY_SUMMARY } from '@/content/azkar/generated/summary.js';
import { DUA_CATEGORY_SUMMARY } from '@/content/duas/generated/summary.js';
import type { LoadedAllahName } from '@/content/loaders/load-names';
import type { DailyPlanSummary } from '@/features/home/domain/daily-plan';

export interface HomeResumeSource {
  quranBookmarkSurahName: string | null;
  quranTodayReadings: number;
  recentAzkarCategorySlug: string | null;
  recentDuaCategorySlug: string | null;
  recentNameId: string | null;
  loadedNames: LoadedAllahName[];
}

export interface HomeHeroRecommendation {
  title: string;
  body: string;
  primaryLabel: string;
  primaryTo: string;
  secondaryLabel?: string;
  secondaryTo?: string;
  tone: 'sky' | 'emerald' | 'amber';
}

export interface ResumeRecommendation {
  id: string;
  title: string;
  body: string;
  to: string;
  icon: string;
}

function getAzkarCategoryTitle(slug: string | null): string | null {
  if (!slug) return null;
  return AZKAR_CATEGORY_SUMMARY.find((item) => item.slug === slug)?.title ?? null;
}

function getDuaCategoryTitle(slug: string | null): string | null {
  if (!slug) return null;
  return DUA_CATEGORY_SUMMARY.find((item) => item.slug === slug)?.title ?? null;
}

function getNameTitle(nameId: string | null, items: LoadedAllahName[]): string | null {
  if (!nameId) return null;
  return items.find((item) => item.id === nameId)?.name ?? null;
}

export function buildHomeHeroRecommendation(plan: DailyPlanSummary): HomeHeroRecommendation {
  if (plan.remainingTasks > 0) {
    return {
      title: `بقي لك ${plan.remainingTasks} من ورد اليوم`,
      body: plan.firstIncompleteTaskTitle
        ? `ابدأ الآن بـ ${plan.firstIncompleteTaskTitle} ثم أكمل بقية وردك بخطوات قصيرة وواضحة.`
        : 'ورد اليوم لم يكتمل بعد. افتح المهام وأغلق ما تبقى خطوة بخطوة.',
      primaryLabel: 'أكمل ورد اليوم',
      primaryTo: '/tasks',
      secondaryLabel: 'افتح الأذكار',
      secondaryTo: '/azkar',
      tone: 'sky',
    };
  }

  if (plan.quranBookmark && plan.quranTodayReadings === 0) {
    return {
      title: `تابع القراءة من سورة ${plan.quranBookmark.surahName}`,
      body: 'آخر موضع قراءة محفوظ لديك جاهز للاستكمال الآن بدون بحث أو تنقل إضافي.',
      primaryLabel: 'تابع القراءة',
      primaryTo: '/quran',
      secondaryLabel: 'عرض الإحصائيات',
      secondaryTo: '/stats',
      tone: 'emerald',
    };
  }

  if (plan.azkarTodayCount === 0) {
    return {
      title: 'ابدأ يومك بذكر قصير وثابت',
      body: 'جلسة أذكار قصيرة الآن كافية لتثبيت البداية وتقليل مقاومة العودة لاحقًا.',
      primaryLabel: 'ابدأ الأذكار',
      primaryTo: '/azkar',
      secondaryLabel: 'افتح المسبحة',
      secondaryTo: '/masbaha',
      tone: 'sky',
    };
  }

  if (plan.namesTodayCount === 0) {
    return {
      title: 'راجع اسمًا واحدًا اليوم',
      body: 'مراجعة اسم واحد من أسماء الله الحسنى تضيف معنى تعبديًا خفيفًا وثابتًا ليومك.',
      primaryLabel: 'افتح الأسماء الحسنى',
      primaryTo: '/names-of-allah',
      secondaryLabel: 'افتح الأدعية',
      secondaryTo: '/duas',
      tone: 'amber',
    };
  }

  if (plan.duasTodayCount === 0) {
    return {
      title: 'اختر دعاءً قصيرًا اليوم',
      body: 'دعاء واحد محفوظ في يومك أفضل من قائمة طويلة لا تُفتح.',
      primaryLabel: 'افتح الأدعية',
      primaryTo: '/duas',
      secondaryLabel: 'افتح الأذكار',
      secondaryTo: '/azkar',
      tone: 'sky',
    };
  }

  if (plan.masbahaTodayCount < Math.max(33, Math.min(plan.masbahaTarget, 100))) {
    return {
      title: 'جلسة تسبيح قصيرة تكفي الآن',
      body: `أنت الآن عند ${plan.masbahaTodayCount}، وخمس دقائق قد تقرّبك كثيرًا من هدفك اليومي.`,
      primaryLabel: 'افتح المسبحة',
      primaryTo: '/masbaha',
      secondaryLabel: 'عرض الإحصائيات',
      secondaryTo: '/stats',
      tone: 'emerald',
    };
  }

  return {
    title: 'يومك يسير بشكل جيد',
    body: 'أغلقت وردك الأساسي اليوم. هذا وقت مناسب لشيء خفيف مثل قصة قصيرة أو مراجعة هادئة.',
    primaryLabel: 'افتح قصة قصيرة',
    primaryTo: '/stories',
    secondaryLabel: 'عرض الإحصائيات',
    secondaryTo: '/stats',
    tone: 'emerald',
  };
}

export function buildResumeRecommendations(source: HomeResumeSource, plan: DailyPlanSummary): ResumeRecommendation[] {
  const items: ResumeRecommendation[] = [];

  if (source.quranBookmarkSurahName) {
    items.push({
      id: 'resume-quran',
      title: `تابع سورة ${source.quranBookmarkSurahName}`,
      body: source.quranTodayReadings > 0 ? `تمت قراءة ${source.quranTodayReadings} سورة اليوم، ويمكنك المتابعة من آخر موضع محفوظ.` : 'آخر موضع قراءة محفوظ وجاهز للاستكمال الآن.',
      to: '/quran',
      icon: '📖',
    });
  }

  const azkarTitle = getAzkarCategoryTitle(source.recentAzkarCategorySlug);
  if (azkarTitle) {
    items.push({
      id: 'resume-azkar',
      title: `ارجع إلى ${azkarTitle}`,
      body: 'آخر فئة أذكار استخدمتها ما زالت الأقرب لتكملة جلسة قصيرة الآن.',
      to: '/azkar',
      icon: '☀️',
    });
  }

  const duaTitle = getDuaCategoryTitle(source.recentDuaCategorySlug);
  if (duaTitle) {
    items.push({
      id: 'resume-duas',
      title: `تابع ${duaTitle}`,
      body: 'أقرب طريق للعودة هو متابعة آخر قسم أدعية استخدمته بدل البدء من الصفر.',
      to: '/duas',
      icon: '🤲',
    });
  }

  const nameTitle = getNameTitle(source.recentNameId, source.loadedNames);
  if (nameTitle) {
    items.push({
      id: 'resume-name',
      title: `راجع ${nameTitle}`,
      body: 'استكمال آخر اسم راجعته أسهل من فتح قائمة كاملة من البداية.',
      to: '/names-of-allah',
      icon: '✨',
    });
  }

  if (plan.remainingTasks > 0) {
    items.push({
      id: 'resume-tasks',
      title: 'أكمل المتبقي من ورد اليوم',
      body: plan.firstIncompleteTaskTitle ? `الخطوة التالية الواضحة: ${plan.firstIncompleteTaskTitle}.` : 'هناك عناصر متبقية اليوم ويمكنك إغلاقها سريعًا من صفحة المهام.',
      to: '/tasks',
      icon: '✅',
    });
  }

  return items.slice(0, 3);
}
