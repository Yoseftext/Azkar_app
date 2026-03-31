# Azkar App Migration Tasks

## الهدف
إعادة بناء التطبيق إلى بنية Production-grade modular، مع حذف الإعلانات بالكامل، وحصر Firebase في Auth فقط، وتحويل التنفيذ إلى task-driven migration.

## الحالة
تم تنفيذ foundation الجديدة، ونُقلت features الأساسية إلى modules فعلية، كما تم إنهاء decommissioning صارمة للـ legacy runtime وإبطال مسار Service Worker القديمة.

## المهام المنجزة
- Bootstrap: Vite + React + TypeScript + Tailwind.
- إنشاء طبقات `app / kernel / shared / content / features`.
- حذف الإعلانات من المسار القديم وحصر Firebase في Auth only.
- إضافة `kernel/sections/section-registry.ts` لإضافة الأقسام الجديدة بدون orchestrator مركزي.
- إنشاء modules فعلية لكل من: `tasks`, `masbaha`, `quran`, `azkar`, `duas`, `stories`, `names-of-allah`.
- نقل `features/stats` إلى derived aggregators فوق snapshots من stores المختلفة.
- تحويل `HomePage` إلى dashboard مشتقة من stores runtime بدل eager content imports.
- تفكيك `quranData` إلى ملفات `per-surah` داخل `src/content/quran/surahs` مع lazy glob loading وprefetch خفيف.
- إزالة `js/` و`data/` القديمة من root runtime، ونقل مصادر المحتوى الفعلية إلى `src/content/sources`.
- استبدال `sw.js` القديمة بـ Service Worker حديثة وتنظيف registrations/caches legacy من العميل.
- إزالة `dist/` القديمة و`manifest.json` القديمة من المصدر حتى لا يحدث التباس في النشر أو المراجعة.
- build ناجح.
- إضافة route-level integration tests لمسارات `home`, `tasks`, `quran`, `settings`, `names-of-allah` مع shell/header/navigation الحقيقية.
- توسيع route-level integration لتشمل `stats` و`profile`، مع تحويل `profile` إلى account snapshot read-only وروابط داخلية واضحة داخل shell الموحدة.
- توسيع route-level integration لتشمل `azkar`, `duas`, `stories` مع سيناريوهات search/filter/load-more/open detail داخل shell.
- إضافة DOM/component interaction tests فعلية لصفحات `settings`, `quran`, `duas`, و`stories` عبر fake DOM harness + reactive zustand shim.

- Tightening pass على المناطق الأضعف: harden `local-storage-engine`, `preferences-store`, و`auth-config` + اختبارات إضافية لـ preferences/storage/auth وerror/search branches في `quran/stories` مع `npm test` و`npm run build` ناجحين.

## المهام التالية
- [x] توسيع route-level integration إلى `quran` reader المفتوح وحالات الخطأ/التحميل داخل shell.
- [x] تغطية `load-quran.ts` الحقيقية عبر `import.meta.glob` وملفات JSON الفعلية بدل الاكتفاء بالـ shim، مع اختبار `preload/load/invalid-surah` مباشرة.
- [x] إضافة DOM/component interaction tests لصفحات `settings`, `quran`, `duas`, و`stories`.
- [x] الخطوة 24: تمكين authoring واضح لـ `duas` و`azkar` عبر `manifest + category source files + generated runtime` مثل القصص، مع إضافة guides وأوامر split واضحة.
- الخطوة 25: Browser/E2E verification بدل الخطوة 24 السابقة.


## Phase 21 — Deep Quran Reader Route Integration
- [x] إضافة route-level integration لمسار `quran` مع `reader open` state داخل `AppShell` مع الآيات الفعلية وزر الرجوع للفهرس.
- [x] إضافة route-level integration لحالة `loading + error` أثناء القارئ مفتوح، مع التأكد من عدم تسرب آيات قديمة إلى الواجهة.
- [x] إضافة route-level integration لحالة `empty search` داخل فهرس السور.
- [x] إضافة quran route fixtures مشتركة لتقليل تكرار seed data داخل اختبارات المسارات.
- [x] إعادة تشغيل `test`, `test:coverage`, و`build` بعد التوسيع.


