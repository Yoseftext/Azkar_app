import type { TaskItem } from '@/features/tasks/domain/task-types';
import type { PeriodFilter } from '@/shared/lib/date';
import { countTrailingActiveDays, getDateKeysForTrailingDays, getLocalDateKey, isDateKeyInCurrentMonth, sortDateKeys } from '@/shared/lib/date';
import { getMasbahaActiveStreak } from '@/features/masbaha/domain/masbaha-selectors';
import type { StatsDashboard } from '@/features/stats/domain/stats-types';
import type { QuranBookmark } from '@/features/quran/domain/quran-types';
import { getSurahMetaByNumber } from '@/content/loaders/load-quran';

interface TasksSnapshot {
  items: TaskItem[];
  dailyCompletions: Record<string, string[]>;
}

interface MasbahaSnapshot {
  currentTarget: number;
  totalCount: number;
  dailyCounts: Record<string, number>;
}

interface AzkarSnapshot {
  completedByDate: Record<string, string[]>;
}

interface QuranSnapshot {
  bookmark: QuranBookmark | null;
  dailyReadings: Record<string, number[]>;
}

interface DuasSnapshot {
  completedByDate: Record<string, string[]>;
  favoriteIds: string[];
}

interface StoriesSnapshot {
  completedByDate: Record<string, string[]>;
  favoriteIds: string[];
}

interface NamesSnapshot {
  completedByDate: Record<string, string[]>;
  favoriteIds: string[];
}

function getRelevantDateKeys(filter: PeriodFilter, candidateKeys: string[]): string[] {
  if (filter === 'day') return [getLocalDateKey()];
  if (filter === 'week') return getDateKeysForTrailingDays(7);
  if (filter === 'month') return candidateKeys.filter((dateKey) => isDateKeyInCurrentMonth(dateKey));
  return sortDateKeys(candidateKeys);
}

function getTaskCompletionsForRange(tasks: TasksSnapshot, filter: PeriodFilter): number {
  const relevantKeys = getRelevantDateKeys(filter, Object.keys(tasks.dailyCompletions));
  return relevantKeys.reduce((total, dateKey) => total + (tasks.dailyCompletions[dateKey]?.length ?? 0), 0);
}

function getMasbahaCountForRange(masbaha: MasbahaSnapshot, filter: PeriodFilter): number {
  const relevantKeys = getRelevantDateKeys(filter, Object.keys(masbaha.dailyCounts));
  return relevantKeys.reduce((total, dateKey) => total + (masbaha.dailyCounts[dateKey] ?? 0), 0);
}

function getAzkarCompletionsForRange(azkar: AzkarSnapshot, filter: PeriodFilter): number {
  const relevantKeys = getRelevantDateKeys(filter, Object.keys(azkar.completedByDate));
  return relevantKeys.reduce((total, dateKey) => total + (azkar.completedByDate[dateKey]?.length ?? 0), 0);
}

function getQuranVersesForRange(quran: QuranSnapshot, filter: PeriodFilter): number {
  const relevantKeys = getRelevantDateKeys(filter, Object.keys(quran.dailyReadings));
  return relevantKeys.reduce((total, dateKey) => {
    const verses = (quran.dailyReadings[dateKey] ?? []).reduce((sum, surahNumber) => {
      const surahMeta = getSurahMetaByNumber(surahNumber);
      return sum + (surahMeta?.verseCount ?? 0);
    }, 0);
    return total + verses;
  }, 0);
}

function getQuranActiveStreak(quran: QuranSnapshot): number {
  const activeDays = Object.entries(quran.dailyReadings)
    .filter(([, surahNumbers]) => surahNumbers.length > 0)
    .map(([dateKey]) => dateKey);

  return countTrailingActiveDays(activeDays);
}

function getAzkarActiveStreak(azkar: AzkarSnapshot): number {
  const activeDays = Object.entries(azkar.completedByDate)
    .filter(([, ids]) => ids.length > 0)
    .map(([dateKey]) => dateKey);

  return countTrailingActiveDays(activeDays);
}

function getDuasCompletionsForRange(duas: DuasSnapshot, filter: PeriodFilter): number {
  const relevantKeys = getRelevantDateKeys(filter, Object.keys(duas.completedByDate));
  return relevantKeys.reduce((total, dateKey) => total + (duas.completedByDate[dateKey]?.length ?? 0), 0);
}

