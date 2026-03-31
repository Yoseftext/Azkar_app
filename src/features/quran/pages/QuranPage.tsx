import { useEffect, useMemo } from 'react';
import { AppCard } from '@/shared/ui/primitives/AppCard';
import { EmptyState } from '@/shared/ui/feedback/EmptyState';
import { filterQuranSurahs, getQuranSurahList, preloadSurahAyahs } from '@/content/loaders/load-quran';
import { useQuranStore } from '@/features/quran/state/quran-store';

const surahList = getQuranSurahList();

export function QuranPage() {
  const searchQuery = useQuranStore((state) => state.searchQuery);
  const setSearchQuery = useQuranStore((state) => state.setSearchQuery);
  const isLoading = useQuranStore((state) => state.isLoading);
  const error = useQuranStore((state) => state.error);
  const activeSurahNumber = useQuranStore((state) => state.activeSurahNumber);
  const activeSurahName = useQuranStore((state) => state.activeSurahName);
  const activeVerses = useQuranStore((state) => state.activeVerses);
  const bookmark = useQuranStore((state) => state.bookmark);
  const recentSurahNumbers = useQuranStore((state) => state.recentSurahNumbers);
  const openSurah = useQuranStore((state) => state.openSurah);
  const closeReader = useQuranStore((state) => state.closeReader);
  const resumeBookmark = useQuranStore((state) => state.resumeBookmark);
  const clearBookmark = useQuranStore((state) => state.clearBookmark);

  const filteredSurahs = useMemo(() => filterQuranSurahs(searchQuery), [searchQuery]);

  useEffect(() => {
    const candidates = [bookmark?.surahNumber, ...recentSurahNumbers].filter(
      (value): value is number => Number.isFinite(value) && Number(value) > 0,
    );

    for (const surahNumber of candidates.slice(0, 3)) {
      void preloadSurahAyahs(surahNumber);
    }
  }, [bookmark?.surahNumber, recentSurahNumbers]);

  const recentSurahs = useMemo(
    () => recentSurahNumbers.map((surahNumber) => surahList.find((item) => item.surahNumber === surahNumber)).filter(Boolean),
    [recentSurahNumbers],
  );

  return (
    <div className="space-y-4">
      <AppCard title="قسم القرآن" subtitle="module مستقلة: فهرس خفيف، تحميل السورة عند الطلب فقط، وbookmark/resume داخل store معزولة.">
        <div className="space-y-3">
          <div className="rounded-3xl bg-slate-50 p-3 dark:bg-slate-800/70">
            <label htmlFor="quran-search" className="text-xs font-semibold text-slate-500 dark:text-slate-300">
              ابحث باسم السورة أو رقمها
            </label>
            <input
              id="quran-search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="مثال: الكهف أو 18"
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-sky-500 dark:border-slate-700 dark:bg-slate-900"
            />
          </div>

          {bookmark ? (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-emerald-200 bg-emerald-50 px-4 py-4 dark:border-emerald-900/60 dark:bg-emerald-950/30">
              <div>
                <p className="text-xs text-emerald-700 dark:text-emerald-300">آخر موضع قراءة</p>
                <p className="mt-1 text-base font-bold text-slate-900 dark:text-slate-50">{bookmark.surahName}</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{bookmark.verseCount} آية • {new Date(bookmark.updatedAt).toLocaleDateString('ar-EG')}</p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => void resumeBookmark()}
                  className="rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
                >
                  استئناف القراءة
                </button>
                <button
                  type="button"
                  onClick={clearBookmark}
                  className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-rose-300 hover:text-rose-700 dark:border-slate-700 dark:text-slate-200"
                >
                  مسح العلامة
                </button>
              </div>
            </div>
          ) : null}

          {recentSurahs.length > 0 ? (
            <div>
              <p className="mb-2 text-xs font-semibold text-slate-500 dark:text-slate-300">الوصول السريع</p>
              <div className="flex flex-wrap gap-2">
                {recentSurahs.map((surah) => (
                  <button
                    key={surah!.surahNumber}
                    type="button"
                    onClick={() => void openSurah(surah!.surahNumber)}
                    onMouseEnter={() => void preloadSurahAyahs(surah!.surahNumber)}
                    onFocus={() => void preloadSurahAyahs(surah!.surahNumber)}
                    onTouchStart={() => void preloadSurahAyahs(surah!.surahNumber)}
                    className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-sky-300 hover:text-sky-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                  >
                    {surah!.surahName}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </AppCard>

      {activeSurahNumber && activeSurahName ? (
        <AppCard title={activeSurahName} subtitle={`سورة رقم ${activeSurahNumber} • تم التحميل عند الطلب فقط دون سحب dataset كامل داخل app shell.`}>
          <div className="mb-4 flex items-center justify-between gap-3">
            <p className="text-xs text-slate-500 dark:text-slate-400">{activeVerses.length} آية</p>
            <button
              type="button"
              onClick={closeReader}
              className="rounded-2xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 dark:border-slate-700 dark:text-slate-200"
            >
              الرجوع للفهرس
            </button>
          </div>

          {isLoading ? <p className="text-sm text-slate-500 dark:text-slate-400">جاري تحميل السورة…</p> : null}
          {error ? <p className="text-sm text-rose-600 dark:text-rose-300">{error}</p> : null}

          <div className="max-h-[60vh] space-y-3 overflow-y-auto rounded-[28px] bg-slate-50 p-4 dark:bg-slate-950/40">
            {activeVerses.map((ayah) => (
              <p key={`${ayah.chapter}-${ayah.verse}`} className="rounded-3xl bg-white px-4 py-4 text-base leading-9 text-slate-900 shadow-sm dark:bg-slate-900/90 dark:text-slate-50">
                {ayah.text} <span className="text-sky-700 dark:text-sky-300">﴿{ayah.verse}﴾</span>
              </p>
            ))}
          </div>
        </AppCard>
      ) : (
        <AppCard title="فهرس السور" subtitle="القائمة تعتمد على metadata خفيفة، ثم تحميل النص الكامل يحصل فقط عند فتح السورة.">
          {isLoading ? <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">جاري تحميل السورة…</p> : null}
          {error ? <p className="mb-3 text-sm text-rose-600 dark:text-rose-300">{error}</p> : null}

          {filteredSurahs.length === 0 ? (
            <EmptyState title="لا توجد نتائج" body="جرّب اسم سورة آخر أو اكتب رقم السورة مباشرة." />
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
                  className="rounded-[28px] border border-slate-200 bg-slate-50 px-4 py-4 text-right transition hover:border-sky-300 hover:bg-sky-50 dark:border-slate-700 dark:bg-slate-800/70 dark:hover:border-sky-700 dark:hover:bg-slate-800"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-base font-bold text-slate-900 dark:text-slate-50">{surah.surahName}</p>
                      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{surah.verseCount} آية</p>
                    </div>
                    <span className="rounded-full bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-sm dark:bg-slate-900 dark:text-slate-100">
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
