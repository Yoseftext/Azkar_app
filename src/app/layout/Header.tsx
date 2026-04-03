/**
 * ====================================================================
 * Header — رأس التطبيق
 * ====================================================================
 * إصلاح BUG-V3-06 (جزئي):
 *   حُذف النص الثابت "نسخة Production-ready foundation"
 *   واستُبدل بـ tagline مناسب للمستخدم.
 * ====================================================================
 */
import { AppButtonLink } from '@/shared/ui/primitives/AppButtonLink';
import { useAuthStore } from '@/kernel/auth/auth-store';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  // OPT-V3-03: selector محدد — لا يُعيد render عند تغيير أي خاصية أخرى في user
  const displayName = useAuthStore((s) => s.user?.displayName ?? null);
  const isReady     = useAuthStore((s) => s.isReady);

  return (
    <header className="rounded-[28px] border border-white/60 bg-white/85 p-4 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/85">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-sky-600 dark:text-sky-400">أذكار المسلم</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-50">{title}</h1>
          {subtitle ? (
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{subtitle}</p>
          ) : null}
        </div>
        <div className="min-w-0 space-y-2 text-left">
          <div className="flex justify-end">
            <AppButtonLink to="/search" variant="outline" size="sm" className="min-w-[44px] px-3">
              🔎 البحث
            </AppButtonLink>
          </div>
          {isReady ? (
            <>
              <p className="text-xs text-slate-500 dark:text-slate-400">الحساب</p>
              <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
                {displayName ?? 'زائر'}
              </p>
            </>
          ) : null}
        </div>
      </div>
    </header>
  );
}
