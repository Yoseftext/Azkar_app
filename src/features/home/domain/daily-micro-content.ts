import { DUA_CATEGORY_SUMMARY } from '@/content/duas/generated/summary.js';
import { getDayIndex } from '@/shared/lib/date';
import type { LoadedAllahName } from '@/content/loaders/load-names';

const DAILY_REMINDERS = [
  'قال ﷺ: «مَن قال سبحان الله وبحمده في يوم مئة مرة، حُطّت خطاياه وإن كانت مثل زبد البحر».',
  '«ذِكْرُ الله شفاء القلوب» — اجعل أول ما تبدأ به يومك ذكر الله.',
  'قال ﷺ: «أحبّ الأعمال إلى الله أدومها وإن قلّ» — الثبات أولى من الاندفاع.',
  'خصص لنفسك وِرداً يومياً ثابتاً ولو دقائق قليلة، فالقليل الدائم يبني عادة صالحة.',
  '«اللهم أعنّي على ذكرك وشكرك وحسن عبادتك» — دعاء صغير لكن أثره كبير على يومك.',
  'تذكّر: أذكار الصباح والمساء درع حصين — لا تؤجلها لما بعد الانشغال.',
  'قراءة آيات يسيرة كل يوم تصنع صلة ثابتة بالقرآن ولو بخطوات صغيرة.',
] as const;

export interface DailyMicroContentCard {
  id: 'zikr' | 'dua' | 'name';
  title: string;
  body: string;
  to: string;
  ctaLabel: string;
}

function shortenText(value: string, maxLength: number): string {
  const normalized = value.replace(/\s+/g, ' ').trim();
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength).trimEnd()}…`;
}

export function buildDailyMicroContent(items: LoadedAllahName[]): DailyMicroContentCard[] {
  const reminder = DAILY_REMINDERS[getDayIndex(17) % DAILY_REMINDERS.length] ?? DAILY_REMINDERS[0];
  const featuredDua = DUA_CATEGORY_SUMMARY[getDayIndex(29) % DUA_CATEGORY_SUMMARY.length] ?? DUA_CATEGORY_SUMMARY[0] ?? null;
  const featuredName = items.length > 0 ? items[getDayIndex(99) % items.length] ?? items[0] : null;

  return [
    {
      id: 'zikr',
      title: 'ذكر اليوم',
      body: shortenText(reminder, 120),
      to: '/azkar',
      ctaLabel: 'افتح الأذكار',
    },
    {
      id: 'dua',
      title: 'دعاء اليوم',
      body: shortenText(featuredDua?.preview ?? 'اختر دعاءً قصيرًا يناسب حالتك اليوم، واجعله جزءًا من وردك.', 120),
      to: '/duas',
      ctaLabel: 'افتح الأدعية',
    },
    {
      id: 'name',
      title: 'اسم اليوم',
      body: featuredName ? `${featuredName.name}: ${shortenText(featuredName.description, 90)}` : 'راجع اسمًا من أسماء الله الحسنى اليوم، وتأمل أثره العملي في يومك.',
      to: '/names-of-allah',
      ctaLabel: 'افتح الأسماء الحسنى',
    },
  ];
}
