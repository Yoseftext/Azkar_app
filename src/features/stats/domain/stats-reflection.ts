import type { BuildStatsInput } from '@/features/stats/domain/stats-aggregators';
import { buildStatsDashboard } from '@/features/stats/domain/stats-aggregators';
import type { StatsInsight, WeeklyReflection } from '@/features/stats/domain/stats-types';

interface ActivityArea {
  id: string;
  label: string;
  score: number;
  route: string;
  detail: string;
}

function getStrongestArea(input: BuildStatsInput): ActivityArea {
  const week = buildStatsDashboard({ ...input, filter: 'week' });

  const areas: ActivityArea[] = [
    {
      id: 'tasks',
      label: 'ورد اليوم',
      score: week.tasksCompletedInRange + Math.round(week.taskCompletionRate / 10),
      route: '/tasks',
      detail: `${week.tasksCompletedInRange} مهمة خلال الأسبوع ونسبة إنجاز حالية ${week.taskCompletionRate}%.`,
    },
    {
      id: 'azkar',
      label: 'الأذكار',
      score: week.azkarCompletedInRange + (week.azkarActiveDays * 2),
      route: '/azkar',
      detail: `${week.azkarCompletedInRange} ذكرًا مكتملًا و${week.azkarActiveDays} أيام نشطة.`,
    },
    {
      id: 'quran',
      label: 'القرآن',
      score: Math.round(week.quranVersesInRange / 10) + (week.quranActiveDays * 3),
      route: '/quran',
      detail: `${week.quranVersesInRange} آية تقريبًا و${week.quranActiveDays} أيام قراءة.`,
    },
    {
      id: 'masbaha',
      label: 'المسبحة',
      score: Math.round(week.masbahaCountInRange / 33) + (week.masbahaStreak * 4),
      route: '/masbaha',
      detail: `${week.masbahaCountInRange} تسبيحة خلال الأسبوع وسلسلة ${week.masbahaStreak} أيام.`,
    },
    {
      id: 'duas',
      label: 'الأدعية',
      score: week.duasCompletedInRange + (week.duasActiveDays * 2),
      route: '/duas',
      detail: `${week.duasCompletedInRange} دعاء مكتمل و${week.duasActiveDays} أيام حضور.`,
    },
    {
      id: 'names',
      label: 'الأسماء الحسنى',
      score: week.namesCompletedInRange + (week.namesActiveDays * 2),
      route: '/names-of-allah',
      detail: `${week.namesCompletedInRange} اسمًا مراجعًا و${week.namesActiveDays} أيام مراجعة.`,
    },
  ];

  return areas.sort((left, right) => right.score - left.score)[0] ?? areas[0];
}

function getNextFocus(input: BuildStatsInput): WeeklyReflection['focus'] {
  const today = buildStatsDashboard({ ...input, filter: 'day' });

  if (today.taskCompletionRate < 100) {
    return {
      title: 'أكمل ما تبقى من ورد اليوم',
      body: 'المهام غير المكتملة هي أقرب خطوة واضحة الآن، وهي أفضل نقطة بداية قبل فتح أقسام إضافية.',
      ctaLabel: 'افتح المهام',
      to: '/tasks',
    };
  }

  if (today.azkarCompletedToday === 0) {
    return {
      title: 'ثبّت اليوم بذكر قصير',
      body: 'جلسة أذكار قصيرة الآن ستمنحك بداية أوضح وتدفع بقية اليوم إلى الهدوء والثبات.',
      ctaLabel: 'ابدأ الأذكار',
      to: '/azkar',
    };
  }

  if (today.quranVersesToday === 0) {
    return {
      title: 'استأنف القراءة قبل أن يبرد الإيقاع',
      body: today.lastReadSurahName
        ? `آخر سورة محفوظة لديك هي ${today.lastReadSurahName}، والعودة إليها الآن أقل مقاومة من البدء من جديد.`
        : 'ورد قرآني قصير الآن يكفي للحفاظ على الحضور بدون ضغط.',
      ctaLabel: 'افتح القرآن',
      to: '/quran',
    };
  }

  if (today.namesCompletedToday === 0) {
    return {
      title: 'راجع اسمًا واحدًا اليوم',
      body: 'مراجعة اسم واحد من أسماء الله الحسنى تضيف جرعة خفيفة من المعنى بدون تشتيت.',
      ctaLabel: 'افتح الأسماء',
      to: '/names-of-allah',
    };
  }

  if (today.duasCompletedToday === 0) {
    return {
      title: 'اختر دعاءً واحدًا محفوظًا',
      body: 'دعاء واحد تؤديه اليوم أفضل من قائمة طويلة تمر عليها دون حضور.',
      ctaLabel: 'افتح الأدعية',
      to: '/duas',
    };
  }

  if (today.masbahaTodayCount < 33) {
    return {
      title: 'جلسة تسبيح قصيرة تكمل الصورة',
      body: 'التسبيح الآن هو أقصر حلقة داعمة تكمل يومك دون جهد ذهني كبير.',
      ctaLabel: 'افتح المسبحة',
      to: '/masbaha',
    };
  }

  return {
    title: 'اليوم متوازن.. وسّعه بلطف',
    body: 'يمكنك الآن أن تضيف شيئًا خفيفًا مثل قصة قصيرة أو مراجعة هادئة دون ضغط.',
    ctaLabel: 'افتح القصص',
    to: '/stories',
  };
}

