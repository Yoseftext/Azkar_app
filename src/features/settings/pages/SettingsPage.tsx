import { NavLink } from 'react-router-dom';
import { AppCard } from '@/shared/ui/primitives/AppCard';
import { usePreferencesStore } from '@/kernel/preferences/preferences-store';
import { useAuthStore } from '@/kernel/auth/auth-store';
import type { ThemeMode } from '@/kernel/preferences/preferences-types';

const themes: ThemeMode[] = ['light', 'dark', 'system'];

export function SettingsPage() {
  const themeMode = usePreferencesStore((state) => state.themeMode);
  const setThemeMode = usePreferencesStore((state) => state.setThemeMode);
  const isConfigured = useAuthStore((state) => state.isConfigured);
  const user = useAuthStore((state) => state.user);
  const signIn = useAuthStore((state) => state.signIn);
  const signOut = useAuthStore((state) => state.signOut);

  return (
    <div className="space-y-4">
      <AppCard title="المظهر" subtitle="الوضعيات الوحيدة المسموح بها: light, dark, system.">
        <div className="grid grid-cols-3 gap-2">
          {themes.map((theme) => (
            <button
              key={theme}
              type="button"
              onClick={() => setThemeMode(theme)}
              className={[
                'rounded-2xl px-3 py-3 text-sm font-semibold capitalize transition',
                themeMode === theme
                  ? 'bg-sky-600 text-white'
                  : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
              ].join(' ')}
            >
              {theme}
            </button>
          ))}
        </div>
      </AppCard>

      <AppCard title="تسجيل الدخول" subtitle="Firebase في هذه البنية الجديدة مخصص لـ Google Sign-In فقط.">
        {!isConfigured ? (
          <p className="text-sm leading-6 text-amber-700 dark:text-amber-300">
            أضف متغيرات VITE_FIREBASE_* في ملف البيئة لتفعيل تسجيل الدخول.
          </p>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-slate-700 dark:text-slate-200">
              {user ? `مسجل كـ ${user.displayName ?? user.email ?? 'مستخدم'}` : 'لم يتم تسجيل الدخول بعد.'}
            </p>
            <div className="flex flex-wrap gap-2">
              {!user ? (
                <button type="button" onClick={() => void signIn()} className="rounded-2xl bg-sky-600 px-4 py-3 text-sm font-semibold text-white">
                  تسجيل الدخول عبر Google
                </button>
              ) : (
                <>
                  <button type="button" onClick={() => void signOut()} className="rounded-2xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white">
                    تسجيل الخروج
                  </button>
                  <NavLink to="/profile" className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                    فتح الملف الشخصي
                  </NavLink>
                </>
              )}
            </div>
          </div>
        )}
      </AppCard>
      <AppCard title="حول التطبيق والسياسات" subtitle="الصفحات التعريفية والقانونية أصبحت موحدة داخل نفس الـ router بدل HTML مستقلة خارج shell.">
        <div className="grid gap-3 md:grid-cols-2">
          {[
            { to: '/about', title: 'عن التطبيق', body: 'الرؤية، البنية الحالية، وكيف يعمل التطبيق في نسخته الجديدة.' },
            { to: '/privacy', title: 'سياسة الخصوصية', body: 'كيف تبقى بياناتك local-first وما دور Firebase Auth فقط.' },
            { to: '/terms', title: 'شروط الاستخدام', body: 'الحدود العامة لاستخدام التطبيق والمحتوى.' },
            { to: '/contact', title: 'تواصل معنا', body: 'الدعم والاقتراحات والقنوات الرسمية الحالية بدل روابط خارجية مشتتة.' },
          ].map((item) => (
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
