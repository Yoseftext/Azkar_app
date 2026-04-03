import { AppCard } from '@/shared/ui/primitives/AppCard';
import { AppButtonLink } from '@/shared/ui/primitives/AppButtonLink';
import type { getSearchQuickLinks } from '@/features/search/domain/search-center';

type SearchQuickLink = ReturnType<typeof getSearchQuickLinks>[number];

export function SearchQuickLinks({ items }: { items: SearchQuickLink[] }) {
  return (
    <AppCard title="ابحث داخل الأقسام" subtitle="ابدأ من القسم المناسب إذا كنت تعرف ما الذي تريد الوصول إليه.">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {items.map((item) => (
          <AppButtonLink key={item.route} to={item.route} variant="outline" fullWidth className="justify-start rounded-[var(--ui-radius-panel)] px-4 py-4 text-right">
            <span className="text-xl leading-none">{item.icon}</span>
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-slate-50">{item.title}</p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{item.body}</p>
            </div>
          </AppButtonLink>
        ))}
      </div>
    </AppCard>
  );
}
