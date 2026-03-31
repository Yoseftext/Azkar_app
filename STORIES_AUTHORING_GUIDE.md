# Stories Authoring Guide

## الهدف
إضافة قصص جديدة أو فئات قصصية جديدة بدون لمس loader/store logic أو generated runtime files يدويًا.

## مكان التعديل الصحيح
- manifest المصدر: `src/content/sources/stories/manifest.js`
- ملفات الفئات: `src/content/sources/stories/categories/*.js`

## إضافة قصة داخل فئة موجودة
1. افتح ملف الفئة المناسب داخل `src/content/sources/stories/categories/`.
2. أضف عنصرًا جديدًا داخل `stories` بالشكل:

```js
{
  id: 251,
  title: 'عنوان القصة',
  story: 'النص الكامل',
  lesson: 'العبرة',
  source: 'المصدر'
}
```

## إضافة فئة جديدة
1. أنشئ ملفًا جديدًا داخل `src/content/sources/stories/categories/`.
2. صدّر `STORY_SOURCE_CATEGORY` بهذا الشكل:

```js
export const STORY_SOURCE_CATEGORY = {
  slug: 'story-category-4-عنوان-الفئة',
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

3. أضف entry جديدًا في `src/content/sources/stories/manifest.js`:

```js
{
  slug: 'story-category-4-عنوان-الفئة',
  title: 'عنوان الفئة',
  fileName: 'story-category-4-عنوان-الفئة.js',
  summaryBatchSize: 24
}
```

## ما هو `summaryBatchSize`؟
عدد القصص summary التي تُحمَّل دفعة واحدة عند فتح الفئة. كلما صغّرتها قلّ حجم chunk الأولية لتلك الفئة، لكن زادت طلبات التحميل عند الضغط على "تحميل قصص إضافية".

## بعد أي تعديل
شغّل:

```bash
npm run stories:split
npm test
npm run build
```

## مهم
- لا تعدّل أي ملف داخل `src/content/stories/generated/` يدويًا.
- الـ IDs يجب أن تكون فريدة داخل الفئة نفسها فقط؛ runtime سيؤهلها تلقائيًا إلى `categorySlug::id`.
- لو غيّرت `slug` لفئة موجودة، توقع أن تفقد مراجع persisted القديمة لهذه الفئة لأن الهوية المنطقية ستتغير.
