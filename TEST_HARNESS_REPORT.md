# Test Harness Report

## الهدف
إضافة quality gate قابلة للتشغيل داخل البيئة الحالية بدون الاعتماد على runner خارجي أو network install، ثم توسيعها لتغطي stores الأساسية وما تبقى من الفروع الحرجة بعد الهجرة.

## النهج
- استخدام `node:test` بدل Vitest بسبب عدم توفر network/dependency install في البيئة الحالية.
- إضافة custom TypeScript alias loader محلي لحل مسارات `@/` وتشغيل ملفات `.ts` مباشرة.
- إضافة shim محلي لـ `zustand` يكفي لتشغيل store logic في اختبارات الوحدة.
- توسيع shim القرآن لتغطي `loadSurahAyahs()` حتى تعمل `quran-store` بدون Vite runtime transforms.
- تثبيت بيئة اختبار محلية لـ `window.localStorage`, `caches`, `navigator.serviceWorker`, و`Date`.

## المسارات المغطاة الآن
- date utilities
- content loaders: `azkar`, `duas`, `names`, `stories`
- selectors: `masbaha-selectors`
- stores: `tasks`, `masbaha`, `quran`, `azkar`, `duas`, `stories`, `names-of-allah`
- stats aggregators
- PWA cleanup helpers و`initializePwaRuntime()`

## أوامر التحقق
- `npm run test`
- `npm run test:coverage`

## آخر نتيجة تشغيل
- **60 / 60 tests passing**
- المرحلة 13 أضافت route-level integration لمسارات `home`, `tasks`, `quran`, `settings`, و`names-of-allah`.
- المرحلة 19 وسّعت route-level integration لتشمل `stats` و`profile` بحالات signed-in وguest/unconfigured.
- المرحلة 20 وسّعت route-level integration إلى `azkar`, `duas`, و`stories` مع سيناريوهات search/filter/load-more/open detail داخل `AppShell`.
- المرحلة 21 وسّعت route-level integration إلى `quran` reader نفسه، مع حالات `reader open`, `loading + error`, و`empty search` داخل `AppShell`.
- المرحلة 12 أغلقت الفروع الأقل تغطية في:
  - `masbaha-selectors`
  - `pwa-runtime`
  - `date.ts`
  - `load-names.ts`
  - `load-stories.ts`

## الإصلاحات التي كشفها الاختبار فعلًا
- `parseDateKey()` كان يقبل تواريخ غير موجودة مثل `2026-02-31` بسبب سلوك `Date` الافتراضي؛ تم إصلاحه بالتحقق من round-trip date key.
- `trimRecordToRecentDays()` كان يقارن timestamp منتصف اليوم بدل local date boundary، مما قد يسقط بيانات اليوم نفسه عند `daysToKeep=1`.
- `normalizeSearchValue()` في `load-names.ts` لم تكن تطبع بعض أشكال الألف/التشكيل العربية بشكل كافٍ، فكانت بعض الاستعلامات المنطقية لا تطابق مثل `ٱلرَّحْمَٰن` → `الرحمن`.
- `unregisterUnexpectedRegistrations()` في PWA كانت تتجاهل registrations stale بدون `active.scriptURL` واضح؛ أصبحت الآن تتعامل أيضًا مع `waiting/installing/null` script URLs.

## حدود هذا الجيل من الاختبارات
- لا توجد DOM interaction tests كاملة؛ الموجود الآن React server-rendered route integration بدون محاكاة أحداث المستخدم.
- لا توجد DOM interaction tests كاملة؛ الموجود الآن React server-rendered route integration بدون محاكاة أحداث المستخدم.
- لا توجد E2E حتى الآن.

## المسار التالي
- بناء DOM/component tests للـ critical pages بدل الاكتفاء بـ server-rendered integration.
- مراجعة route-level summaries في `duas` لمعرفة هل تحتاج batching إضافي أو virtualized presentation.
- استبدال الـ experimental loader بمسار أقل اعتمادًا على hooks التجريبية عندما تستقر بيئة التشغيل.

## إضافة المرحلة 13
- تمت ترقية `alias-loader` لاستخدام `typescript.transpileModule` لتشغيل `.ts/.tsx` داخل `node:test`.
- أضيفت `render-route` helper مع `MemoryRouter + AppShell + renderToStaticMarkup` لاختبار route/page/store integration بدون React Testing Library.
- أضيفت `reset-stores` helper لعزل stores بين اختبارات المسارات.
- أضيفت suite `routes-integration.test.ts` لتغطية shell metadata, page content, وstore-driven UI على أهم المسارات.

