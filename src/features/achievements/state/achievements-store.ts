/**
 * ====================================================================
 * Achievements Store — متجر الإنجازات
 * ====================================================================
 * منقول من V2/js/infra/achievements-service.js ومُحوَّل لـ Zustand.
 *
 * الفرق عن V2:
 *   V2 كان يستمع لـ EventBus مباشرة.
 *   هنا نوفر دالة checkAchievements() يُستدعى من useAchievementsChecker
 *   الذي يشترك في الـ stores ذات الصلة.
 * ====================================================================
 */
import { create } from 'zustand';
import { LocalStorageEngine } from '@/kernel/storage/local-storage-engine';
import { STORAGE_KEYS } from '@/kernel/storage/storage-keys';
import { ACHIEVEMENT_DEFINITIONS } from '@/features/achievements/domain/achievement-definitions';
import { showToast } from '@/shared/ui/feedback/toast-store';
import type { AchievementsState } from '@/features/achievements/domain/achievement-types';

interface CheckInput {
  tasbeehTotal: number;
  tasksCompletedTotal: number;
  azkarDaysCompleted: number;
  streakDays: number;
}

interface AchievementsStore extends AchievementsState {
  initialize: () => void;
  check: (input: CheckInput) => void;
  clearPendingCelebration: () => void;
}

const storage = new LocalStorageEngine();

const fallbackState: AchievementsState = {
  isInitialized: false,
  unlockedIds: [],
  pendingCelebration: [],
};

function normalizeState(raw: Partial<AchievementsState> | null): AchievementsState {
  if (!raw) return fallbackState;
  return {
    isInitialized: false,
    unlockedIds: Array.isArray(raw.unlockedIds)
      ? raw.unlockedIds.filter((id): id is string => typeof id === 'string')
      : [],
    pendingCelebration: [],
  };
}

function meetsCondition(id: string, input: CheckInput): boolean {
  switch (id) {
    case 'tasbeeh_33':   return input.tasbeehTotal >= 33;
    case 'tasbeeh_100':  return input.tasbeehTotal >= 100;
    case 'tasbeeh_500':  return input.tasbeehTotal >= 500;
    case 'tasbeeh_1000': return input.tasbeehTotal >= 1000;
    case 'task_1':       return input.tasksCompletedTotal >= 1;
    case 'task_10':      return input.tasksCompletedTotal >= 10;
    case 'task_50':      return input.tasksCompletedTotal >= 50;
    case 'azkar_day_1':  return input.azkarDaysCompleted >= 1;
    case 'azkar_day_7':  return input.azkarDaysCompleted >= 7;
    case 'streak_3':     return input.streakDays >= 3;
    case 'streak_7':     return input.streakDays >= 7;
    case 'streak_30':    return input.streakDays >= 30;
    default:             return false;
  }
}

export const useAchievementsStore = create<AchievementsStore>((set, get) => ({
  ...fallbackState,

  initialize: () => {
    if (get().isInitialized) return;
    const stored = storage.getItem<Partial<AchievementsState>>(STORAGE_KEYS.achievements);
    set({ ...normalizeState(stored), isInitialized: true });
  },

  check: (input) => {
    const state = get();
    if (!state.isInitialized) return;

    const newlyUnlocked: string[] = [];

    for (const def of ACHIEVEMENT_DEFINITIONS) {
      if (state.unlockedIds.includes(def.id)) continue;
      if (!meetsCondition(def.id, input)) continue;
      newlyUnlocked.push(def.id);
    }

    if (newlyUnlocked.length === 0) return;

    const nextUnlocked = [...state.unlockedIds, ...newlyUnlocked];
    storage.setItem(STORAGE_KEYS.achievements, { unlockedIds: nextUnlocked });

    // إشعار مرئي لكل إنجاز جديد
    for (const id of newlyUnlocked) {
      const def = ACHIEVEMENT_DEFINITIONS.find((a) => a.id === id);
      if (def) {
        showToast(`${def.icon} إنجاز جديد: ${def.title}`, 'success');
      }
    }

    set({
      unlockedIds: nextUnlocked,
      pendingCelebration: [...state.pendingCelebration, ...newlyUnlocked],
    });
  },

  clearPendingCelebration: () => set({ pendingCelebration: [] }),
}));
