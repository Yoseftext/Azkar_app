export interface AchievementDefinition {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface AchievementsState {
  isInitialized: boolean;
  unlockedIds: string[];
  pendingCelebration: string[];
}
