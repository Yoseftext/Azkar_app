import { NavLink } from 'react-router-dom';
import { AppCard } from '@/shared/ui/primitives/AppCard';
import { migrationTasks } from '@/shared/constants/migration-tasks';
import { useTasksStore } from '@/features/tasks/state/tasks-store';
import { useMasbahaStore } from '@/features/masbaha/state/masbaha-store';
import { useQuranStore } from '@/features/quran/state/quran-store';
import { useAzkarStore } from '@/features/azkar/state/azkar-store';
import { useDuasStore } from '@/features/duas/state/duas-store';
import { useStoriesStore } from '@/features/stories/state/stories-store';
import { useNamesOfAllahStore } from '@/features/names-of-allah/state/names-store';
import { getLocalDateKey } from '@/shared/lib/date';

const quickAccess = [
  { to: '/azkar', title: 'الأذكار', body: 'تصفح التصنيفات اليومية وتتبع المنجز.' },
  { to: '/tasks', title: 'المهام', body: 'وردك اليومي والمهام الشخصية.' },
  { to: '/quran', title: 'القرآن', body: 'واجهة القراءة والعودة لاحقًا.' },
  { to: '/masbaha', title: 'المسبحة', body: 'جلسة التسبيح والهدف الحالي.' },
  { to: '/stats', title: 'الإحصائيات', body: 'كل النشاط مشتق من stores منفصلة.' },
  { to: '/duas', title: 'الأدعية', body: 'فئات الأدعية مع المفضلة والتقدم اليومي.' },
  { to: '/stories', title: 'القصص', body: 'قصص طويلة مع العبرة والمفضلة والتقدم اليومي.' },
  { to: '/names-of-allah', title: 'الأسماء الحسنى', body: 'مراجعة الأسماء مع المفضلة والتقدم اليومي.' },
  { to: '/settings', title: 'الإعدادات', body: 'الثيم وتسجيل الدخول.' },
  { to: '/profile', title: 'الملف', body: 'حالة الجلسة الحالية وروابط الحساب والسياسات.' },
  { to: '/about', title: 'عن التطبيق', body: 'الصفحات التعريفية والقانونية داخل نفس المسار.' },
  { to: '/contact', title: 'تواصل', body: 'الدعم والاقتراحات والقنوات الرسمية.' },
] as const;

const dailyMessages = [
  'الواجهة الرئيسية الآن مشتقة من stores runtime بدل سحب datasets كبيرة داخل الـ bundle الأساسي.',
  'ابدأ من المهام أو الأذكار، ثم دع الإحصائيات تبني القراءة الكاملة لنشاطك.',
  'Firebase هنا للتسجيل فقط؛ البيانات اليومية تبقى local-first ومعزولة عن أي sync قديم.',
  'إضافة section جديدة لاحقًا أصبحت composition عبر registry، وليست تعديلًا في orchestrator ضخم.',
];

