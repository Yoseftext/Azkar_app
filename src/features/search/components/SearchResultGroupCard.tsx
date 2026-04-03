import { AppCard } from '@/shared/ui/primitives/AppCard';
import { AppButtonLink } from '@/shared/ui/primitives/AppButtonLink';
import type { SearchCenterGroup } from '@/features/search/domain/search-center';

export function SearchResultGroupCard({ group }: { group: SearchCenterGroup }) {
  return (
    <AppCard title={`${group.icon} ${group.sectionTitle}`} subtitle={`أفضل النتائج داخل ${group.sectionTitle}`}>
      <div className="space-y-3">
        {group.items.map((item) => (
          <AppButtonLink key={item.id} to={item.route} variant="outline" fullWidth className="justify-between rounded-[var(--ui-radius-panel)] border-slate-200 px-4 py-4 text-right dark:border-slate-700">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-slate-900 dark:text-slate-50">{item.title}</p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{item.subtitle}</p>
              {item.description ? <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-600 dark:text-slate-300">{item.description}</p> : null}
            </div>
            <span className="shrink-0 text-lg leading-none">{group.icon}</span>
          </AppButtonLink>
        ))}
      </div>
    </AppCard>
  );
}
