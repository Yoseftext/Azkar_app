import type { MasbahaState } from '@/features/masbaha/domain/masbaha-types';
import { getMasbahaActiveStreak, getMasbahaProgressRatio, getMasbahaTodayCount } from '@/features/masbaha/domain/masbaha-selectors';

export interface MasbahaSessionHeroModel {
  title: string;
  body: string;
  progressLabel: string;
  streakLabel: string;
}

export function buildMasbahaSessionHero(state: Pick<MasbahaState, 'currentSessionCount' | 'currentTarget' | 'selectedPhrase' | 'dailyCounts'>): MasbahaSessionHeroModel {
  const todayCount = getMasbahaTodayCount(state);
  const streak = getMasbahaActiveStreak(state);
  const effectiveProgress = Math.round(getMasbahaProgressRatio(state) * 100);

  if (state.currentSessionCount <= 0) {
    return {
      title: 'ابدأ جلسة التسبيح',
      body: `ابدأ الآن بـ ${state.selectedPhrase}، واجعلها جلسة قصيرة وواضحة بدل العدّ العشوائي.`,
      progressLabel: `اليوم ${todayCount} • الهدف ${state.currentTarget}`,
      streakLabel: streak > 0 ? `سلسلة ${streak} يوم` : 'ابدأ سلسلة جديدة اليوم',
    };
  }

  return {
    title: `تابع ${state.selectedPhrase}`,
    body: `أنت عند ${state.currentSessionCount} من ${state.currentTarget} في هذه الدورة. خطوة قصيرة الآن تقرّبك من إغلاق الجلسة بشكل مريح.`,
    progressLabel: `${effectiveProgress}% من الدورة الحالية`,
    streakLabel: streak > 0 ? `سلسلة ${streak} يوم` : 'سجّل يومك الحالي',
  };
}

export function getMasbahaTargetPresets(currentTarget: number): number[] {
  const normalizedTarget = Number.isFinite(currentTarget) && currentTarget > 0 ? Math.floor(currentTarget) : 33;
  const defaults = [33, 100, 300];
  return [...new Set([...defaults, normalizedTarget])];
}
