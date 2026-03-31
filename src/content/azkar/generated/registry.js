import { AZKAR_CATEGORY_SUMMARY } from './summary.js';

export const AZKAR_CATEGORY_LOADERS = {
  'أذكار-الصباح': () => import('./categories/أذكار-الصباح.js'),
  'أذكار-المساء': () => import('./categories/أذكار-المساء.js'),
  'أذكار-النوم': () => import('./categories/أذكار-النوم.js'),
  'أذكار-الاستيقاظ': () => import('./categories/أذكار-الاستيقاظ.js'),
  'أذكار-بعد-الصلاة': () => import('./categories/أذكار-بعد-الصلاة.js'),
};

export { AZKAR_CATEGORY_SUMMARY };
