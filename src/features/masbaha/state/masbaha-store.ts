import { create } from 'zustand';
import type { MasbahaState, PersistedMasbahaState } from '@/features/masbaha/domain/masbaha-types';
import { DEFAULT_MASBAHA_PHRASES, getNextDefaultPhrase } from '@/features/masbaha/domain/masbaha-selectors';
import { LocalStorageEngine } from '@/kernel/storage/local-storage-engine';
import { STORAGE_KEYS } from '@/kernel/storage/storage-keys';
import { getLocalDateKey, trimRecordToRecentDays } from '@/shared/lib/date';

interface MasbahaStore extends MasbahaState {
  initialize: () => void;
  increment: () => void;
  resetSession: () => void;
  setTarget: (target: number) => void;
  toggleSilent: () => void;
  selectPhrase: (phrase: string) => void;
  addCustomPhrase: (phrase: string) => { ok: boolean; error?: string };
  removeCustomPhrase: (phrase: string) => void;
}

const storage = new LocalStorageEngine();

const fallbackState: MasbahaState = {
  isInitialized: false,
  isSilent: false,
  currentTarget: 33,
  currentSessionCount: 0,
  totalCount: 0,
  selectedPhrase: DEFAULT_MASBAHA_PHRASES[0],
  customPhrases: [],
  dailyCounts: {},
};

function normalizePersistedState(rawValue: PersistedMasbahaState | null): MasbahaState {
  if (!rawValue) return fallbackState;

  const safeTarget = Number.isFinite(rawValue.currentTarget) && rawValue.currentTarget > 0 ? Math.floor(rawValue.currentTarget) : fallbackState.currentTarget;
  const safeSessionCount = Number.isFinite(rawValue.currentSessionCount) && rawValue.currentSessionCount >= 0 ? Math.floor(rawValue.currentSessionCount) : 0;
  const safeTotalCount = Number.isFinite(rawValue.totalCount) && rawValue.totalCount >= 0 ? Math.floor(rawValue.totalCount) : 0;
  const safeCustomPhrases = Array.isArray(rawValue.customPhrases)
    ? [...new Set(rawValue.customPhrases.map((phrase) => String(phrase).trim()).filter(Boolean))]
    : [];
  const safeSelectedPhrase = String(rawValue.selectedPhrase || '').trim() || fallbackState.selectedPhrase;
  const safeDailyCounts = trimRecordToRecentDays(
    Object.fromEntries(
      Object.entries(rawValue.dailyCounts ?? {}).map(([dateKey, value]) => [dateKey, Number.isFinite(value) && value > 0 ? Math.floor(value) : 0]),
    ),
    180,
  );

  return {
    isInitialized: false,
    isSilent: Boolean(rawValue.isSilent),
    currentTarget: safeTarget,
    currentSessionCount: safeSessionCount,
    totalCount: safeTotalCount,
    selectedPhrase: safeSelectedPhrase,
    customPhrases: safeCustomPhrases,
    dailyCounts: safeDailyCounts,
  };
}

function persist(state: MasbahaState): void {
  const payload: PersistedMasbahaState = {
    isSilent: state.isSilent,
    currentTarget: state.currentTarget,
    currentSessionCount: state.currentSessionCount,
    totalCount: state.totalCount,
    selectedPhrase: state.selectedPhrase,
    customPhrases: state.customPhrases,
    dailyCounts: trimRecordToRecentDays(state.dailyCounts, 180),
  };

  storage.setItem(STORAGE_KEYS.masbaha, payload);
}

export const useMasbahaStore = create<MasbahaStore>((set, get) => ({
  ...fallbackState,
  initialize: () => {
    if (get().isInitialized) return;
    const stored = storage.getItem<PersistedMasbahaState>(STORAGE_KEYS.masbaha);
    set({ ...normalizePersistedState(stored), isInitialized: true });
  },
  increment: () => {
    const state = get();
    const todayKey = getLocalDateKey();
    const nextSessionCount = state.currentSessionCount + 1;
    const nextSelectedPhrase = nextSessionCount % state.currentTarget === 0 ? getNextDefaultPhrase(state.selectedPhrase) : state.selectedPhrase;

    const nextState: MasbahaState = {
      ...state,
      currentSessionCount: nextSessionCount,
      totalCount: state.totalCount + 1,
      selectedPhrase: nextSelectedPhrase,
      dailyCounts: {
        ...state.dailyCounts,
        [todayKey]: (state.dailyCounts[todayKey] ?? 0) + 1,
      },
    };

    persist(nextState);
    set(nextState);
  },
  resetSession: () => {
    const nextState = { ...get(), currentSessionCount: 0 };
    persist(nextState);
    set(nextState);
  },
  setTarget: (target) => {
    const safeTarget = Number.isFinite(target) && target > 0 ? Math.floor(target) : get().currentTarget;
    const nextState = { ...get(), currentTarget: safeTarget };
    persist(nextState);
    set(nextState);
  },
  toggleSilent: () => {
    const nextState = { ...get(), isSilent: !get().isSilent };
    persist(nextState);
    set(nextState);
  },
  selectPhrase: (phrase) => {
    const normalizedPhrase = phrase.trim();
    if (!normalizedPhrase) return;
    const nextState = { ...get(), selectedPhrase: normalizedPhrase };
    persist(nextState);
    set(nextState);
  },
  addCustomPhrase: (phrase) => {
    const normalizedPhrase = phrase.trim();
    if (!normalizedPhrase) return { ok: false, error: 'أدخل ذكراً صحيحاً أولاً.' };

    const state = get();
    const exists = [...DEFAULT_MASBAHA_PHRASES, ...state.customPhrases].some((item) => item === normalizedPhrase);
    if (exists) return { ok: false, error: 'هذا الذكر موجود بالفعل.' };

    const nextState = {
      ...state,
      selectedPhrase: normalizedPhrase,
      customPhrases: [normalizedPhrase, ...state.customPhrases],
    };

    persist(nextState);
    set(nextState);
    return { ok: true };
  },
  removeCustomPhrase: (phrase) => {
    const state = get();
    const nextCustomPhrases = state.customPhrases.filter((item) => item !== phrase);
    const nextState = {
      ...state,
      customPhrases: nextCustomPhrases,
      selectedPhrase: state.selectedPhrase === phrase ? DEFAULT_MASBAHA_PHRASES[0] : state.selectedPhrase,
    };

    persist(nextState);
    set(nextState);
  },
}));
