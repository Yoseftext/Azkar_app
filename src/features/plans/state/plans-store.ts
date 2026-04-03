import { create } from 'zustand';
import { LocalStorageEngine } from '@/kernel/storage/local-storage-engine';
import { STORAGE_KEYS } from '@/kernel/storage/storage-keys';
import { getLocalDateKey, sortDateKeys } from '@/shared/lib/date';
import { getGuidedPlanById } from '@/features/plans/domain/plan-definitions';
import type { PersistedPlansState } from '@/features/plans/domain/plan-types';

const storage = new LocalStorageEngine();

interface PlanProgressState {
  startedAtKey: string;
  completedSessionKeys: string[];
}

interface PlansStore {
  activePlanId: string | null;
  progressByPlanId: Record<string, PlanProgressState>;
  isInitialized: boolean;
  initialize: () => void;
  startPlan: (planId: string) => void;
  stopPlan: () => void;
  completeTodaySession: () => void;
}

function normalizePersistedPlansState(rawValue: PersistedPlansState | null): Pick<PlansStore, 'activePlanId' | 'progressByPlanId'> {
  const progressByPlanId = Object.fromEntries(
    Object.entries(rawValue?.progressByPlanId ?? {}).flatMap(([planId, state]) => {
      if (!getGuidedPlanById(planId)) return [];
      const startedAtKey = typeof state?.startedAtKey === 'string' ? state.startedAtKey : getLocalDateKey();
      const completedSessionKeys = Array.isArray(state?.completedSessionKeys)
        ? sortDateKeys(state.completedSessionKeys.filter((value): value is string => typeof value === 'string'))
        : [];
      return [[planId, { startedAtKey, completedSessionKeys }]];
    }),
  ) as Record<string, PlanProgressState>;

  const activePlanId = getGuidedPlanById(rawValue?.activePlanId ?? null)?.id ?? null;
  return { activePlanId, progressByPlanId };
}

function persistPlansState(state: Pick<PlansStore, 'activePlanId' | 'progressByPlanId'>) {
  storage.setItem<PersistedPlansState>(STORAGE_KEYS.plans, {
    activePlanId: state.activePlanId,
    progressByPlanId: Object.fromEntries(
      Object.entries(state.progressByPlanId).map(([planId, planState]) => [
        planId,
        {
          startedAtKey: planState.startedAtKey,
          completedSessionKeys: sortDateKeys(planState.completedSessionKeys).slice(-365),
        },
      ]),
    ),
  });
}

function createFreshPlanProgressState(): PlanProgressState {
  return { startedAtKey: getLocalDateKey(), completedSessionKeys: [] };
}

export const usePlansStore = create<PlansStore>((set, get) => ({
  activePlanId: null,
  progressByPlanId: {},
  isInitialized: false,

  initialize: () => {
    if (get().isInitialized) return;
    const normalized = normalizePersistedPlansState(storage.getItem<PersistedPlansState>(STORAGE_KEYS.plans));
    persistPlansState(normalized);
    set({ ...normalized, isInitialized: true });
  },

  startPlan: (planId) => {
    if (!getGuidedPlanById(planId)) return;
    const currentState = get();
    const nextProgressByPlanId = {
      ...currentState.progressByPlanId,
      [planId]: currentState.progressByPlanId[planId] ?? createFreshPlanProgressState(),
    };
    const nextState = { activePlanId: planId, progressByPlanId: nextProgressByPlanId };
    persistPlansState(nextState);
    set(nextState);
  },

  stopPlan: () => {
    const currentState = get();
    const nextState = { activePlanId: null, progressByPlanId: currentState.progressByPlanId };
    persistPlansState(nextState);
    set(nextState);
  },

  completeTodaySession: () => {
    const currentState = get();
    const activePlanId = currentState.activePlanId;
    if (!activePlanId) return;

    const todayKey = getLocalDateKey();
    const currentProgress = currentState.progressByPlanId[activePlanId] ?? createFreshPlanProgressState();
    if (currentProgress.completedSessionKeys.includes(todayKey)) return;

    const nextProgressByPlanId = {
      ...currentState.progressByPlanId,
      [activePlanId]: {
        ...currentProgress,
        completedSessionKeys: sortDateKeys([...currentProgress.completedSessionKeys, todayKey]),
      },
    };

    const nextState = { activePlanId, progressByPlanId: nextProgressByPlanId };
    persistPlansState(nextState);
    set(nextState);
  },
}));

export function resetPlansStoreForTests() {
  storage.removeItem(STORAGE_KEYS.plans);
  usePlansStore.setState({ activePlanId: null, progressByPlanId: {}, isInitialized: false });
}
