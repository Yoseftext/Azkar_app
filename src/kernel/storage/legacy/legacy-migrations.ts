import type { PersistedTaskItem } from '@/features/tasks/domain/task-types';
import type { LegacyState } from '@/kernel/storage/legacy/legacy-types';
import { safeGet, safeSet, type SafeLegacyStorage } from '@/kernel/storage/legacy/legacy-storage';

function migrateMasbaha(storage: SafeLegacyStorage, legacyState: LegacyState): void {
  if (safeGet(storage, 'azkar-next.masbaha')) return;

  const hasData =
    (legacyState.totalTasbeeh ?? 0) > 0 ||
    (legacyState.currentSessionTasbeeh ?? 0) > 0 ||
    (legacyState.settings?.masbahaTarget ?? 0) > 0;

  if (!hasData) return;

  const payload = {
    isSilent: Boolean(legacyState.settings?.silentMode),
    currentTarget: Number(legacyState.settings?.masbahaTarget) > 0 ? Math.floor(Number(legacyState.settings?.masbahaTarget)) : 33,
    currentSessionCount: Math.max(0, Math.floor(Number(legacyState.currentSessionTasbeeh) || 0)),
    totalCount: Math.max(0, Math.floor(Number(legacyState.totalTasbeeh) || 0)),
    selectedPhrase: 'سبحان الله',
    customPhrases: [] as string[],
    dailyCounts:
      legacyState.lastDate && (legacyState.dailyTasbeeh ?? 0) > 0
        ? { [legacyState.lastDate]: Math.floor(Number(legacyState.dailyTasbeeh)) }
        : ({} as Record<string, number>),
  };

  safeSet(storage, 'azkar-next.masbaha', JSON.stringify(payload));
}

function migrateTasks(storage: SafeLegacyStorage, legacyState: LegacyState): void {
  if (safeGet(storage, 'azkar-next.tasks')) return;

  const rawTasks = Array.isArray(legacyState.tasks) ? legacyState.tasks : [];
  if (rawTasks.length === 0) return;

  const items: PersistedTaskItem[] = rawTasks.map((task, index) => ({
    id: task.id ?? `migrated-${index}`,
    title: String(task.text ?? '').trim() || `مهمة ${index + 1}`,
    group: task.isDefault ? 'wird' : 'personal',
    isDefault: Boolean(task.isDefault),
  }));

  const completedIds = rawTasks
    .filter((task) => Boolean(task.completed))
    .map((task, index) => task.id ?? `migrated-${index}`);

  const dailyCompletions: Record<string, string[]> = {};
  if (legacyState.lastDate && completedIds.length > 0) {
    dailyCompletions[legacyState.lastDate] = completedIds;
  }

  const payload = {
    items,
    dailyCompletions,
    lastDailyResetKey: legacyState.lastDate ?? '',
  };

  safeSet(storage, 'azkar-next.tasks', JSON.stringify(payload));
}

function migrateQuran(storage: SafeLegacyStorage, legacyState: LegacyState): void {
  if (safeGet(storage, 'azkar-next.quran')) return;

  const bookmark = legacyState.quranBookmark;
  if (!bookmark?.surahNum || !Number.isFinite(bookmark.surahNum)) return;

  const surahNumber = Math.floor(Number(bookmark.surahNum));
  const payload = {
    bookmark: {
      surahNumber,
      surahName: String(bookmark.surahName ?? '').trim() || `سورة ${surahNumber}`,
      verseCount: 0,
      updatedAt: new Date().toISOString(),
    },
    recentSurahNumbers: [surahNumber],
    dailyReadings: {} as Record<string, number[]>,
  };

  safeSet(storage, 'azkar-next.quran', JSON.stringify(payload));
}

function migratePreferences(storage: SafeLegacyStorage, legacyState: LegacyState): void {
  if (safeGet(storage, 'azkar-next.preferences')) return;

  const themeMap: Record<string, string> = {
    default: 'system',
    dark: 'dark',
    light: 'light',
  };

  const themeMode = themeMap[legacyState.settings?.theme ?? 'default'] ?? 'system';
  safeSet(storage, 'azkar-next.preferences', JSON.stringify({ themeMode }));
}

export function runLegacyMigrations(storage: SafeLegacyStorage, legacyState: LegacyState): void {
  migrateMasbaha(storage, legacyState);
  migrateTasks(storage, legacyState);
  migrateQuran(storage, legacyState);
  migratePreferences(storage, legacyState);
}