function getDuasActiveStreak(duas: DuasSnapshot): number {
  const activeDays = Object.entries(duas.completedByDate)
    .filter(([, ids]) => ids.length > 0)
    .map(([dateKey]) => dateKey);

  return countTrailingActiveDays(activeDays);
}

function getStoriesCompletionsForRange(stories: StoriesSnapshot, filter: PeriodFilter): number {
  const relevantKeys = getRelevantDateKeys(filter, Object.keys(stories.completedByDate));
  return relevantKeys.reduce((total, dateKey) => total + (stories.completedByDate[dateKey]?.length ?? 0), 0);
}

function getStoriesActiveStreak(stories: StoriesSnapshot): number {
  const activeDays = Object.entries(stories.completedByDate)
    .filter(([, ids]) => ids.length > 0)
    .map(([dateKey]) => dateKey);

  return countTrailingActiveDays(activeDays);
}

function getNamesCompletionsForRange(names: NamesSnapshot, filter: PeriodFilter): number {
  const relevantKeys = getRelevantDateKeys(filter, Object.keys(names.completedByDate));
  return relevantKeys.reduce((total, dateKey) => total + (names.completedByDate[dateKey]?.length ?? 0), 0);
}

function getNamesActiveStreak(names: NamesSnapshot): number {
  const activeDays = Object.entries(names.completedByDate)
    .filter(([, ids]) => ids.length > 0)
    .map(([dateKey]) => dateKey);

  return countTrailingActiveDays(activeDays);
}

function getCombinedActiveDays(tasks: TasksSnapshot, masbaha: MasbahaSnapshot, azkar: AzkarSnapshot, quran: QuranSnapshot, duas: DuasSnapshot, stories: StoriesSnapshot, names: NamesSnapshot): number {
  const taskDays = Object.entries(tasks.dailyCompletions)
    .filter(([, ids]) => ids.length > 0)
    .map(([dateKey]) => dateKey);
  const masbahaDays = Object.entries(masbaha.dailyCounts)
    .filter(([, count]) => count > 0)
    .map(([dateKey]) => dateKey);
  const azkarDays = Object.entries(azkar.completedByDate)
    .filter(([, ids]) => ids.length > 0)
    .map(([dateKey]) => dateKey);
  const quranDays = Object.entries(quran.dailyReadings)
    .filter(([, surahNumbers]) => surahNumbers.length > 0)
    .map(([dateKey]) => dateKey);
  const duaDays = Object.entries(duas.completedByDate)
    .filter(([, ids]) => ids.length > 0)
    .map(([dateKey]) => dateKey);
  const storyDays = Object.entries(stories.completedByDate)
    .filter(([, ids]) => ids.length > 0)
    .map(([dateKey]) => dateKey);
  const nameDays = Object.entries(names.completedByDate)
    .filter(([, ids]) => ids.length > 0)
    .map(([dateKey]) => dateKey);

  return countTrailingActiveDays([...taskDays, ...masbahaDays, ...azkarDays, ...quranDays, ...duaDays, ...storyDays, ...nameDays]);
}

export interface BuildStatsInput {
  tasks: TasksSnapshot;
  masbaha: MasbahaSnapshot;
  azkar: AzkarSnapshot;
  quran: QuranSnapshot;
  duas: DuasSnapshot;
  stories: StoriesSnapshot;
  names: NamesSnapshot;
  filter: PeriodFilter;
}

