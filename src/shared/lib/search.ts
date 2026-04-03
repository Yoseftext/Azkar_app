export function normalizeSearchTerm(value: string): string {
  return String(value ?? '')
    .normalize('NFKD')
    .replace(/[ً-ٰٟۖ-ۭـ]/g, '')
    .replace(/[إأآٱ]/g, 'ا')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/[^\p{L}\p{N}\s-]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

export function splitSearchTerms(value: string): string[] {
  return normalizeSearchTerm(value).split(' ').filter(Boolean);
}

function scoreNormalizedValue(normalizedQuery: string, normalizedValue: string): number {
  if (!normalizedQuery || !normalizedValue) return 0;
  if (normalizedValue === normalizedQuery) return 120;
  if (normalizedValue.startsWith(normalizedQuery)) return 90;
  if (normalizedValue.includes(` ${normalizedQuery}`)) return 75;
  if (normalizedValue.includes(normalizedQuery)) return 60;

  const queryParts = normalizedQuery.split(' ').filter(Boolean);
  if (queryParts.length > 1 && queryParts.every((part) => normalizedValue.includes(part))) {
    return 40;
  }

  return 0;
}

export function scoreSearchMatch(query: string, ...values: string[]): number {
  const normalizedQuery = normalizeSearchTerm(query);
  if (!normalizedQuery) return 0;

  return values.reduce((bestScore, rawValue) => {
    const score = scoreNormalizedValue(normalizedQuery, normalizeSearchTerm(rawValue));
    return score > bestScore ? score : bestScore;
  }, 0);
}

export function compareSearchRank<T>(
  left: { score: number; value: T },
  right: { score: number; value: T },
  tieBreaker?: (left: T, right: T) => number,
): number {
  if (left.score !== right.score) return right.score - left.score;
  return tieBreaker ? tieBreaker(left.value, right.value) : 0;
}
