# Adhkar & Duas Authoring Guide

## الهدف
جعل إضافة **ذكر جديد** أو **دعاء جديد** أو **تصنيف كامل** عملية واضحة ومضبوطة مثل القصص، بدون لمس loaders أو stores أو generated runtime يدويًا.

## المسارات الصحيحة
### الأذكار
- manifest المصدر: `src/content/sources/azkar/manifest.js`
- ملفات التصنيفات: `src/content/sources/azkar/categories/*.js`
- generated runtime: `src/content/azkar/generated/` **(لا تعدلها يدويًا)**

### الأدعية
- manifest المصدر: `src/content/sources/duas/manifest.js`
- ملفات التصنيفات: `src/content/sources/duas/categories/*.js`
- generated runtime: `src/content/duas/generated/` **(لا تعدلها يدويًا)**

## إضافة ذكر إلى تصنيف موجود
افتح ملف التصنيف المناسب داخل `src/content/sources/azkar/categories/` وأضف عنصرًا بالشكل:

```js
{
  id: 6,
  text: 'نص الذكر',
  repeatTarget: 3,
  reference: 'أبو داود'
}
```

## إضافة تصنيف أذكار جديد
1. أنشئ ملفًا جديدًا داخل `src/content/sources/azkar/categories/`.
2. صدّر `AZKAR_SOURCE_CATEGORY` بهذا الشكل:

```js
export const AZKAR_SOURCE_CATEGORY = {
  slug: 'أذكار-السفر',
  title: 'أذكار السفر',
  items: [
    {
      id: 1,
      text: 'الله أكبر، الله أكبر، الله أكبر...',
      repeatTarget: 1,
      reference: 'مسلم'
    }
  ]
};
```

3. أضف entry جديدًا في `src/content/sources/azkar/manifest.js`:

```js
{
  slug: 'أذكار-السفر',
  title: 'أذكار السفر',
  fileName: 'أذكار-السفر.js'
}
```

## إضافة دعاء إلى تصنيف موجود
افتح ملف التصنيف المناسب داخل `src/content/sources/duas/categories/` وأضف عنصرًا بالشكل:

```js
{
  id: 601,
  text: 'اللهم إني أسألك العفو والعافية',
  reference: 'الترمذي',
  source: 'HisnElMuslim',
  repeatTarget: 1,
  description: 'دعاء مختصر جامع',
  originalCategory: 'أدعية عامة'
}
```

## إضافة تصنيف أدعية جديد
1. أنشئ ملفًا جديدًا داخل `src/content/sources/duas/categories/`.
2. صدّر `DUA_SOURCE_CATEGORY` بهذا الشكل:

```js
export const DUA_SOURCE_CATEGORY = {
  slug: 'dua-category-16-أدعية-السفر',
  title: 'أدعية السفر',
  items: [
    {
      id: 1,
      text: 'سبحان الذي سخر لنا هذا...',
      reference: 'مسلم',
      source: 'HisnElMuslim',
      repeatTarget: 1,
      description: 'دعاء الركوب والسفر',
      originalCategory: 'أدعية السفر'
    }
  ]
};
```

3. أضف entry جديدًا في `src/content/sources/duas/manifest.js`:

```js
{
  slug: 'dua-category-16-أدعية-السفر',
  title: 'أدعية السفر',
  fileName: 'dua-category-16-أدعية-السفر.js'
}
```

## بعد أي تعديل
شغّل بالترتيب:

```bash
npm run azkar:split
npm run duas:split
npm test
npm run build
```

أو مباشرة:

```bash
npm run content:split
npm test
npm run build
```

## مهم جدًا
- لا تعدّل أي ملف داخل `src/content/azkar/generated/` أو `src/content/duas/generated/` يدويًا.
- حافظ على ثبات `slug` للتصنيفات الموجودة، لأن تغييرها قد يكسر المراجع persisted مثل التصنيف المختار أو التصنيفات الحديثة.
- في الأذكار: `id` يجب أن تبقى فريدة داخل التصنيف الواحد.
- في الأدعية: يفضّل أن تبقى `id` فريدة على مستوى التصنيف، ومع مرورها عبر generated runtime تُعامل كهوية ثابتة للعنصر.