## Phase 10 — Quality Gate
- [x] Add Node-based unit test harness that runs without external test runner install.
- [x] Cover stores, loaders, aggregators, and PWA cleanup helpers.
- [x] Add a dedicated test report documenting current limits and next testing step.

## Phase 11 — Feature Store Hardening
- [x] Cover `quran-store` initialization, bookmark, resume, and daily reading tracking.
- [x] Cover `azkar-store`, `duas-store`, `stories-store`, and `names-store` for persisted-state normalization, selection, favorites, and daily progress flows.
- [x] Expand the quran test shim so store logic can run without Vite runtime transforms.
- [x] Re-run full test suite and coverage after expanding feature-store coverage.

## Phase 12 — Hotspot Hardening
- [x] Cover `masbaha-selectors` behavior around batch math, monthly totals, streaks, and phrase rotation.
- [x] Expand `pwa-runtime` tests to cover registration flow and stale worker cleanup branches.
- [x] Cover `date.ts`, `load-names.ts`, and `load-stories.ts` edge/error branches with targeted tests.
- [x] Fix real bugs revealed by these tests, then re-run full suite.

## Phase 13 — Route Integration
- [x] ترقية test loader لتشغيل ملفات `.tsx` مع React server rendering داخل `node:test`.
- [x] إضافة helper لإعادة ضبط stores + render route with shell بدون DOM runner خارجي.
- [x] تغطية مسارات `home`, `tasks`, `quran`, `settings`, و`names-of-allah` مع التحقق من header/page/store integration.
- [x] إعادة تشغيل `test`, `test:coverage`, و`build` بعد إضافة اختبارات المسارات.


## Phase 14 — Performance Pass
- [x] عزل Firebase Auth إلى runtime chunk منفصلة بدل سحبها داخل main bootstrap statically.
- [x] تفكيك `duas` إلى generated category modules + summary registry بدل `duasData` monolith chunk.
- [x] تفكيك `stories` إلى generated category modules + summary registry بدل `stories` monolith chunk.
- [x] تحديث stores/pages لتحميل selected/recent categories عند الطلب فقط، مع بقاء البحث قادرًا على hydration كامل عند الحاجة.
- [x] إعادة تشغيل `test` و`build` بعد performance refactor.


## Phase 15 — Story Hotspot Split
- Split the largest story hotspot from category-level loading to story-level loading.
- Convert stories module to summary-first hydration, loading full story text only on selection/search demand.
- Make story identifiers category-qualified and prune ambiguous persisted references.


## Phase 16 — Stories Manifest Hardening
- [x] نقل مصدر القصص إلى `manifest + category source files` بدل ملف وحيد ضخم ليتضح مسار التوسعة المستقبلية.
- [x] استبدال `stories/generated/registry.js` الكبيرة بـ `manifest.js` صغيرة + `per-category summary/registry files`.
- [x] تحديث `stories-store` لتبدأ من manifest خفيفة ثم hydrate selected/recent categories فقط.
- [x] إضافة دليل واضح لإضافة قصص وفئات جديدة (`STORIES_AUTHORING_GUIDE.md`).


## Phase 17 — Story Summary Batching
- [x] تقسيم summaries القصصية إلى batches أصغر بدل summary واحدة لكل فئة.
- [x] إضافة `load more` في store/page لتحميل دفعات القصص تدريجيًا داخل الفئة المختارة.
- [x] الإبقاء على تحميل نص القصة الكامل عند اختيارها فقط، مع عدم تحميل summaries جميع الدفعات إلا عند البحث.
- [x] تحديث مصدر القصص وguide لتوضيح `summaryBatchSize` كخيار واضح للتوسعة المستقبلية.
- [x] إعادة تشغيل `test` و`build` بعد story batching.


