import { useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AppCard } from '@/shared/ui/primitives/AppCard';
import { AppSearchField } from '@/shared/ui/primitives/AppSearchField';
import { EmptyState } from '@/shared/ui/feedback/EmptyState';
import { SearchEmptyState } from '@/shared/ui/feedback/SearchEmptyState';
import { LoadStateNotice } from '@/shared/ui/feedback/LoadStateNotice';
import { filterQuranSurahs, getQuranSurahList, preloadSurahAyahs } from '@/content/loaders/load-quran';
import { useQuranStore } from '@/features/quran/state/quran-store';
import { cn } from '@/shared/lib/cn';
import { MUTED_PANEL_CLASS, SURFACE_TILE_CLASS } from '@/shared/ui/design/ui-classes';
import { getQuranHeroRecommendation, getQuranQuickAccessItems } from '@/features/quran/domain/quran-reading-flow';
import { QuranHeroCard } from '@/features/quran/components/QuranHeroCard';
import { QuranQuickAccess } from '@/features/quran/components/QuranQuickAccess';
import { QuranReaderPanel } from '@/features/quran/components/QuranReaderPanel';

let cachedSurahList: ReturnType<typeof getQuranSurahList> | null = null;
function getSurahListSafe() {
  if (!cachedSurahList) {
    cachedSurahList = getQuranSurahList();
  }
  return cachedSurahList;
}

