# Stories content authoring

- أضف أو عدّل القصص داخل `src/content/sources/stories/categories/*.js`.
- أضف أو حدّث الفئات من خلال `src/content/sources/stories/manifest.js`.
- يمكن لكل فئة تحديد `summaryBatchSize` للتحكم في عدد القصص التي تُحمَّل في كل دفعة summary داخل الصفحة.
- بعد أي تعديل شغّل: `npm run stories:split` ثم `npm test` ثم `npm run build`.

كل ملف فئة يصدّر `STORY_SOURCE_CATEGORY` بالشكل:

```js
export const STORY_SOURCE_CATEGORY = {
  slug: 'story-category-x-...',
  title: 'عنوان الفئة',
  stories: [
    {
      id: 1,
      title: 'عنوان القصة',
      story: 'النص الكامل',
      lesson: 'العبرة',
      source: 'المصدر'
    }
  ]
};
```