## الخطوة 18
- توحيد الصفحات التعريفية والقانونية داخل React router.
- نقل التنقل إلى HashRouter لتفادي مشاكل static hosting مع direct refresh.
- إبقاء about.html/privacy.html/terms.html/contact.html القديمة كـ redirect shims بدل صفحات مستقلة.


## Phase 19 — Stats & Profile Route Integration
- [x] إضافة route-level integration لمسار `stats` مع seeded snapshots تغطي tasks/azkar/duas/stories/names/masbaha/quran.
- [x] إضافة route-level integration لمسار `profile` في حالتي signed-in وguest/unconfigured.
- [x] تحويل `profile` إلى read-only account snapshot وروابط داخلية للحساب والسياسات بدل بطاقة عرض خام فقط.
- [x] إعادة تشغيل `test`, `test:coverage`, و`build` بعد توسيع الاختبارات.


## Phase 20 — Deep Route Integration for Content Modules
- [x] إضافة route-level integration لمسار `azkar` مع fallback selection تحت search + recent chips + daily progress badges.
- [x] إضافة route-level integration لمسار `duas` مع selected hydrated category + favorites + completion badges + sources metadata.
- [x] إضافة route-level integration لمسار `stories` مع batch-aware summaries + load-more affordance + selected story loading state.
- [x] استخراج route fixtures helpers مشتركة لتقليل تكرار seed data وجعل اختبارات المسارات قابلة للصيانة.
- [x] إعادة تشغيل `test`, `test:coverage`, و`build` بعد التوسيع.


## Phase 22 — Real Quran Loader Coverage
- [x] ترقية `alias-loader` لدعم `import.meta.glob` مع options وJSON modules داخل بيئة `node:test`.
- [x] إضافة suite حقيقية لـ `src/content/loaders/load-quran.ts` عبر relative import بدل alias shim.
- [x] تغطية `loadQuranSummary`, `filterQuranSurahs`, `preloadSurahAyahs`, و`loadSurahAyahs` على الملفات المقسمة الفعلية.
- [x] إصلاح gap في `normalizeArabicSearchTerm()` بإزالة التشكيل والعلامات القرآنية الممدودة (`ٰ` ونظائرها) بدل الاكتفاء بتوقعات أضعف في الاختبار.
- [x] إعادة تشغيل `test` و`build` بعد تغطية الـ loader الحقيقية.


## Phase 23 — DOM / Component Interaction Tests
- [x] بناء fake DOM harness محلية قادرة على تشغيل `react-dom/client` داخل `node:test`.
- [x] ترقية Zustand test shim لتصبح reactive باستخدام `useSyncExternalStore` بدل snapshot ثابتة.
- [x] إضافة component interaction tests لصفحات `SettingsPage`, `QuranPage`, `DuasPage`, و`StoriesPage`.
- [x] إثبات تفاعلات حقيقية: theme toggle, sign-out wiring, quran search/open/close, duas favorite/completion, stories load-more/favorite.
- [x] إعادة تشغيل `test` و`build` بعد التوسيع.

## Phase 25 — Browser Runtime Verification
- [x] Add static browser/runtime verification harness against built `dist/`.
- [x] Ensure legal redirect shims are published via `public/` and survive build output.
- [x] Verify 404 hash redirect, manifest invariants, and service worker cleanliness.

## Phase 26 — Real browser E2E harness and release gate
- Added a Chromium + Chrome DevTools Protocol real-browser harness (`tools/verify-real-browser-e2e.mjs`) that targets the built `dist/` artifact.
- Added `npm run verify:e2e` and `npm run verify:release` scripts.
- Verified in the current environment that the harness itself is ready, but Chromium is blocked by organizational policy from loading `localhost` / `file://` resources, so the run exits with a clear `blocked-by-environment` status instead of a false pass.
- Static/browser-runtime verification still passes, which means the remaining release-readiness gap is now external execution of the real-browser harness on an unrestricted machine or CI runner.