/** OPT-V3-01: 8 params → 1 object — أوضح وأسهل في الاختبار */
export function buildStatsDashboard({ tasks, masbaha, azkar, quran, duas, stories, names, filter }: BuildStatsInput): StatsDashboard {
  const totalTasks = tasks.items.length;
  const currentCompletedTasks = tasks.items.filter((item) => item.completed).length;
  const taskCompletionRate = totalTasks === 0 ? 0 : Math.round((currentCompletedTasks / totalTasks) * 100);
  const tasksCompletedToday = tasks.dailyCompletions[getLocalDateKey()]?.length ?? 0;
  const tasksCompletedInRange = getTaskCompletionsForRange(tasks, filter);
  const masbahaTodayCount = masbaha.dailyCounts[getLocalDateKey()] ?? 0;
  const masbahaCountInRange = getMasbahaCountForRange(masbaha, filter);
  const azkarCompletedToday = azkar.completedByDate[getLocalDateKey()]?.length ?? 0;
  const azkarCompletedInRange = getAzkarCompletionsForRange(azkar, filter);
  const quranVersesToday = getQuranVersesForRange({ ...quran, dailyReadings: { [getLocalDateKey()]: quran.dailyReadings[getLocalDateKey()] ?? [] } }, 'day');
  const quranVersesInRange = getQuranVersesForRange(quran, filter);
  const duasCompletedToday = duas.completedByDate[getLocalDateKey()]?.length ?? 0;
  const duasCompletedInRange = getDuasCompletionsForRange(duas, filter);
  const storiesCompletedToday = stories.completedByDate[getLocalDateKey()]?.length ?? 0;
  const storiesCompletedInRange = getStoriesCompletionsForRange(stories, filter);
  const namesCompletedToday = names.completedByDate[getLocalDateKey()]?.length ?? 0;
  const namesCompletedInRange = getNamesCompletionsForRange(names, filter);
  const masbahaStreak = getMasbahaActiveStreak(masbaha);
  const azkarActiveDays = getAzkarActiveStreak(azkar);
  const quranActiveDays = getQuranActiveStreak(quran);
  const duasActiveDays = getDuasActiveStreak(duas);
  const storiesActiveDays = getStoriesActiveStreak(stories);
  const namesActiveDays = getNamesActiveStreak(names);
  const activeDays = getCombinedActiveDays(tasks, masbaha, azkar, quran, duas, stories, names);

  return {
    filter,
    metrics: [
      {
        label: 'المهام المنجزة',
        value: String(tasksCompletedInRange),
        hint: filter === 'day' ? 'إجمالي مهام اليوم' : 'ضمن الفترة المختارة',
      },
      {
        label: 'الأذكار المكتملة',
        value: String(azkarCompletedInRange),
        hint: filter === 'day' ? 'الأذكار المؤشرة كمكتملة اليوم' : 'إجمالي الأذكار المكتملة في الفترة',
      },
      {
        label: 'التسبيح',
        value: String(masbahaCountInRange),
        hint: filter === 'day' ? 'عدد التسبيحات اليوم' : 'عدد التسبيحات في الفترة',
      },
      {
        label: 'آيات القراءة',
        value: String(quranVersesInRange),
        hint: filter === 'day' ? 'آيات السور المفتوحة اليوم' : 'إجمالي آيات السور المقروءة في الفترة',
      },
      {
        label: 'الأدعية المكتملة',
        value: String(duasCompletedInRange),
        hint: filter === 'day' ? 'الأدعية المؤشرة كمكتملة اليوم' : 'إجمالي الأدعية المكتملة في الفترة',
      },
      {
        label: 'القصص المقروءة',
        value: String(storiesCompletedInRange),
        hint: filter === 'day' ? 'القصص المؤشرة كمقروءة اليوم' : 'إجمالي القصص المقروءة في الفترة',
      },
      {
        label: 'أسماء اليوم',
        value: String(namesCompletedInRange),
        hint: filter === 'day' ? 'الأسماء التي راجعتها اليوم' : 'إجمالي الأسماء التي راجعتها في الفترة',
      },
      {
        label: 'معدل الإنجاز الحالي',
        value: `${taskCompletionRate}%`,
        hint: `${currentCompletedTasks} / ${totalTasks} من المهام الحالية`,
      },
      {
        label: 'إجمالي التسبيح',
        value: String(masbaha.totalCount),
        hint: `الهدف الحالي للدورة ${masbaha.currentTarget}`,
      },
    ],
    taskCompletionRate,
    tasksCompletedInRange,
    tasksCompletedToday,
    masbahaCountInRange,
    masbahaTodayCount,
    masbahaStreak,
    azkarCompletedInRange,
    azkarCompletedToday,
    azkarActiveDays,
    duasCompletedInRange,
    duasCompletedToday,
    duasActiveDays,
    favoriteDuasCount: duas.favoriteIds.length,
    storiesCompletedInRange,
    storiesCompletedToday,
    storiesActiveDays,
    favoriteStoriesCount: stories.favoriteIds.length,
    namesCompletedInRange,
    namesCompletedToday,
    namesActiveDays,
    favoriteNamesCount: names.favoriteIds.length,
    quranVersesInRange,
    quranVersesToday,
    quranActiveDays,
    lastReadSurahName: quran.bookmark?.surahName ?? null,
    activeDays,
  };
}
