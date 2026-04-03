/**
 * ====================================================================
 * AppProviders — مزوّد التطبيق الموحّد
 * ====================================================================
 * OPT-V3-02: ترتيب التهيئة حسب الأولوية:
 *   1. preferences  — bootstrap مبكر في index.html + مزامنة store بعد mount
 *   2. core stores  — sync: بيانات المستخدم الأساسية
 *   3. async/heavy  — مؤجَّل: Auth + Stories (ثقيل)
 *
 * MISSING-02: useOnlineStatus يُراقب الاتصال ويُظهر toast
 * ====================================================================
 */
import { useEffect } from 'react';
import { HashRouter } from 'react-router-dom';
import { AppRouter } from '@/app/router/AppRouter';

import { usePreferencesStore }     from '@/kernel/preferences/preferences-store';
import { useAuthStore }            from '@/kernel/auth/auth-store';
import { initializePwaRuntime }    from '@/kernel/pwa/pwa-runtime';
import { useTasksStore }           from '@/features/tasks/state/tasks-store';
import { useMasbahaStore }         from '@/features/masbaha/state/masbaha-store';
import { useQuranStore }           from '@/features/quran/state/quran-store';
import { useAzkarStore }           from '@/features/azkar/state/azkar-store';
import { useDuasStore }            from '@/features/duas/state/duas-store';
import { useStoriesStore }         from '@/features/stories/state/stories-store';
import { useNamesOfAllahStore }    from '@/features/names-of-allah/state/names-store';
import { useAchievementsStore }    from '@/features/achievements/state/achievements-store';
import { useNotificationsStore }   from '@/features/notifications/state/notifications-store';
import { usePlansStore }           from '@/features/plans/state/plans-store';
import { useDayWatcher }           from '@/kernel/day-watcher/use-day-watcher';
import { useAchievementsChecker }  from '@/features/achievements/state/use-achievements-checker';
import { useNotificationsWatcher } from '@/features/notifications/state/use-notifications-watcher';
import { ToastContainer }          from '@/shared/ui/feedback/ToastContainer';
import { useOnlineStatus }         from '@/shared/hooks/use-online-status';

function AppServices() {
  const initPreferences   = usePreferencesStore((s) => s.initialize);
  const initAuth          = useAuthStore((s) => s.initialize);
  const initTasks         = useTasksStore((s) => s.initialize);
  const initMasbaha       = useMasbahaStore((s) => s.initialize);
  const initQuran         = useQuranStore((s) => s.initialize);
  const initAzkar         = useAzkarStore((s) => s.initialize);
  const initDuas          = useDuasStore((s) => s.initialize);
  const initStories       = useStoriesStore((s) => s.initialize);
  const initNames         = useNamesOfAllahStore((s) => s.initialize);
  const initAchievements  = useAchievementsStore((s) => s.initialize);
  const initNotifications = useNotificationsStore((s) => s.initialize);
  const initPlans         = usePlansStore((s) => s.initialize);

  useEffect(() => {
    // ── المرحلة 1: مزامنة store — الثيم الأساسي طُبّق مسبقاً في index.html ──
    initPreferences();

    // ── المرحلة 2: sync — بيانات localStorage الأساسية ─────────
    initTasks();
    initMasbaha();
    initQuran();
    initAzkar();
    initDuas();
    initNames();
    initAchievements();
    void initNotifications();
    initPlans();

    // ── المرحلة 3: مؤجَّل — async أو ثقيل ─────────────────────
    // Promise.resolve() يُؤخّر للـ microtask التالي
    // يضمن اكتمال render الأول قبل بدء العمليات الثقيلة
    void Promise.resolve().then(() => {
      initStories();   // manifest ثقيل
      initAuth();      // async — ينتظر Firebase
      void initializePwaRuntime(); // BUG-V3-01 fix
    });
  // [] كافٍ — كل initialize() تحمي نفسها من التكرار داخلياً
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useDayWatcher();
  useAchievementsChecker();
  useNotificationsWatcher();
  useOnlineStatus();

  return null;
}

export function AppProviders() {
  return (
    <HashRouter>
      <AppServices />
      <AppRouter />
      <ToastContainer />
    </HashRouter>
  );
}
