import type { GuidedPlanDefinition } from '@/features/plans/domain/plan-types';

export const GUIDED_PLANS: GuidedPlanDefinition[] = [
  {
    id: 'morning-anchor-7',
    title: 'مرساة الصباح',
    subtitle: 'برنامج 7 أيام لتثبيت بداية خفيفة وواضحة كل صباح.',
    description: 'أذكار الصباح + تسبيح 33 + دعاء قصير. مناسب لمن يريد بداية ثابتة بلا حمل زائد.',
    tone: 'sky',
    focus: 'azkar',
    durationDays: 7,
    icon: '☀️',
    requirements: [
      { id: 'morning-azkar', kind: 'azkar', title: 'أكمل جلسة أذكار', body: 'افتح الأذكار وأنهِ جلسة قصيرة.', to: '/azkar', target: 1 },
      { id: 'morning-masbaha', kind: 'masbaha', title: 'سبّح 33 مرة', body: 'جلسة تسبيح قصيرة تكفي لتثبيت العادة.', to: '/masbaha', target: 33 },
      { id: 'morning-dua', kind: 'duas', title: 'اقرأ دعاءً واحدًا', body: 'اختر دعاء اليوم وأغلقه بهدوء.', to: '/duas', target: 1 },
    ],
  },
  {
    id: 'quran-light-10',
    title: 'ورد قرآن خفيف',
    subtitle: 'برنامج 10 أيام للعودة الهادئة إلى القراءة والاستمرار.',
    description: 'سورة واحدة يوميًا مع اسم من الأسماء الحسنى ليظل المعنى حاضرًا.',
    tone: 'emerald',
    focus: 'quran',
    durationDays: 10,
    icon: '📖',
    requirements: [
      { id: 'quran-read', kind: 'quran', title: 'اقرأ سورة اليوم', body: 'استأنف من آخر موضع أو افتح ورد اليوم.', to: '/quran', target: 1 },
      { id: 'quran-name', kind: 'names', title: 'راجع اسمًا واحدًا', body: 'بطاقة اسم اليوم تكفي الآن.', to: '/names-of-allah', target: 1 },
    ],
  },
  {
    id: 'names-7',
    title: 'أسماء ومعنى',
    subtitle: 'برنامج 7 أيام لتثبيت مراجعة الأسماء الحسنى بشكل بسيط.',
    description: 'اسم اليوم + دعاء واحد + لمسة تسبيح قصيرة ليصبح الورد أكثر حضورًا.',
    tone: 'amber',
    focus: 'names',
    durationDays: 7,
    icon: '✨',
    requirements: [
      { id: 'names-review', kind: 'names', title: 'راجع اسم اليوم', body: 'افتح بطاقة الاسم واقرأ المعنى.', to: '/names-of-allah', target: 1 },
      { id: 'names-dua', kind: 'duas', title: 'اختر دعاءً قصيرًا', body: 'دعاء واحد كافٍ لهذا اليوم.', to: '/duas', target: 1 },
      { id: 'names-masbaha', kind: 'masbaha', title: 'جلسة تسبيح قصيرة', body: '33 مرة تكفي لتثبيت الارتباط اليومي.', to: '/masbaha', target: 33 },
    ],
  },
  {
    id: 'steady-core-14',
    title: 'تثبيت الورد',
    subtitle: 'برنامج 14 يومًا لبناء نواة يومية تجمع بين وردك وقراءتك.',
    description: 'إغلاق ورد اليوم مع قراءة سورة واحدة. مناسب بعد ثباتك على البداية.',
    tone: 'emerald',
    focus: 'mixed',
    durationDays: 14,
    icon: '✅',
    requirements: [
      { id: 'steady-tasks', kind: 'tasks', title: 'أكمل ورد اليوم', body: 'أغلق ما تبقى من المهام اليومية.', to: '/tasks' },
      { id: 'steady-quran', kind: 'quran', title: 'اقرأ سورة اليوم', body: 'ورد قرآن خفيف يكفي للحفاظ على الاستمرارية.', to: '/quran', target: 1 },
      { id: 'steady-azkar', kind: 'azkar', title: 'جلسة أذكار', body: 'خطوة قصيرة تثبّت إيقاع اليوم.', to: '/azkar', target: 1 },
    ],
  },
];

export function getGuidedPlanById(planId: string | null | undefined) {
  if (!planId) return null;
  return GUIDED_PLANS.find((plan) => plan.id === planId) ?? null;
}
