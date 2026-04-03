export interface HomeSetupItem {
  id: 'tasks' | 'ritual' | 'reading';
  title: string;
  body: string;
  to: string;
  ctaLabel: string;
  isComplete: boolean;
}

export interface HomeSetupCardModel {
  shouldShow: boolean;
  title: string;
  body: string;
  primaryTo: string;
  primaryLabel: string;
  steps: HomeSetupItem[];
}

interface BuildHomeSetupInput {
  dismissed: boolean;
  completedTasks: number;
  azkarTodayCount: number;
  quranTodayReadings: number;
  masbahaTodayCount: number;
  duasTodayCount: number;
  namesTodayCount: number;
  hasQuranBookmark: boolean;
  hasRecentAzkar: boolean;
  hasRecentDua: boolean;
  hasRecentName: boolean;
  hasCustomizedReading: boolean;
}

const EMPTY_MODEL: HomeSetupCardModel = {
  shouldShow: false,
  title: '',
  body: '',
  primaryTo: '/tasks',
  primaryLabel: 'ابدأ',
  steps: [],
};

export function buildHomeSetupCard(input: BuildHomeSetupInput): HomeSetupCardModel {
  const steps: HomeSetupItem[] = [
    {
      id: 'tasks',
      title: 'ثبّت ورد اليوم',
      body: 'ابدأ بخطوة واحدة واضحة حتى تعرف ما الذي ستعود له كل يوم.',
      to: '/tasks',
      ctaLabel: 'جهّز الورد',
      isComplete: input.completedTasks > 0,
    },
    {
      id: 'ritual',
      title: 'ابدأ جلسة قصيرة',
      body: 'افتح الأذكار أو القرآن وابدأ جلسة خفيفة بدل التصفح العشوائي.',
      to: input.hasQuranBookmark ? '/quran' : '/azkar',
      ctaLabel: input.hasQuranBookmark ? 'تابع القرآن' : 'ابدأ الأذكار',
      isComplete:
        input.azkarTodayCount > 0 ||
        input.quranTodayReadings > 0 ||
        input.masbahaTodayCount > 0 ||
        input.duasTodayCount > 0 ||
        input.namesTodayCount > 0 ||
        input.hasQuranBookmark ||
        input.hasRecentAzkar ||
        input.hasRecentDua ||
        input.hasRecentName,
    },
    {
      id: 'reading',
      title: 'اضبط تجربة القراءة',
      body: 'اختر الثيم وحجم النص وتباعد السطور حتى تصبح العودة يوميًا أريح.',
      to: '/settings',
      ctaLabel: 'افتح الإعدادات',
      isComplete: input.hasCustomizedReading,
    },
  ];

  const hasStartedCoreLoop = steps[0]?.isComplete || steps[1]?.isComplete;
  const firstIncomplete = steps.find((step) => !step.isComplete) ?? steps[0];

  if (input.dismissed || hasStartedCoreLoop) {
    return {
      ...EMPTY_MODEL,
      steps,
    };
  }

  return {
    shouldShow: true,
    title: 'ابدأ بخطوات قليلة وواضحة',
    body: 'هيّئ التطبيق مرة واحدة ثم اجعل العودة اليومية أخف وأوضح بدل التنقل العشوائي بين الأقسام.',
    primaryTo: firstIncomplete?.to ?? '/tasks',
    primaryLabel: firstIncomplete?.ctaLabel ?? 'ابدأ الإعداد السريع',
    steps,
  };
}
