export type PeriodFilter = 'day' | 'week' | 'month' | 'all';

const DAY_IN_MS = 86_400_000;

export function getDayIndex(seed: number): number {
  const base = new Date();
  const dayOfYear = Math.floor((Date.UTC(base.getFullYear(), base.getMonth(), base.getDate()) - Date.UTC(base.getFullYear(), 0, 0)) / DAY_IN_MS);
  return Math.abs(dayOfYear + seed);
}

export function getLocalDateKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseDateKey(dateKey: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) return null;
  const [year, month, day] = dateKey.split('-').map(Number);
  const parsed = new Date(year, month - 1, day);
  if (Number.isNaN(parsed.getTime())) return null;
  return getLocalDateKey(parsed) === dateKey ? parsed : null;
}

export function getDateKeysForTrailingDays(days: number, baseDate = new Date()): string[] {
  if (days <= 0) return [];

  return Array.from({ length: days }, (_, index) => {
    const target = new Date(baseDate);
    target.setDate(baseDate.getDate() - (days - index - 1));
    return getLocalDateKey(target);
  });
}

export function isDateKeyInCurrentMonth(dateKey: string, baseDate = new Date()): boolean {
  const parsed = parseDateKey(dateKey);
  if (!parsed) return false;

  return parsed.getFullYear() === baseDate.getFullYear() && parsed.getMonth() === baseDate.getMonth();
}

export function sortDateKeys(dateKeys: Iterable<string>): string[] {
  return [...new Set(dateKeys)].sort((left, right) => left.localeCompare(right));
}

export function trimRecordToRecentDays<T>(record: Record<string, T>, daysToKeep: number, baseDate = new Date()): Record<string, T> {
  const threshold = new Date(baseDate);
  threshold.setDate(baseDate.getDate() - Math.max(daysToKeep - 1, 0));
  const thresholdKey = getLocalDateKey(threshold);

  return Object.fromEntries(
    Object.entries(record).filter(([dateKey]) => {
      const parsed = parseDateKey(dateKey);
      return parsed ? getLocalDateKey(parsed) >= thresholdKey : false;
    }),
  );
}

export function countTrailingActiveDays(dateKeysWithActivity: Iterable<string>, baseDate = new Date()): number {
  const activeKeys = new Set(sortDateKeys(dateKeysWithActivity));
  if (activeKeys.size === 0) return 0; // EDGE-04: early exit prevents 3650 iterations

  let streak = 0;
  const MAX_STREAK = activeKeys.size; // لا يمكن أن يكون الـ streak أكبر من عدد الأيام النشطة

  for (let offset = 0; offset < MAX_STREAK; offset += 1) {
    const probe = new Date(baseDate);
    probe.setDate(baseDate.getDate() - offset);
    const probeKey = getLocalDateKey(probe);

    if (!activeKeys.has(probeKey)) {
      break;
    }

    streak += 1;
  }

  return streak;
}
