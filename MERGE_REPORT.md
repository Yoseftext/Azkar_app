# تقرير الدمج — أذكار المسلم
## V2 (Vanilla JS) + V3 (React/TS) → النسخة المدموجة

---

## ما تم في هذا الدمج

### 🔴 إصلاحات حرجة (من تقرير Audit)

| Bug | الملف | الإصلاح |
|---|---|---|
| BUG-V3-01 | `bootstrap-app.tsx` | `initializePwaRuntime` نُقلت إلى `AppProviders` بعد React render |
| BUG-V3-02 | `pwa-runtime.ts` | `skipWaiting` لا يُطبَّق إلا بموافقة المستخدم عبر `applyPendingUpdate()` |
| BUG-V3-03 | `MasbahaPage.tsx` | Input أصبح controlled مع `useEffect` يُزامن قيمة الـ store |
| BUG-V3-06 | `Header.tsx` + `HomePage.tsx` | حُذفت رسائل المطوّر — استُبدلت بأحاديث ورسائل إسلامية |

---

### 🟠 خدمات أضيفت من V2

| الخدمة | الموقع | الوظيفة |
|---|---|---|
| Toast System | `src/shared/ui/feedback/` | إشعارات مرئية من أي مكان في التطبيق |
| DayWatcher | `src/kernel/day-watcher/` | مراقبة تغيّر التاريخ + toast اليوم الجديد |
| Achievements | `src/features/achievements/` | 12 إنجاز مع فحص تلقائي عبر الـ stores |
| Notifications | `src/features/notifications/` | إشعارات الصباح/المساء/النوم عبر Web API |

---

### 🟡 تحسينات هيكلية

| الملف | التغيير |
|---|---|
| `storage-keys.ts` | أُضيفت مفاتيح `achievements` و `notifications` |
| `section-registry.ts` | أُضيفت صفحتا `achievements` و `notifications` + تحديث الأوصاف |
| `AppProviders.tsx` | يُهيّئ كل الـ stores + يشغّل الخدمات الخلفية بترتيب صحيح |
| `AppShell.tsx` | subtitle اختياري — لا يظهر لأقسام لا تحتاجه |
| `styles.css` | أُضيفت CSS Variables للثيمات + دعم RTL |

---

## البنية الحالية للمشروع

```
src/
├── app/
│   ├── bootstrap/bootstrap-app.tsx   ← إصلاح BUG-V3-01
│   ├── error/AppErrorBoundary.tsx
│   ├── layout/
│   │   ├── AppShell.tsx              ← subtitle اختياري
│   │   ├── BottomNav.tsx
│   │   └── Header.tsx                ← إصلاح BUG-V3-06
│   ├── providers/AppProviders.tsx    ← موحّد مع كل الخدمات
│   └── router/AppRouter.tsx
│
├── kernel/
│   ├── auth/
│   ├── day-watcher/                  ← جديد من V2
│   ├── preferences/
│   ├── pwa/pwa-runtime.ts            ← إصلاح BUG-V3-02
│   ├── sections/section-registry.ts  ← محدّث بأقسام جديدة
│   └── storage/storage-keys.ts       ← محدّث بمفاتيح جديدة
│
├── features/
│   ├── achievements/                 ← جديد من V2 (12 إنجاز)
│   ├── azkar/
│   ├── duas/
│   ├── home/HomePage.tsx             ← إصلاح BUG-V3-06
│   ├── legal/
│   ├── masbaha/MasbahaPage.tsx       ← إصلاح BUG-V3-03
│   ├── names-of-allah/
│   ├── notifications/                ← جديد من V2
│   ├── profile/
│   ├── quran/
│   ├── settings/
│   ├── stats/
│   ├── stories/
│   └── tasks/
│
└── shared/
    ├── constants/
    ├── lib/date.ts
    └── ui/
        ├── feedback/
        │   ├── ToastContainer.tsx    ← جديد
        │   ├── toast-store.ts        ← جديد
        │   └── EmptyState.tsx
        └── primitives/
```

---

## ما لم يُنقل من V2 (قرار عمدي)

| العنصر | السبب |
|---|---|
| `AdsManager` | قرار مشروع — لا إعلانات في هذه المرحلة |
| `RewardService` | مرتبط بالإعلانات — يُضاف لاحقاً مع نظام نقاط مستقل |
| CSS القديمة (main/modules) | مُستبدَلة بـ Tailwind 4 بالكامل |
| EventBus | مُستبدَل بـ Zustand stores + toast-store |

---

## ما تبقى (للجلسة القادمة)

- [ ] تشغيل `npm run typecheck` والتحقق من عدم وجود أخطاء TypeScript
- [ ] تشغيل `npm test` والتحقق من اجتياز الاختبارات الحالية
- [ ] مراجعة BUG-V3-04 (auth-store one-liner formatting)
- [ ] مراجعة BUG-V3-05 (unsubscribeAuth module-level variable)
- [ ] صفحة Notifications تحتاج اختبارات

