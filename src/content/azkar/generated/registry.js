import { AZKAR_CATEGORY_SUMMARY } from './summary.js';

export const AZKAR_CATEGORY_LOADERS = {
  'azkar-after-prayer': () => import('./categories/azkar-after-prayer.js'),
  'azkar-evening': () => import('./categories/azkar-evening.js'),
  'azkar-morning': () => import('./categories/azkar-morning.js'),
  'azkar-sleep': () => import('./categories/azkar-sleep.js'),
  'azkar-wakeup': () => import('./categories/azkar-wakeup.js'),
};

export { AZKAR_CATEGORY_SUMMARY };
