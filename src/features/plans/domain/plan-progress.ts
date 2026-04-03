import type {
  GuidedPlanDefinition,
  GuidedPlanRequirement,
  GuidedPlanRequirementStatus,
  GuidedPlanRuntimeSnapshot,
  GuidedPlanSummary,
} from '@/features/plans/domain/plan-types';

function buildRequirementStatus(requirement: GuidedPlanRequirement, snapshot: GuidedPlanRuntimeSnapshot): GuidedPlanRequirementStatus {
  switch (requirement.kind) {
    case 'azkar': {
      const value = snapshot.azkarTodayCount;
      const target = requirement.target ?? 1;
      return { ...requirement, isCompleted: value >= target, progressLabel: `${Math.min(value, target)} / ${target}` };
    }
    case 'quran': {
      const value = snapshot.quranTodayReadings;
      const target = requirement.target ?? 1;
      return { ...requirement, isCompleted: value >= target, progressLabel: `${Math.min(value, target)} / ${target}` };
    }
    case 'duas': {
      const value = snapshot.duasTodayCount;
      const target = requirement.target ?? 1;
      return { ...requirement, isCompleted: value >= target, progressLabel: `${Math.min(value, target)} / ${target}` };
    }
    case 'names': {
      const value = snapshot.namesTodayCount;
      const target = requirement.target ?? 1;
      return { ...requirement, isCompleted: value >= target, progressLabel: `${Math.min(value, target)} / ${target}` };
    }
    case 'masbaha': {
      const value = snapshot.masbahaTodayCount;
      const target = requirement.target ?? 33;
      return { ...requirement, isCompleted: value >= target, progressLabel: `${Math.min(value, target)} / ${target}` };
    }
    case 'tasks': {
      const total = snapshot.completedTasks + snapshot.remainingTasks;
      const done = snapshot.remainingTasks === 0 && total > 0;
      return { ...requirement, isCompleted: done, progressLabel: done ? 'مكتمل' : `${snapshot.completedTasks} / ${total || 0}` };
    }
    default:
      return { ...requirement, isCompleted: false, progressLabel: '0 / 0' };
  }
}

export function buildGuidedPlanSummary(options: {
  definition: GuidedPlanDefinition;
  completedSessionKeys: string[];
  todayKey: string;
  snapshot: GuidedPlanRuntimeSnapshot;
}): GuidedPlanSummary {
  const { definition, completedSessionKeys, todayKey, snapshot } = options;
  const statuses = definition.requirements.map((requirement) => buildRequirementStatus(requirement, snapshot));
  const completedSessions = Math.min(completedSessionKeys.length, definition.durationDays);
  const completedToday = completedSessionKeys.includes(todayKey);
  const isSessionReady = statuses.every((status) => status.isCompleted);
  const isFinished = completedSessions >= definition.durationDays;
  const remainingSessions = Math.max(definition.durationDays - completedSessions, 0);
  const currentSession = isFinished ? definition.durationDays : Math.min(completedSessions + 1, definition.durationDays);
  const progressPercent = definition.durationDays === 0 ? 0 : Math.round((completedSessions / definition.durationDays) * 100);
  const nextRequirement = statuses.find((status) => !status.isCompleted) ?? null;

  return {
    definition,
    completedSessions,
    totalSessions: definition.durationDays,
    currentSession,
    progressPercent,
    completedToday,
    canCompleteToday: !completedToday && !isFinished && isSessionReady,
    remainingSessions,
    statuses,
    nextRequirementTitle: nextRequirement?.title ?? null,
  };
}

export function rankGuidedPlans(snapshot: GuidedPlanRuntimeSnapshot, activePlanId: string | null, definitions: GuidedPlanDefinition[]): GuidedPlanDefinition[] {
  return [...definitions].sort((left, right) => {
    const scoreLeft = scorePlan(left, snapshot, activePlanId);
    const scoreRight = scorePlan(right, snapshot, activePlanId);
    return scoreRight - scoreLeft;
  });
}

function scorePlan(plan: GuidedPlanDefinition, snapshot: GuidedPlanRuntimeSnapshot, activePlanId: string | null): number {
  if (plan.id === activePlanId) return 1000;
  let score = 0;

  switch (plan.focus) {
    case 'azkar':
      score += snapshot.azkarTodayCount === 0 ? 40 : 10;
      score += snapshot.masbahaTodayCount < 33 ? 20 : 5;
      break;
    case 'quran':
      score += snapshot.quranTodayReadings === 0 ? 40 : 10;
      score += snapshot.namesTodayCount === 0 ? 15 : 5;
      break;
    case 'names':
      score += snapshot.namesTodayCount === 0 ? 35 : 10;
      score += snapshot.duasTodayCount === 0 ? 15 : 5;
      break;
    case 'mixed':
      score += snapshot.remainingTasks > 0 ? 35 : 10;
      score += snapshot.quranTodayReadings === 0 ? 15 : 5;
      break;
  }

  score += Math.max(20 - plan.durationDays, 0);
  return score;
}
