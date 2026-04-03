import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AppSearchField } from '@/shared/ui/primitives/AppSearchField';
import { AppCard } from '@/shared/ui/primitives/AppCard';
import { AppChip } from '@/shared/ui/primitives/AppChip';
import { LoadStateNotice } from '@/shared/ui/feedback/LoadStateNotice';
import { SearchEmptyState } from '@/shared/ui/feedback/SearchEmptyState';
import { SearchQuickLinks } from '@/features/search/components/SearchQuickLinks';
import { SearchResultGroupCard } from '@/features/search/components/SearchResultGroupCard';
import { getSearchQuickLinks, searchAppContent, type SearchCenterGroup, type SearchSectionKey } from '@/features/search/domain/search-center';

const FILTERS: Array<{ key: 'all' | SearchSectionKey; label: string }> = [
  { key: 'all', label: 'الكل' },
  { key: 'quran', label: 'القرآن' },
  { key: 'azkar', label: 'الأذكار' },
  { key: 'duas', label: 'الأدعية' },
  { key: 'stories', label: 'القصص' },
  { key: 'names', label: 'الأسماء' },
];

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(() => searchParams.get('q') ?? '');
  const [groups, setGroups] = useState<SearchCenterGroup[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | SearchSectionKey>('all');

  useEffect(() => {
    const nextQuery = searchParams.get('q') ?? '';
    setQuery((current) => (current === nextQuery ? current : nextQuery));
  }, [searchParams]);

  useEffect(() => {
    let isCancelled = false;
    if (!query.trim()) {
      setGroups([]); setError(null); setIsLoading(false); return () => { isCancelled = true; };
    }
    setIsLoading(true); setError(null);
    void searchAppContent(query).then((nextGroups) => { if (!isCancelled) setGroups(nextGroups); }).catch((nextError) => {
      if (isCancelled) return;
      setError(nextError instanceof Error ? nextError.message : 'تعذر تنفيذ البحث الآن.');
      setGroups([]);
    }).finally(() => { if (!isCancelled) setIsLoading(false); });
    return () => { isCancelled = true; };
  }, [query]);

  const visibleGroups = useMemo(() => activeFilter === 'all' ? groups : groups.filter((group) => group.sectionKey === activeFilter), [activeFilter, groups]);
  const quickLinks = useMemo(() => getSearchQuickLinks(), []);

  function updateQuery(nextQuery: string) {
    setQuery(nextQuery);
    const nextParams = new URLSearchParams(searchParams);
    if (nextQuery.trim()) nextParams.set('q', nextQuery); else nextParams.delete('q');
    setSearchParams(nextParams, { replace: true });
  }

  return (
    <div className="space-y-4">
      <AppCard title="بحث سريع" subtitle="ابحث عبر القرآن والأذكار والأدعية والقصص والأسماء من مكان واحد.">
        <AppSearchField id="app-search" label="ابحث في التطبيق" query={query} onQueryChange={updateQuery} onClear={() => updateQuery('')} placeholder="مثال: الكهف أو الصباح أو الرزاق" />
        <div className="mt-4 flex flex-wrap gap-2">
          {FILTERS.map((filter) => <AppChip key={filter.key} variant={activeFilter === filter.key ? 'active' : 'neutral'} onClick={() => setActiveFilter(filter.key)}>{filter.label}</AppChip>)}
        </div>
      </AppCard>
      {!query.trim() ? <SearchQuickLinks items={quickLinks} /> : null}
      {isLoading ? <LoadStateNotice title="جاري البحث" body="نرتب لك أفضل النتائج عبر الأقسام المختلفة." /> : null}
      {error ? <LoadStateNotice title="تعذر تنفيذ البحث" body={error} tone="error" actionLabel="أعد المحاولة" onAction={() => updateQuery(query)} /> : null}
      {query.trim() && !isLoading && !error && visibleGroups.length === 0 ? <SearchEmptyState title="لا توجد نتائج" body="جرّب كلمة أقصر أو بدّل القسم من الفلاتر بالأعلى." onClear={() => updateQuery('')} /> : null}
      {visibleGroups.map((group) => <SearchResultGroupCard key={group.sectionKey} group={group} />)}
    </div>
  );
}
