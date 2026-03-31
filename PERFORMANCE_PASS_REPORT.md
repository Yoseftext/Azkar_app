# Performance Pass Report (Phase 14)

## هدف المرحلة
تقليل الحمل على startup والـ route entry بعد اكتمال الهجرة المعمارية والاختبارات.

## ما تم
- Split Firebase Auth runtime إلى dynamic chunk منفصلة عن main bootstrap.
- تفكيك `duas` إلى generated category modules + summary registry.
- تفكيك `stories` إلى generated category modules + summary registry.
- تحديث stores لتحميل selected/recent categories عند الطلب بدل سحب dataset كاملة مباشرة.
- إضافة scripts إعادة توليد:
  - `npm run duas:split`
  - `npm run stories:split`
  - `npm run content:split`

## نتائج build البارزة
### قبل
- `index-*.js` ≈ 385 kB
- `duasData-*.js` ≈ 335.95 kB
- `stories-*.js` ≈ 389.18 kB

### بعد
- `index-*.js` ≈ 66.90 kB
- `firebase-auth-*.js` ≈ 111.57 kB (منفصلة)
- `dua-category-*` chunks بحد أقصى ≈ 87.32 kB
- `story-category-*` chunks بحد أقصى ≈ 286.61 kB

## ملاحظات
- القصة/الفئة الأكبر ما زالت hotspot محتملة في القصص، لكنها لم تعد monolith واحدة مرتبطة بكل route.
- Bootstrap صار أخف بكثير، والـ auth لم تعد تسحب Firebase statically في المسار الأساسي.


## Phase 16 — Stories Manifest Hardening
- إزالة الـ `registry-*.js` العملاقة (~374 kB) من مسار القصص.
- استبدالها بـ `manifest-*.js` صغيرة (~3.57 kB) + summaries/registries على مستوى الفئة.
- بقاء startup قريبًا من نفس المستوى (`index` ≈ 68.58 kB بعد هذه الجولة) مع نقل الكلفة إلى route-specific chunks فقط.
- إضافة source manifest واضحة (`src/content/sources/stories/manifest.js`) تجعل إضافة القصص الجديدة عملية predictable بدل تعديل ملف واحد ضخم.


## Phase 17 — Story Summary Batching
- تحويل summaries القصصية من ملف summary واحد لكل فئة إلى batches صغيرة حسب `summaryBatchSize`.
- إضافة `load more` داخل `StoriesPage` بدل تحميل جميع summaries للفئة المختارة دفعة واحدة.
- النتائج البارزة من build:
  - أكبر batch summary في الفئة الأولى ≈ 17.40 kB بدل summary chunk كبيرة واحدة.
  - `StoriesPage` بقيت route chunk صغيرة (~11.39 kB).
  - startup bundle بقيت في نفس المجال تقريبًا (`index` ≈ 79.30 kB)، بينما انتقلت كلفة القصص إلى دفعات صغيرة أوضح وأكثر قابلية للتحكم.