## إضافة المرحلة 19
- أضيفت route-level integration لـ `StatsPage` مع seeded snapshots تغطي aggregators اليومية داخل `AppShell`.
- أضيفت route-level integration لـ `ProfilePage` في حالتي signed-in وguest/unconfigured.
- تم تحسين `ProfilePage` نفسها لتصبح account snapshot أوضح مع status hints وروابط داخلية مرتبطة بالحساب والسياسات.


## إضافة المرحلة 20
- أضيفت `route-fixtures` helpers لتكوين فئات/عناصر `azkar`, `duas`, و`stories` بشكل متسق عبر route-level integration.
- أضيفت اختبارات route-level لمسارات `AzkarPage`, `DuasPage`, و`StoriesPage` تغطي fallback selection, search filtering, sources/favorites badges, batch-aware summaries, وزر `تحميل قصص إضافية`.
- التوسيع كشف أن بعض pages تعتمد في التصفية على حقول مشتقة مثل `categoryTitle/categorySlug` داخل items، لذلك تم تقوية fixtures لتطابق runtime truth بدل إعطاء اختبارات confidence زائف.


## إضافة المرحلة 21
- أضيفت fixtures قرآنية مشتركة (`makeQuranBookmark`, `makeQuranAyah`) لتقليل تكرار seed data في route-level integration.
- أضيفت اختبارات route-level لـ `QuranPage` تغطي القارئ المفتوح مع الآيات الفعلية، loading+error state، وempty search state داخل `AppShell`.
- التوسيع أكد أن `QuranPage` نفسها أصبحت مغطاة route-level بدرجة أعلى مع بقاء `test`, `test:coverage`, و`build` جميعها ناجحة.


## إضافة المرحلة 22
- تمت ترقية `alias-loader` لتدعم `import.meta.glob(pattern, { import: 'default' })` وقراءة JSON modules الحقيقية داخل `node:test`، بدل الاكتفاء بـ quran shim فقط.
- أضيفت suite `load-quran-runtime.test.ts` لاختبار `src/content/loaders/load-quran.ts` نفسها عبر relative import، بما في ذلك `preloadSurahAyahs`, `loadSurahAyahs`, وinvalid-surah behavior على ملفات `src/content/quran/surahs/*.json` الفعلية.
- كشفت هذه المرحلة gap حقيقية في `normalizeArabicSearchTerm()` داخل القرآن، وتم إصلاحها بإزالة التشكيل والعلامات القرآنية الموسعة مثل `ٰ`، لا بتخفيف الاختبار.


## إضافة المرحلة 23
- تمت إضافة `dom-harness` محلية لتشغيل `react-dom/client` فوق fake DOM بدل الاكتفاء بـ server-rendered integration فقط.
- تم إصلاح root cause في `zustand` test shim نفسها؛ كانت snapshot-only وغير reactive، وأصبحت الآن مبنية على `useSyncExternalStore` بحيث تعيد pages render فعليًا بعد تغير الـ store.
- أضيفت component interaction tests لصفحات `SettingsPage`, `QuranPage`, `DuasPage`, و`StoriesPage` لتغطية interactions حقيقية مثل الضغط والكتابة وload-more وتبديل الحالة الظاهرة.
- نتيجة هذه المرحلة: `npm test` = **60 / 60 passing** و`npm run build` ناجح.
- المرحلة 24 المقبلة مخصصة لمسار authoring واضح لـ `duas/azkar` مثل القصص، والمرحلة 25 ستصبح Browser/E2E verification.

## Browser runtime verification
- Added `npm run verify:browser` to validate the built `dist/` artifact over a local static HTTP server.
- This step checks redirect shims, 404 hash fallback, manifest invariants, and service worker contents without introducing a heavy external E2E runner.

## Phase 26 — Real browser E2E harness
- Added a CDP-driven Chromium headless harness that verifies the built artifact instead of the source tree.
- Target scenarios in the harness: legacy legal redirect, settings theme persistence across reload, Quran search/open/bookmark flow, stories load-more flow, and service-worker registration.
- In this container, Chromium redirects application URLs to `chrome-error://chromewebdata/` with an organizational-policy block page, so the harness reports `blocked-by-environment` instead of pretending to pass.


## Tightening pass إضافية
- إضافة اختبارات مباشرة لـ `LocalStorageEngine`, `usePreferencesStore`, و`hasRequiredFirebaseEnv`.
- تغطية branch error في `quran-store` عند فشل تحميل سورة غير صالحة.
- تغطية search-triggered summary hydration في `stories-store`.
- Hardening للكود نفسه: storage failures أصبحت آمنة، theme normalization أصبحت صريحة، وFirebase env validation تتجاهل القيم الفارغة/المسافات فقط.
