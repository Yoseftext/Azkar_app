import type { PeriodFilter } from '@/shared/lib/date';

export interface DashboardMetric {
  label: string;
  value: string;
  hint: string;
}

export interface StatsDashboard {
  filter: PeriodFilter;
  metrics: DashboardMetric[];
  taskCompletionRate: number;
  tasksCompletedInRange: number;
  tasksCompletedToday: number;
  masbahaCountInRange: number;
  masbahaTodayCount: number;
  masbahaStreak: number;
  azkarCompletedInRange: number;
  azkarCompletedToday: number;
  azkarActiveDays: number;
  duasCompletedInRange: number;
  duasCompletedToday: number;
  duasActiveDays: number;
  favoriteDuasCount: number;
  storiesCompletedInRange: number;
  storiesCompletedToday: number;
  storiesActiveDays: number;
  favoriteStoriesCount: number;
  namesCompletedInRange: number;
  namesCompletedToday: number;
  namesActiveDays: number;
  favoriteNamesCount: number;
  quranVersesInRange: number;
  quranVersesToday: number;
  quranActiveDays: number;
  lastReadSurahName: string | null;
  activeDays: number;
}


export interface StatsInsight {
  id: string;
  title: string;
  body: string;
  tone: 'sky' | 'emerald' | 'amber' | 'slate';
}

export interface WeeklyReflectionFocus {
  title: string;
  body: string;
  ctaLabel: string;
  to: string;
}

export interface WeeklyReflection {
  title: string;
  summary: string;
  highlights: string[];
  strongestAreaLabel: string;
  strongestAreaDetail: string;
  activeDays: number;
  focus: WeeklyReflectionFocus;
}