export function QuranPage() {
  const [searchParams] = useSearchParams();
  const searchQuery = useQuranStore((state) => state.searchQuery);
  const setSearchQuery = useQuranStore((state) => state.setSearchQuery);
  const isLoading = useQuranStore((state) => state.isLoading);
  const error = useQuranStore((state) => state.error);
  const activeSurahNumber = useQuranStore((state) => state.activeSurahNumber);
  const activeSurahName = useQuranStore((state) => state.activeSurahName);
  const activeVerses = useQuranStore((state) => state.activeVerses);
  const bookmark = useQuranStore((state) => state.bookmark);
  const recentSurahNumbers = useQuranStore((state) => state.recentSurahNumbers);
  const dailyReadings = useQuranStore((state) => state.dailyReadings);
  const openSurah = useQuranStore((state) => state.openSurah);
  const closeReader = useQuranStore((state) => state.closeReader);
  const resumeBookmark = useQuranStore((state) => state.resumeBookmark);
  const clearBookmark = useQuranStore((state) => state.clearBookmark);

  const filteredSurahs = useMemo(() => filterQuranSurahs(searchQuery), [searchQuery]);
  const hero = useMemo(
    () => getQuranHeroRecommendation({
      isInitialized: true,
      isLoading,
      error,
      activeSurahNumber,
      activeSurahName,
      activeVerses,
      searchQuery,
      bookmark,
      recentSurahNumbers,
      dailyReadings,
    }),
    [activeSurahName, activeSurahNumber, activeVerses, bookmark, dailyReadings, error, isLoading, recentSurahNumbers, searchQuery],
  );
  const quickAccess = useMemo(
    () => getQuranQuickAccessItems({
      isInitialized: true,
      isLoading,
      error,
      activeSurahNumber,
      activeSurahName,
      activeVerses,
      searchQuery,
      bookmark,
      recentSurahNumbers,
      dailyReadings,
    }),
    [activeSurahName, activeSurahNumber, activeVerses, bookmark, dailyReadings, error, isLoading, recentSurahNumbers, searchQuery],
  );

  useEffect(() => {
    const hasSearchQueryParam = searchParams.has('query');
    const searchQueryFromUrl = searchParams.get('query') ?? '';
    const surahFromUrl = Number(searchParams.get('surah') ?? '');
    if (hasSearchQueryParam && searchQueryFromUrl !== searchQuery) setSearchQuery(searchQueryFromUrl);
    if (Number.isFinite(surahFromUrl) && surahFromUrl > 0 && activeSurahNumber !== surahFromUrl) {
      void openSurah(surahFromUrl);
    }
  }, [activeSurahNumber, openSurah, searchParams, searchQuery, setSearchQuery]);


  useEffect(() => {
    const candidates = [hero.surahNumber, bookmark?.surahNumber, ...recentSurahNumbers].filter(
      (value): value is number => Number.isFinite(value) && Number(value) > 0,
    );

    for (const surahNumber of candidates.slice(0, 3)) {
      void preloadSurahAyahs(surahNumber);
    }
  }, [bookmark?.surahNumber, hero.surahNumber, recentSurahNumbers]);

  return (
    <div className="space-y-4">
      <QuranHeroCard
        hero={hero}
        onResume={() => void resumeBookmark()}
        onOpenSurah={(surahNumber) => void openSurah(surahNumber)}
      />

      <AppCard title="قسم القرآن" subtitle="التركيز الآن على الاستئناف السريع والعودة اليومية لقراءة خفيفة واضحة.">
        <AppSearchField
          id="quran-search"
          label="ابحث باسم السورة أو رقمها"
          query={searchQuery}
          onQueryChange={setSearchQuery}
          placeholder="مثال: الكهف أو 18"
        />

        {bookmark ? (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-[var(--ui-radius-panel)] border border-emerald-200 bg-emerald-50 px-4 py-4 dark:border-emerald-900/60 dark:bg-emerald-950/30">
            <div>
              <p className="text-xs text-emerald-700 dark:text-emerald-300">آخر موضع قراءة</p>
              <p className="mt-1 text-base font-bold text-slate-900 dark:text-slate-50">{bookmark.surahName}</p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{bookmark.verseCount} آية • {new Date(bookmark.updatedAt).toLocaleDateString('ar-EG')}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void resumeBookmark()}
                className="rounded-[var(--ui-radius-control)] bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                استئناف القراءة
              </button>
              <button
                type="button"
                onClick={clearBookmark}
                className="rounded-[var(--ui-radius-control)] border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 dark:border-slate-700 dark:text-slate-200"
              >
                مسح العلامة
              </button>
            </div>
          </div>
        ) : null}
      </AppCard>

      <QuranQuickAccess
        items={quickAccess}
        onOpenSurah={(surahNumber) => void openSurah(surahNumber)}
        onPreloadSurah={(surahNumber) => void preloadSurahAyahs(surahNumber)}
      />

      {activeSurahNumber && activeSurahName ? (
        <QuranReaderPanel
          surahName={activeSurahName}
          surahNumber={activeSurahNumber}
          verses={activeVerses}
          isLoading={isLoading}
          error={error}
          onClose={closeReader}
        />
      ) : (
        <AppCard title="فهرس السور" subtitle="ابدأ بورد اليوم، أو افتح أي سورة من الفهرس عند الحاجة.">
          {isLoading ? <div className="mb-3"><LoadStateNotice title="جاري تحميل السورة" body="نحضّر السورة المختارة ونسترجع آخر موضع قراءة محفوظ." /></div> : null}
          {error ? <div className="mb-3"><LoadStateNotice title="تعذر فتح السورة" body={error} tone="error" actionLabel={activeSurahNumber ? 'إعادة المحاولة' : undefined} onAction={activeSurahNumber ? (() => void openSurah(activeSurahNumber)) : undefined} /></div> : null}

          {filteredSurahs.length === 0 ? (
            searchQuery.trim() ? (
              <SearchEmptyState title="لا توجد نتائج" body="جرّب اسم سورة آخر أو امسح البحث الحالي لعرض الفهرس كاملًا." onClear={() => setSearchQuery('')} />
            ) : (
              <EmptyState title="لا توجد سور متاحة" body="تعذر عرض الفهرس الآن. حاول مجددًا بعد لحظات." />
            )
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {filteredSurahs.map((surah) => (
                <button
                  key={surah.surahNumber}
                  type="button"
                  onClick={() => void openSurah(surah.surahNumber)}
                  onMouseEnter={() => void preloadSurahAyahs(surah.surahNumber)}
                  onFocus={() => void preloadSurahAyahs(surah.surahNumber)}
                  onTouchStart={() => void preloadSurahAyahs(surah.surahNumber)}
                  className={SURFACE_TILE_CLASS}
                >
                  <div className="flex items-start justify-between gap-3 text-right">
                    <div>
                      <p className="text-base font-bold text-slate-900 dark:text-slate-50">{surah.surahName}</p>
                      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{surah.verseCount} آية</p>
                    </div>
                    <span className={cn(MUTED_PANEL_CLASS, 'min-w-11 bg-white px-3 py-2 text-center text-xs font-bold text-slate-700 shadow-sm dark:bg-slate-900 dark:text-slate-100')}>
                      {surah.surahNumber}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </AppCard>
      )}
    </div>
  );
}
