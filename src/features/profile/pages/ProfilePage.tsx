import { AppCard } from '@/shared/ui/primitives/AppCard';
import { InteractiveTile } from '@/shared/ui/primitives/InteractiveTile';
import { StatTile } from '@/shared/ui/primitives/StatTile';
import { useAuthStore } from '@/kernel/auth/auth-store';
import { usePreferencesStore } from '@/kernel/preferences/preferences-store';
import { COLOR_THEME_SUMMARY_LABELS, THEME_MODE_SUMMARY_LABELS, TEXT_SIZE_LABELS } from '@/kernel/preferences/preferences-labels';
import { useTasksStore } from '@/features/tasks/state/tasks-store';
import { useMasbahaStore } from '@/features/masbaha/state/masbaha-store';
import { useQuranStore } from '@/features/quran/state/quran-store';
import { useAzkarStore } from '@/features/azkar/state/azkar-store';
import { useDuasStore } from '@/features/duas/state/duas-store';
import { useNamesOfAllahStore } from '@/features/names-of-allah/state/names-store';
import { getLocalDateKey } from '@/shared/lib/date';
import { buildDailyPlan } from '@/features/home/domain/daily-plan';
import { buildWeeklyReflection } from '@/features/stats/domain/stats-reflection';
import { buildProfileHub } from '@/features/profile/domain/profile-hub';
import { ProfileHubCard } from '@/features/profile/components/ProfileHubCard';

const PROFILE_LINKS = [
  { to: '/settings', title: 'الإعدادات', body: 'المظهر، النسخ الاحتياطي، وتسجيل الدخول' },
  { to: '/stats', title: 'الإحصائيات', body: 'انعكاسك الأسبوعي وملخص نشاطك' },
  { to: '/achievements', title: 'الإنجازات', body: 'تابع تقدّمك وافتح الإنجازات' },
  { to: '/privacy', title: 'سياسة الخصوصية', body: 'كيف نحمي بياناتك' },
  { to: '/contact', title: 'تواصل معنا', body: 'الدعم والاقتراحات' },
] as const;

export function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const isReady = useAuthStore((s) => s.isReady);
  const isConfigured = useAuthStore((s) => s.isConfigured);
  const themeMode = usePreferencesStore((s) => s.themeMode);
  const colorTheme = usePreferencesStore((s) => s.colorTheme);
  const textSize = usePreferencesStore((s) => s.textSize);

  const taskItems = useTasksStore((s) => s.items);
  const dailyCompletions = useTasksStore((s) => s.dailyCompletions);
  const masbahaTarget = useMasbahaStore((s) => s.currentTarget);
  const masbahaTodayCount = useMasbahaStore((s) => s.dailyCounts[getLocalDateKey()] ?? 0);
  const masbahaDailyCounts = useMasbahaStore((s) => s.dailyCounts);
  const masbahaTotalCount = useMasbahaStore((s) => s.totalCount);
  const azkarByDate = useAzkarStore((s) => s.completedByDate);
  const quranBookmark = useQuranStore((s) => s.bookmark);
  const quranDailyReadings = useQuranStore((s) => s.dailyReadings);
  const duasByDate = useDuasStore((s) => s.completedByDate);
  const favoriteDuaIds = useDuasStore((s) => s.favoriteIds);
  const namesByDate = useNamesOfAllahStore((s) => s.completedByDate);
  const favoriteNameIds = useNamesOfAllahStore((s) => s.favoriteIds);

  const accountStatus = !isReady
    ? 'جاري التحقق…'
    : !isConfigured
      ? 'وضع محلي'
      : user
        ? 'جلسة نشطة'
        : 'غير مسجّل';

  const todayKey = getLocalDateKey();
  const completedTasks = dailyCompletions[todayKey]?.length ?? 0;
  const firstIncompleteTaskTitle = taskItems.find((item) => !item.completed)?.title ?? null;
  const dailyPlan = buildDailyPlan({
    totalTasks: taskItems.length,
    completedTasks,
    firstIncompleteTaskTitle,
    masbahaTodayCount,
    masbahaTarget,
    azkarTodayCount: azkarByDate[todayKey]?.length ?? 0,
    duasTodayCount: duasByDate[todayKey]?.length ?? 0,
    namesTodayCount: namesByDate[todayKey]?.length ?? 0,
    quranTodayReadings: quranDailyReadings[todayKey]?.length ?? 0,
    quranBookmark,
  });

  const reflection = buildWeeklyReflection({
    tasks: { items: taskItems, dailyCompletions },
    masbaha: { currentTarget: masbahaTarget, totalCount: masbahaTotalCount, dailyCounts: masbahaDailyCounts },
    azkar: { completedByDate: azkarByDate },
    quran: { bookmark: quranBookmark, dailyReadings: quranDailyReadings },
    duas: { completedByDate: duasByDate, favoriteIds: favoriteDuaIds },
    stories: { completedByDate: {}, favoriteIds: [] },
    names: { completedByDate: namesByDate, favoriteIds: favoriteNameIds },
    filter: 'week',
  });

  const hubSummary = buildProfileHub(dailyPlan, reflection);

  return (
    <div className="space-y-4">
      <AppCard title="حسابك" subtitle="ملخص سريع عن الجلسة الحالية والمظهر النشط في التطبيق.">
        <div className="flex items-center gap-4">
          <img
            src={user?.photoURL ?? '/assets/images/avatar.png'}
            referrerPolicy="no-referrer"
            alt="صورة الملف الشخصي"
            className="h-16 w-16 rounded-full border border-slate-200 object-cover dark:border-slate-700"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-base font-semibold text-slate-900 dark:text-slate-50">{user?.displayName ?? 'زائر'}</p>
            <p className="mt-1 truncate text-sm text-slate-500 dark:text-slate-400">{user?.email ?? 'بدون حساب مسجّل'}</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <StatTile label="حالة الحساب" value={accountStatus} hint="آخر حالة جلسة" variant="slate" />
          <StatTile label="المظهر" value={THEME_MODE_SUMMARY_LABELS[themeMode] ?? themeMode} hint={`${COLOR_THEME_SUMMARY_LABELS[colorTheme]} • ${TEXT_SIZE_LABELS[textSize]}`} variant="sky" />
        </div>
      </AppCard>

      <ProfileHubCard summary={hubSummary} />

      <AppCard title="نظرة اليوم" subtitle="ملخص قصير يساعدك على فهم أين تقف الآن دون الدخول لكل قسم منفصلًا.">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatTile label="ورد اليوم" value={`${dailyPlan.completedTasks}/${dailyPlan.totalTasks || 0}`} hint="ما أُنجز من خطة اليوم" variant="sky" />
          <StatTile label="التسبيح اليوم" value={String(dailyPlan.masbahaTodayCount)} hint={`الهدف الحالي ${dailyPlan.masbahaTarget}`} variant="emerald" />
          <StatTile label="الأذكار اليوم" value={String(dailyPlan.azkarTodayCount)} hint="عدد الأذكار المكتملة" variant="amber" />
          <StatTile label="أيام النشاط" value={String(reflection.activeDays)} hint="سلسلة الحضور الحالية" variant="slate" />
        </div>
      </AppCard>

      <AppCard title="خيارات سريعة" subtitle="طرق مختصرة للوصول إلى الإعدادات والإنجازات وصفحات الثقة.">
        <div className="grid gap-3 md:grid-cols-2">
          {PROFILE_LINKS.map((item) => (
            <InteractiveTile key={item.to} to={item.to} title={item.title} subtitle={item.body} trailing="←" />
          ))}
        </div>
      </AppCard>
    </div>
  );
}
