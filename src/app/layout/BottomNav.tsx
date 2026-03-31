import { NavLink } from 'react-router-dom';
import { appSections } from '@/kernel/sections/section-registry';

export function BottomNav() {
  const navSections = appSections.filter((section) => section.showInBottomNav);

  return (
    <nav className="fixed inset-x-0 bottom-4 z-20 mx-auto flex max-w-md items-center justify-between gap-2 rounded-full border border-slate-200/70 bg-white/92 px-3 py-3 shadow-xl backdrop-blur dark:border-slate-700/80 dark:bg-slate-900/92 sm:max-w-lg">
      {navSections.map((section) => (
        <NavLink
          key={section.key}
          to={section.route}
          className={({ isActive }) =>
            [
              'flex min-w-0 flex-1 flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-medium transition',
              isActive
                ? 'bg-sky-600 text-white shadow'
                : 'text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800',
            ].join(' ')
          }
        >
          <span className="text-base">{section.icon}</span>
          <span className="truncate">{section.shortTitle}</span>
        </NavLink>
      ))}
    </nav>
  );
}
