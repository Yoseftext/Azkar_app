import { useAuthStore } from '@/kernel/auth/auth-store';

interface HeaderProps {
  title: string;
  subtitle: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  const user = useAuthStore((state) => state.user);

  return (
    <header className="rounded-[28px] border border-white/60 bg-white/85 p-4 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/85">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-sky-600 dark:text-sky-400">نسخة Production-ready foundation</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-50">{title}</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{subtitle}</p>
        </div>
        <div className="min-w-0 text-left">
          <p className="text-xs text-slate-500 dark:text-slate-400">الحساب</p>
          <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
            {user?.displayName ?? 'زائر'}
          </p>
        </div>
      </div>
    </header>
  );
}
