# Legacy Decommission Report

## الهدف
إيقاف الاعتماد على legacy runtime نهائيًا ومنع بقاء service worker/caches قديمة تتحكم في التطبيق بعد الهجرة إلى المسار الجديد.

## ما أُزيل من مسار التشغيل
- `js/` بالكامل.
- `data/` من root كمصدر runtime مباشر.
- `sw.js` القديمة.
- `manifest.json` القديمة.
- `dist/` المولدة سابقًا لمنع الالتباس بين المصدر والبناء القديم.

## ما نُقل
- `data/azkar.js` -> `tools/legacy-content/azkar.js` ثم `src/content/sources/azkar/manifest.js` + `categories/*.js`
- `data/duasData.js` -> `tools/legacy-content/duasData.js` ثم `src/content/sources/duas/manifest.js` + `categories/*.js`
- `data/stories.js` -> `src/content/sources/stories.js`
- `data/names.js` -> `src/content/sources/names.js`
- `data/quranData.js` -> `tools/legacy-content/quranData.js` كمصدر split tool فقط، وليس runtime.

## ما أُضيف
- `public/sw.js` حديثة ونظيفة.
- `src/kernel/pwa/pwa-runtime.ts` لتسجيل service worker الجديدة وتنظيف registrations/caches القديمة.

## المخاطر التي تم إغلاقها
- بقاء `sw.js` قديمة تكاشّف `js/*`, `ads`, `firestore`, `data/*`.
- استمرار app shell قديمة من cache رغم صحة الكود الجديد.
- ازدواجية مصادر المحتوى بين root و`src/content`.
- وجود `dist/` قديم داخل المصدر قد يضلل عملية النشر أو المراجعة.
