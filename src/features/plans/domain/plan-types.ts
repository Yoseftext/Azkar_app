export type GuidedPlanTone = 'sky' | 'emerald' | 'amber';
export type GuidedPlanFocus = 'azkar' | 'quran' | 'names' | 'mixed';
export type GuidedPlanRequirementKind = 'azkar' | 'quran' | 'duas' | 'names' | 'masbaha' | 'tasks';

export interface GuidedPlanRequirement {
  id: string;
  kind: GuidedPlanRequirementKind;
  title: string;
  body: string;
  to: string;
  target?: number;
}

export interface GuidedPlanDefinition {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  tone: GuidedPlanTone;
  focus: GuidedPlanFocus;
  durationDays: number;
  icon: string;
  requirements: GuidedPlanRequirement[];
}

export interface GuidedPlanRuntimeSnapshot {
  completedTasks: number;
  remainingTasks: number;
  azkarTodayCount: number;
  quranTodayReadings: number;
  duasTodayCount: number;
  namesTodayCount: number;
  masbahaTodayCount: number;
}

export interface GuidedPlanRequirementStatus extends GuidedPlanRequirement {
  isCompleted: boolean;
  progressLabel: string;
}

export interface GuidedPlanSummary {
  definition: GuidedPlanDefinition;
  completedSessions: number;
  totalSessions: number;
  currentSession: number;
  progressPercent: number;
  completedToday: boolean;
  canCompleteToday: boolean;
  remainingSessions: number;
  statuses: GuidedPlanRequirementStatus[];
  nextRequirementTitle: string | null;
}

export interface PersistedPlansState {
  activePlanId: string | null;
  progressByPlanId: Record<string, { startedAtKey: string; completedSessionKeys: string[] }>;
}
