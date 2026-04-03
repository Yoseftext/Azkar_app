import type { AzkarCategory, AzkarState } from '@/features/azkar/domain/azkar-types';
import { getAzkarCategoryProgressForToday } from '@/features/azkar/domain/azkar-selectors';

const SESSION_DEFINITIONS = [
  {
    key: 'morning',
    slug: 'azkar-morning',
    title: 'جلسة الصباح',
    tone: 'sky' as const,
    description: 'ابدأ يومك بورد قصير واضح وخطوات متتابعة.',
  },
  {
    key: 'evening',
    slug: 'azkar-evening',
    title: 'جلسة المساء',
    tone: 'amber' as const,
    description: 'راجع أذكار المساء في جلسة واحدة هادئة.',
  },
  {
    key: 'sleep',
    slug: 'azkar-sleep',
    title: 'جلسة النوم',
    tone: 'emerald' as const,
    description: 'اختتم يومك بأذكار النوم في مسار سريع.',
  },
] as const;

type SessionDefinition = (typeof SESSION_DEFINITIONS)[number];

export interface AzkarSessionCard {
  key: SessionDefinition['key'];
  slug: string;
  title: string;
  description: string;
  tone: SessionDefinition['tone'];
  total: number;
  completed: number;
  actionLabel: string;
}

export interface AzkarRitualHero {
  slug: string;
  title: string;
  body: string;
  actionLabel: string;
  tone: 'sky' | 'amber' | 'emerald';
}

export interface AzkarResumeRecommendation {
  slug: string;
  title: string;
  completed: number;
  total: number;
}

function getCategoryBySlug(categories: AzkarCategory[], slug: string): AzkarCategory | null {
  return categories.find((category) => category.slug === slug) ?? null;
}

function getSessionCard(state: AzkarState, definition: SessionDefinition): AzkarSessionCard | null {
  const category = getCategoryBySlug(state.categories, definition.slug);
  if (!category) return null;

  const progress = getAzkarCategoryProgressForToday(state, category.slug);
  const actionLabel = progress.completed > 0 && progress.completed < progress.total ? 'تابع الجلسة' : 'ابدأ الجلسة';

  return {
    key: definition.key,
    slug: category.slug,
    title: definition.title,
    description: definition.description,
    tone: definition.tone,
    total: progress.total,
    completed: progress.completed,
    actionLabel,
  };
}

export function getAzkarSessionCards(state: AzkarState): AzkarSessionCard[] {
  return SESSION_DEFINITIONS.map((definition) => getSessionCard(state, definition)).filter((card): card is AzkarSessionCard => Boolean(card));
}

function getPreferredSessionKey(now: Date): SessionDefinition['key'] {
  const hour = now.getHours();
  if (hour >= 4 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 19) return 'evening';
  return 'sleep';
}

function formatProgressBody(card: AzkarSessionCard): string {
  if (card.completed === 0) {
    return `${card.description} لديك ${card.total} أذكار في هذه الجلسة.`;
  }

  if (card.completed >= card.total) {
    return `أكملت ${card.title} اليوم. يمكنك مراجعته مرة أخرى أو الانتقال لورد آخر.`;
  }

  return `أنجزت ${card.completed} من ${card.total} اليوم. تابع من حيث توقفت دون البدء من الصفر.`;
}

export function getAzkarRitualHero(state: AzkarState, now: Date = new Date()): AzkarRitualHero | null {
  const cards = getAzkarSessionCards(state);
  if (cards.length === 0) return null;

  const preferredKey = getPreferredSessionKey(now);
  const preferredIncomplete = cards.find((card) => card.key === preferredKey && card.completed < card.total);
  const recentIncomplete = state.recentCategorySlugs
    .map((slug) => cards.find((card) => card.slug === slug && card.completed < card.total))
    .find((card): card is AzkarSessionCard => Boolean(card));
  const fallback = cards.find((card) => card.key === preferredKey) ?? cards[0];

  const selected = preferredIncomplete ?? recentIncomplete ?? fallback;
  if (!selected) return null;

  return {
    slug: selected.slug,
    title: selected.title,
    body: formatProgressBody(selected),
    actionLabel: selected.actionLabel,
    tone: selected.tone,
  };
}

export function getAzkarResumeRecommendation(state: AzkarState): AzkarResumeRecommendation | null {
  const recentCandidate = state.recentCategorySlugs
    .map((slug) => getCategoryBySlug(state.categories, slug))
    .find((category): category is AzkarCategory => Boolean(category));

  const fallback = recentCandidate ?? getCategoryBySlug(state.categories, state.selectedCategorySlug ?? '') ?? state.categories[0] ?? null;
  if (!fallback) return null;

  const progress = getAzkarCategoryProgressForToday(state, fallback.slug);
  return {
    slug: fallback.slug,
    title: fallback.title,
    completed: progress.completed,
    total: progress.total,
  };
}
