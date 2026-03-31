# Azkar App Next

واجهة أذكار Production-grade مبنية على React + Vite + TypeScript مع بنية modular قابلة للتوسع.

## الحالة الحالية
- الإعلانات محذوفة بالكامل.
- Firebase محصورة في Auth فقط.
- features الأساسية نُقلت إلى modules مستقلة (`tasks`, `masbaha`, `quran`, `azkar`, `duas`, `stories`, `names-of-allah`).
- الإحصائيات مبنية على aggregators مشتقة من stores بدل coupling مباشر بين الصفحات.
- legacy runtime القديمة (`js/*`) أُزيلت من مسار التشغيل، وتم استبدال Service Worker القديمة بمسار حديث ونظيف.
- الصفحات التعريفية والقانونية (`about/privacy/terms/contact`) أصبحت داخل React router نفسها، مع redirect shims للإصدارات القديمة.
- تم نقل المسار الملاحي إلى HashRouter لضمان سلامة التشغيل على static hosting مثل GitHub Pages بدون 404 عند التصفح الداخلي.

## التشغيل
```bash
npm install
npm run build
npm run preview
```

## المعمارية
```text
src/
  app/
  kernel/
  shared/
  content/
  features/
public/
  manifest.webmanifest
  sw.js
tools/
  split-quran-data.mjs
  legacy-content/
```

## أهم الحدود
- `app/`: bootstrap, providers, router, shell.
- `kernel/`: auth, storage, preferences, pwa.
- `shared/`: UI primitives وhelpers عامة.
- `content/`: raw sources + loaders + normalization.
- `features/`: vertical slices مستقلة لكل قسم.

## ملاحظات
- لا يوجد Firestore ولا cloud sync في المسار الجديد.
- إضافة قسم جديد تتم عبر feature جديدة + registration داخل `section-registry.ts`.
- أي ملفات legacy غير مستخدمة يجب أن تبقى خارج مسار التشغيل أو تُزال نهائيًا.


## Validation

```bash
npm run test:run
npm run test:coverage
```

## Content Authoring
- القصص: `STORIES_AUTHORING_GUIDE.md`
- الأذكار والأدعية: `ADHKAR_AND_DUAS_AUTHORING_GUIDE.md`