export function HomePage() {
  const todayKey = getLocalDateKey();
  const taskItems = useTasksStore((state) => state.items);
  const taskDailyCompletions = useTasksStore((state) => state.dailyCompletions[todayKey] ?? []);
  const masbahaTodayCount = useMasbahaStore((state) => state.dailyCounts[todayKey] ?? 0);
  const masbahaTarget = useMasbahaStore((state) => state.currentTarget);
  const azkarTodayCount = useAzkarStore((state) => state.completedByDate[todayKey]?.length ?? 0);
  const duasTodayCount = useDuasStore((state) => state.completedByDate[todayKey]?.length ?? 0);
  const favoriteDuasCount = useDuasStore((state) => state.favoriteIds.length);
  const storiesTodayCount = useStoriesStore((state) => state.completedByDate[todayKey]?.length ?? 0);
  const favoriteStoriesCount = useStoriesStore((state) => state.favoriteIds.length);
  const recentStoryIds = useStoriesStore((state) => state.recentStoryIds);
  const storyCategories = useStoriesStore((state) => state.categories);
  const quranBookmark = useQuranStore((state) => state.bookmark);
  const quranTodayReadings = useQuranStore((state) => state.dailyReadings[todayKey]?.length ?? 0);
  const namesTodayCount = useNamesOfAllahStore((state) => state.completedByDate[todayKey]?.length ?? 0);
  const favoriteNamesCount = useNamesOfAllahStore((state) => state.favoriteIds.length);

  const totalTasks = taskItems.length;
  const currentCompletedTasks = taskItems.filter((item) => item.completed).length;
  const progressPercent = totalTasks === 0 ? 0 : Math.round((currentCompletedTasks / totalTasks) * 100);
  const latestStory = recentStoryIds
    .map((storyId) => storyCategories.flatMap((category) => category.items).find((item) => item.id === storyId))
    .find(Boolean) ?? null;
  const message = dailyMessages[new Date().getDate() % dailyMessages.length] ?? dailyMessages[0];

  return (
    <div className="space-y-4">
      <AppCard title="لوحة اليوم" subtitle="Home dashboard مشتقة من stores الجديدة بدل الاعتماد على eager content imports داخل الصفحة الرئيسية.">
        <p className="text-sm leading-7 text-slate-700 dark:text-slate-200">{message}</p>

        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-7">
          <DashboardMetricCard label="المهام الحالية" value={`${currentCompletedTasks}/${totalTasks}`} hint={`نسبة الإنجاز ${progressPercent}%`} />
          <DashboardMetricCard label="أذكار اليوم" value={String(azkarTodayCount)} hint="المؤشّر كمكتمل اليوم" />
          <DashboardMetricCard label="تسبيح اليوم" value={String(masbahaTodayCount)} hint={`الهدف الحالي ${masbahaTarget}`} />
          <DashboardMetricCard label="أدعية اليوم" value={String(duasTodayCount)} hint={`المفضلة ${favoriteDuasCount}`} />
          <DashboardMetricCard label="قصص اليوم" value={String(storiesTodayCount)} hint={`المفضلة ${favoriteStoriesCount}`} />
          <DashboardMetricCard label="أسماء اليوم" value={String(namesTodayCount)} hint={`المفضلة ${favoriteNamesCount}`} />
          <DashboardMetricCard label="القرآن" value={quranBookmark?.surahName ?? 'لا توجد علامة'} hint={`${quranTodayReadings} سورة/سور اليوم`} />
        </div>
      </AppCard>

      <AppCard title="وصول سريع">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {quickAccess.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4 text-right transition hover:border-sky-400 hover:bg-sky-50 dark:border-slate-700 dark:bg-slate-800/70 dark:hover:border-sky-600 dark:hover:bg-slate-800"
            >
              <p className="text-sm font-bold text-slate-900 dark:text-slate-50">{item.title}</p>
              <p className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400">{item.body}</p>
            </NavLink>
          ))}
        </div>
      </AppCard>

      <AppCard title="جاهز للإكمال" subtitle="هذه البطاقات تختصر أين يجب أن تذهب الآن بدل فتح أقسام عشوائيًا.">
        <div className="grid gap-3 md:grid-cols-6">
          <FocusCard title="الأذكار" body={azkarTodayCount > 0 ? `أكملت ${azkarTodayCount} ذكرًا اليوم. أكمل التصنيفات المتبقية.` : 'ابدأ بأذكار الصباح أو المساء وسجّل التقدم اليومي.'} to="/azkar" />
          <FocusCard title="الأدعية" body={duasTodayCount > 0 ? `أنجزت ${duasTodayCount} دعاءً اليوم، والمفضلة الحالية ${favoriteDuasCount}.` : 'ابدأ بفئة دعاء وحدد المفضلة لتصبح العودة لها أسرع.'} to="/duas" />
          <FocusCard title="المهام" body={taskDailyCompletions.length > 0 ? `أنجزت ${taskDailyCompletions.length} مهمة اليوم.` : 'راجع مهام الورد أو أضف مهمة شخصية جديدة.'} to="/tasks" />
          <FocusCard title="القصص" body={latestStory ? `آخر قصة فتحتها: ${latestStory.title}.` : storiesTodayCount > 0 ? `قرأت ${storiesTodayCount} قصة اليوم.` : 'افتح قصة واحفظ المفضلة لتصبح العودة إليها أسرع.'} to="/stories" />
          <FocusCard title="الأسماء الحسنى" body={namesTodayCount > 0 ? `راجعت ${namesTodayCount} اسمًا اليوم، والمفضلة الحالية ${favoriteNamesCount}.` : 'افتح أسماء الله الحسنى واختر ما تريد مراجعته أو إضافته إلى المفضلة.'} to="/names-of-allah" />
          <FocusCard title="القرآن" body={quranBookmark ? `آخر موضع محفوظ: ${quranBookmark.surahName}.` : 'افتح سورة لتفعيل bookmark/resume وتتبع القراءة.'} to="/quran" />
        </div>
      </AppCard>

      <AppCard title="لوحة التنفيذ الحالية" subtitle="كل إعادة البناء تسير على مهمات واضحة وليست تعديلات مرتجلة.">
        <div className="grid gap-4 md:grid-cols-3">
          <TaskColumn title="تم" items={migrationTasks.done} tone="done" />
          <TaskColumn title="قيد التنفيذ" items={migrationTasks.inProgress} tone="progress" />
          <TaskColumn title="التالي" items={migrationTasks.next} tone="next" />
        </div>
      </AppCard>
    </div>
  );
}

interface DashboardMetricCardProps {
  label: string;
  value: string;
  hint: string;
}

function DashboardMetricCard({ label, value, hint }: DashboardMetricCardProps) {
  return (
    <div className="rounded-3xl bg-slate-50 p-3 dark:bg-slate-800/70">
      <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-2 text-lg font-bold text-slate-900 dark:text-slate-50">{value}</p>
      <p className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400">{hint}</p>
    </div>
  );
}

interface FocusCardProps {
  title: string;
  body: string;
  to: string;
}

function FocusCard({ title, body, to }: FocusCardProps) {
  return (
    <NavLink
      to={to}
      className="rounded-[28px] border border-slate-200 bg-slate-50 px-4 py-4 transition hover:border-sky-300 hover:bg-sky-50 dark:border-slate-700 dark:bg-slate-800/70 dark:hover:border-sky-700 dark:hover:bg-slate-800"
    >
      <p className="text-sm font-bold text-slate-900 dark:text-slate-50">{title}</p>
      <p className="mt-2 text-xs leading-6 text-slate-500 dark:text-slate-400">{body}</p>
    </NavLink>
  );
}

interface TaskColumnProps {
  title: string;
  items: readonly string[];
  tone: 'done' | 'progress' | 'next';
}

function TaskColumn({ title, items, tone }: TaskColumnProps) {
  const toneClass = {
    done: 'bg-emerald-50 dark:bg-emerald-950/30',
    progress: 'bg-sky-50 dark:bg-sky-950/30',
    next: 'bg-amber-50 dark:bg-amber-950/30',
  }[tone];

  return (
    <div className={`rounded-3xl p-3 ${toneClass}`.trim()}>
      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-50">{title}</h3>
      <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-700 dark:text-slate-200">
        {items.map((item) => (
          <li key={item} className="rounded-2xl bg-white/70 px-3 py-2 dark:bg-slate-900/50">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
