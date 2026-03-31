import type { MasbahaState } from '@/features/masbaha/domain/masbaha-types';
import { countTrailingActiveDays, getDateKeysForTrailingDays, getLocalDateKey, isDateKeyInCurrentMonth } from '@/shared/lib/date';

export const DEFAULT_MASBAHA_PHRASES = [
  'سبحان الله',
  'الحمد لله',
  'الله أكبر',
  'لا إله إلا الله',
  'أستغفر الله',
  'لا حول ولا قوة إلا بالله',
  'اللهم صل على محمد',
  'حسبنا الله ونعم الوكيل',
] as const;

export function getMasbahaBatchCount(state: Pick<MasbahaState, 'currentSessionCount' | 'currentTarget'>): number {
  if (state.currentTarget <= 0) return 0;
  return state.currentSessionCount % state.currentTarget;
}

export function getMasbahaProgressRatio(state: Pick<MasbahaState, 'currentSessionCount' | 'currentTarget'>): number {
  if (state.currentTarget <= 0) return 0;
  const batchCount = getMasbahaBatchCount(state);
  const effectiveCount = batchCount === 0 && state.currentSessionCount > 0 ? state.currentTarget : batchCount;
  return effectiveCount / state.currentTarget;
}

export function getMasbahaTodayCount(state: Pick<MasbahaState, 'dailyCounts'>): number {
  return state.dailyCounts[getLocalDateKey()] ?? 0;
}

export function getMasbahaLast7DaysCount(state: Pick<MasbahaState, 'dailyCounts'>): number {
  return getDateKeysForTrailingDays(7).reduce((total, dateKey) => total + (state.dailyCounts[dateKey] ?? 0), 0);
}

export function getMasbahaCurrentMonthCount(state: Pick<MasbahaState, 'dailyCounts'>): number {
  return Object.entries(state.dailyCounts).reduce((total, [dateKey, count]) => {
    return total + (isDateKeyInCurrentMonth(dateKey) ? count : 0);
  }, 0);
}

export function getMasbahaActiveStreak(state: Pick<MasbahaState, 'dailyCounts'>): number {
  const activeDateKeys = Object.entries(state.dailyCounts)
    .filter(([, count]) => count > 0)
    .map(([dateKey]) => dateKey);

  return countTrailingActiveDays(activeDateKeys);
}

export function getNextDefaultPhrase(currentPhrase: string): string {
  const currentIndex = DEFAULT_MASBAHA_PHRASES.indexOf(currentPhrase as (typeof DEFAULT_MASBAHA_PHRASES)[number]);
  if (currentIndex === -1) return currentPhrase;
  return DEFAULT_MASBAHA_PHRASES[(currentIndex + 1) % DEFAULT_MASBAHA_PHRASES.length];
}
