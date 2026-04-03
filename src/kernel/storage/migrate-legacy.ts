/**
 * ====================================================================
 * migrate-legacy — جسر ترحيل بيانات V2 → V3
 * ====================================================================
 * مُقسّم حسب المسؤوليات:
 *   - legacy-storage: الوصول الآمن للتخزين والـ parsing
 *   - legacy-types: شكل بيانات V2
 *   - legacy-migrations: تحويل كل feature على حدة
 * ====================================================================
 */
import { runLegacyMigrations } from '@/kernel/storage/legacy/legacy-migrations';
import type { LegacyState } from '@/kernel/storage/legacy/legacy-types';
import {
  getSafeLegacyStorage,
  MIGRATION_DONE_FLAG,
  safeGet,
  safeParseJson,
  safeSet,
  V2_STORAGE_KEY,
} from '@/kernel/storage/legacy/legacy-storage';

export function migrateLegacyData(): void {
  const storage = getSafeLegacyStorage();
  if (!storage) return;
  if (safeGet(storage, MIGRATION_DONE_FLAG)) return;

  const raw = safeGet(storage, V2_STORAGE_KEY);
  if (!raw) {
    safeSet(storage, MIGRATION_DONE_FLAG, '1');
    return;
  }

  try {
    const legacyState = safeParseJson<LegacyState>(raw);
    if (!legacyState) return;
    runLegacyMigrations(storage, legacyState);
  } catch {
    // فشل الترحيل لا يجب أن يوقف التطبيق.
  } finally {
    safeSet(storage, MIGRATION_DONE_FLAG, '1');
  }
}
