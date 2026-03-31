export const migrationTasks = {
  done: [
    'Phase 26: added a real-browser Chromium/CDP E2E harness plus release gate scripts, and documented that the current environment blocks localhost/file execution.',
    'إنشاء Vite + React + TypeScript foundation.',
    'حذف ملفات الإعلانات من المسار القديم.',
    'حصر Firebase في Auth service جديدة فقط.',
    'إنشاء Section Registry لإضافة الأقسام بدون orchestrator مركزي.',
    'بناء masbaha module فعلية مع persistence مستقلة.',
    'نقل stats إلى aggregators مشتقة من tasks + masbaha + quran.',
    'بناء quran module فعلية مع bookmark/resume وتحميل السور عند الطلب.',
    'بناء azkar module فعلية مع progress tracking وربطها بالإحصائيات.',
    'بناء duas module فعلية مع lazy loading وfavorites وربطها بالإحصائيات والواجهة الرئيسية.',
    'بناء stories module فعلية مع lazy loading والقراءة الداخلية والتقدم اليومي وربطها بالإحصائيات والواجهة الرئيسية.',
    'بناء names-of-allah module فعلية مع lazy loading والبحث والمفضلة والتقدم اليومي وربطها بالإحصائيات والواجهة الرئيسية.',
    'تحويل home dashboard لتقرأ من stores runtime بدل eager content imports.',
    'تفكيك quranData إلى lazy per-surah chunks مع prefetch خفيف للـ bookmark/recent.',
    'إزالة legacy runtime من مسار التشغيل ونقل raw content sources إلى src/content/sources.',
    'استبدال Service Worker القديمة بمسار PWA حديث مع cleanup للكاشات والregistrations القديمة.',
    'إضافة Node-native quality gate تغطي stores/loaders/aggregators/PWA helpers.',
    'توسيع الاختبارات إلى quran/azkar/duas/stories/names stores مع persisted-state normalization وprogress flows.',
    'رفع coverage للفروع الأقل تغطية داخل masbaha-selectors وpwa-runtime وdate/loaders مع إصلاح bugs اكتشفها الاختبار.',
    'إضافة route-level integration tests فوق AppShell لمسارات home/tasks/quran/settings/names مع React server rendering.',
    'تنفيذ Performance Pass: تفكيك مصادر duas/stories إلى generated category chunks وعزل Firebase Auth عن main bootstrap.',
    'تفكيك hotspot القصص الأكبر من category-level إلى story-level lazy loading مع summary-first hydration وتوحيد Story IDs.',
    'تحويل قصص المصدر نفسها إلى manifest + category source files، وتقسيم runtime إلى manifest صغيرة + per-category summaries لتسهيل إضافة قصص جديدة مستقبلاً.',
    'تفكيك summaries القصصية من category-level إلى summary batches مع زر تحميل المزيد، لمنع بقاء أكبر فئة قصصية كـ route hotspot، مع الحفاظ على مسار إضافة القصص واضحًا عبر summaryBatchSize في manifest.',
    'توحيد الصفحات التعريفية والقانونية داخل React router مع نقل content إلى pages موحدة، وتحويل المسار إلى HashRouter لتفادي مشاكل static hosting، وإبقاء about/privacy/terms/contact القديمة كـ redirect shims فقط.',
    'توسيع route-level integration لتشمل stats وprofile، مع تحسين profile إلى account snapshot read-only وروابط داخلية واضحة داخل shell الموحدة.',
    'توسيع route-level integration لتشمل azkar وduas وstories مع search/selection/load-more والحالات المشتقة الظاهرة للمستخدم داخل AppShell.',
    'توسيع route-level integration لتشمل quran reader نفسه مع حالات reader-open وloading/error وempty-search داخل AppShell.',
    'تغطية load-quran.ts الحقيقية عبر import.meta.glob وملفات JSON الفعلية بدل الاكتفاء بالـ shim، مع تقوية Arabic normalization في البحث القرآني.',
    'إضافة DOM/component interaction tests فعلية لصفحات settings وquran وduas وstories عبر fake DOM harness وreactive zustand shim.',
    'تنفيذ Browser/static runtime verification على `dist/` نفسها، ونقل legal redirect shims إلى `public/` لضمان نشرها داخل artifact، مع التحقق من 404 hash fallback وmanifest وservice worker.',
  ],
  inProgress: [
    'مراجعة ما إذا كانت route-level summaries في الأدعية تحتاج batching إضافي أو virtualized presentation.',
  ],
  next: [
    'القرار الهندسي التالي: إذا بقيت route-level summaries في الأدعية ثقيلة، فالأفضل batching أو summary-first authoring مماثل للقصص.',
    'القرار التالي بعد ذلك: ترقية Browser/static verification إلى E2E حقيقية على engine/جهاز فعلي عندما تتوفر أداة تشغيل متصفح ثابتة.',
    'استبدال الـ experimental test loader بمسار أقل اعتمادًا على hooks التجريبية عندما تستقر بيئة التشغيل.',
  ],
} as const;

export const QUALITY_GATE_TASKS = [
  'Node-based test harness',
  'Store/loader/aggregator tests',
  'PWA cleanup tests',
  'Feature store hardening tests',
] as const;

// Tightening pass: preferences/storage/auth env and extra quran/stories branches validated.
