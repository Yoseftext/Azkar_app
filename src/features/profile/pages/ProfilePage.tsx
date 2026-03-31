import { NavLink } from 'react-router-dom';
import { AppCard } from '@/shared/ui/primitives/AppCard';
import { useAuthStore } from '@/kernel/auth/auth-store';
import { usePreferencesStore } from '@/kernel/preferences/preferences-store';

const profileLinks = [
  { to: '/settings', title: 'الإعدادات', body: 'إدارة الثيم وتسجيل الدخول والخروج من نفس مسار التطبيق.' },
  { to: '/privacy', title: 'سياسة الخصوصية', body: 'راجع كيف تبقى البيانات local-first وما دور Firebase Auth فقط.' },
  { to: '/about', title: 'عن التطبيق', body: 'مخطط البنية الحالية والحدود المعمارية في النسخة الجديدة.' },
  { to: '/contact', title: 'تواصل معنا', body: 'الإبلاغ عن مشكلة أو اقتراح ميزة/قسم جديد.' },
] as const;

export function ProfilePage() {
  const user = useAuthStore((state) => state.user);
  const isReady = useAuthStore((state) => state.isReady);
  const isConfigured = useAuthStore((state) => state.isConfigured);
  const themeMode = usePreferencesStore((state) => state.themeMode);

  const sessionState = !isReady
    ? { label: 'جاري التهيئة', hint: 'يتم التأكد من جلسة الدخول الحالية قبل عرض الحالة النهائية.' }
    : !isConfigured
      ? { label: 'غير مهيأ', hint: 'تسجيل الدخول غير مفعل في البيئة الحالية، وسيبقى التطبيق usable بوضع local-first.' }
      : user
        ? { label: 'جلسة نشطة', hint: 'Firebase Auth تستخدم هنا لتسجيل الدخول فقط، بدون Firestore أو مزامنة cloud.' }
        : { label: 'جاهز بدون جلسة', hint: 'البيئة مهيأة، لكن لا توجد جلسة دخول حالية. يمكنك فتح الإعدادات لتسجيل الدخول عند الحاجة.' };

  return (
    <div className="space-y-4">
      <AppCard title="الملف الشخصي" subtitle="هذا القسم يعرض snapshot واضحة للحساب الحالي، مع إبقاء actions نفسها داخل settings لتجنب God page جديدة.">
        <div className="flex items-center gap-4">
          <img
            src={user?.photoURL ?? '/assets/images/avatar.png'}
            alt="avatar"
            className="h-16 w-16 rounded-full border border-slate-200 object-cover dark:border-slate-700"
          />
          <div>
            <p className="text-base font-semibold text-slate-900 dark:text-slate-50">{user?.displayName ?? 'زائر'}</p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{user?.email ?? 'بدون جلسة دخول حالياً'}</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
          <ProfileMetric label="الحالة" value={sessionState.label} hint={sessionState.hint} />
          <ProfileMetric label="المظهر الحالي" value={themeMode} hint="القراءة فقط هنا؛ التعديل يبقى في صفحة الإعدادات." />
          <ProfileMetric label="المعرّف الحالي" value={user?.uid ?? 'guest'} hint="معرّف الجلسة الحالية فقط؛ لا توجد مزامنة سحابية خلف الكواليس." />
          <ProfileMetric label="مصدر الحساب" value={isConfigured ? 'Firebase Auth فقط' : 'غير مفعّل'} hint="لا نستخدم Firestore في هذه البنية الجديدة." />
        </div>
      </AppCard>

      <AppCard title="قراءة هندسية سريعة" subtitle="الملف الشخصي يستهلك auth/preferences snapshots فقط، ولا يحتوي منطق sign-in/sign-out نفسه.">
        <ul className="space-y-2 text-sm leading-6 text-slate-700 dark:text-slate-200">
          <li className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800/80">
            حالة الجلسة = {sessionState.label}. {sessionState.hint}
          </li>
          <li className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800/80">
            هذا القسم لا يخلط auth actions مع display-only profile view؛ تنفيذ الدخول والخروج يبقى داخل الإعدادات.
          </li>
          <li className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800/80">
            التخزين يظل local-first، وحتى مع وجود حساب مسجل لا توجد Firestore sync ولا merge logic legacy.
          </li>
        </ul>
      </AppCard>

      <AppCard title="انتقالات سريعة" subtitle="روابط مرتبطة بالحساب والسياسات بدون مغادرة shell الموحدة.">
        <div className="grid gap-3 md:grid-cols-2">
          {profileLinks.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className="rounded-[28px] border border-slate-200 bg-slate-50 px-4 py-4 transition hover:border-sky-300 hover:bg-sky-50 dark:border-slate-700 dark:bg-slate-800/70 dark:hover:border-sky-700 dark:hover:bg-slate-800"
            >
              <p className="text-sm font-bold text-slate-900 dark:text-slate-50">{item.title}</p>
              <p className="mt-2 text-xs leading-6 text-slate-500 dark:text-slate-400">{item.body}</p>
            </NavLink>
          ))}
        </div>
      </AppCard>
    </div>
  );
}

interface ProfileMetricProps {
  label: string;
  value: string;
  hint: string;
}

function ProfileMetric({ label, value, hint }: ProfileMetricProps) {
  return (
    <div className="rounded-3xl bg-slate-50 p-3 dark:bg-slate-800/70">
      <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-2 text-lg font-bold text-slate-900 dark:text-slate-50">{value}</p>
      <p className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400">{hint}</p>
    </div>
  );
}
