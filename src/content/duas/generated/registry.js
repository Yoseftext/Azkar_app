import { DUA_CATEGORY_SUMMARY } from './summary.js';

export const DUA_CATEGORY_LOADERS = {
  'dua-category-01-quran-duas': () => import('./categories/dua-category-01-quran-duas.js'),
  'dua-category-02-distress-debt': () => import('./categories/dua-category-02-distress-debt.js'),
  'dua-category-03-protection-fortification': () => import('./categories/dua-category-03-protection-fortification.js'),
  'dua-category-04-forgiveness-repentance': () => import('./categories/dua-category-04-forgiveness-repentance.js'),
  'dua-category-05-provision-blessing': () => import('./categories/dua-category-05-provision-blessing.js'),
  'dua-category-06-mercy-steadfastness-guidance': () => import('./categories/dua-category-06-mercy-steadfastness-guidance.js'),
  'dua-category-07-general-duas': () => import('./categories/dua-category-07-general-duas.js'),
  'dua-category-08-paradise-hell-hereafter': () => import('./categories/dua-category-08-paradise-hell-hereafter.js'),
  'dua-category-09-dunya-hereafter-goodness': () => import('./categories/dua-category-09-dunya-hereafter-goodness.js'),
  'dua-category-10-character-righteousness': () => import('./categories/dua-category-10-character-righteousness.js'),
  'dua-category-11-health-healing': () => import('./categories/dua-category-11-health-healing.js'),
  'dua-category-12-travel-road-provision': () => import('./categories/dua-category-12-travel-road-provision.js'),
  'dua-category-13-family-offspring': () => import('./categories/dua-category-13-family-offspring.js'),
  'dua-category-14-prayer-worship': () => import('./categories/dua-category-14-prayer-worship.js'),
  'dua-category-15-knowledge-understanding': () => import('./categories/dua-category-15-knowledge-understanding.js'),
};

export { DUA_CATEGORY_SUMMARY };