export function buildWeeklyReflection(input: BuildStatsInput): WeeklyReflection {
  const week = buildStatsDashboard({ ...input, filter: 'week' });
  const strongest = getStrongestArea(input);
  const focus = getNextFocus(input);

  const title = week.activeDays >= 7
    ? 'ثباتك هذا الأسبوع واضح جدًا'
    : week.activeDays >= 4
      ? 'الأسبوع يسير بإيقاع جيد'
      : 'الأسبوع يحتاج بداية ألطف وأوضح';

  const summary = week.activeDays >= 7
    ? `حافظت على سلسلة نشاط قدرها ${week.activeDays} أيام، وأقوى حضور لديك كان في ${strongest.label}.`
    : week.activeDays >= 4
      ? `لديك سلسلة نشاط قدرها ${week.activeDays} أيام، وأكثر ما ظهر هذا الأسبوع هو ${strongest.label}.`
      : `نشاطك الحالي ${week.activeDays} أيام فقط، وأفضل نقطة لإعادة تثبيت الإيقاع هي ${strongest.label}.`;

  const highlights = [
    `الأقوى هذا الأسبوع: ${strongest.label}.`,
    `معدل إنجاز المهام الحالية: ${week.taskCompletionRate}%.`,
    week.lastReadSurahName
      ? `آخر موضع محفوظ في القرآن: سورة ${week.lastReadSurahName}.`
      : 'لا يوجد موضع قراءة محفوظ حاليًا في القرآن.',
  ];

  return {
    title,
    summary,
    highlights,
    strongestAreaLabel: strongest.label,
    strongestAreaDetail: strongest.detail,
    activeDays: week.activeDays,
    focus,
  };
}

export function buildStatsInsights(input: BuildStatsInput): StatsInsight[] {
  const reflection = buildWeeklyReflection(input);
  const week = buildStatsDashboard({ ...input, filter: 'week' });

  return [
    {
      id: 'strongest-habit',
      title: `أقوى ما تحافظ عليه الآن: ${reflection.strongestAreaLabel}`,
      body: reflection.strongestAreaDetail,
      tone: 'emerald',
    },
    {
      id: 'consistency',
      title: 'سلسلة النشاط الحالية',
      body: week.activeDays > 0
        ? `لديك حضور متصل منذ ${week.activeDays} يومًا. ثبّت هذا الإيقاع بخطوة صغيرة اليوم.`
        : 'لا توجد سلسلة نشاط حالية. ابدأ اليوم بخطوة واحدة فقط ثم دع التتابع يبني نفسه.',
      tone: week.activeDays >= 4 ? 'sky' : 'amber',
    },
    {
      id: 'next-step',
      title: reflection.focus.title,
      body: reflection.focus.body,
      tone: 'sky',
    },
  ];
}
