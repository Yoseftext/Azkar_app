import { ACHIEVEMENT_DEFINITIONS } from '@/features/achievements/domain/achievement-definitions';
import { buildAchievementJourney } from '@/features/achievements/domain/achievement-journey';
import { useAchievementsStore } from '@/features/achievements/state/achievements-store';
import { AchievementJourneyCard } from '@/features/achievements/components/AchievementJourneyCard';
import { AchievementCollectionSection } from '@/features/achievements/components/AchievementCollectionSection';

export function AchievementsPage() {
  const unlockedIds = useAchievementsStore((state) => state.unlockedIds);

  const unlocked = ACHIEVEMENT_DEFINITIONS.filter((achievement) => unlockedIds.includes(achievement.id));
  const locked = ACHIEVEMENT_DEFINITIONS.filter((achievement) => !unlockedIds.includes(achievement.id));
  const summary = buildAchievementJourney(unlockedIds);

  return (
    <div className="space-y-4">
      <AchievementJourneyCard summary={summary} />
      <AchievementCollectionSection title="المفتوحة" items={unlocked} unlocked />
      <AchievementCollectionSection title="القادمة" items={locked} unlocked={false} />
    </div>
  );
}
