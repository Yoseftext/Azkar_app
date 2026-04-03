import './helpers/environment.ts';

import { beforeEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { getLocalDateKey } from '@/shared/lib/date';
import { GUIDED_PLANS } from '@/features/plans/domain/plan-definitions';
import { buildGuidedPlanSummary, rankGuidedPlans } from '@/features/plans/domain/plan-progress';
import { usePlansStore } from '@/features/plans/state/plans-store';
import { renderRouteWithShell } from './helpers/render-route.ts';
import { resetAllStores } from './helpers/reset-stores.ts';
import { PlansPage } from '@/features/plans/pages/PlansPage';
import { HomePage } from '@/features/home/pages/HomePage';
import { useAzkarStore } from '@/features/azkar/state/azkar-store';
import { useMasbahaStore } from '@/features/masbaha/state/masbaha-store';
import { useDuasStore } from '@/features/duas/state/duas-store';
import { useQuranStore } from '@/features/quran/state/quran-store';
import { useNamesOfAllahStore } from '@/features/names-of-allah/state/names-store';
import { useTasksStore } from '@/features/tasks/state/tasks-store';

beforeEach(() => {
  resetAllStores();
});

describe('guided plans flow', () => {
  it('builds active plan summary when daily requirements are satisfied', () => {
    const plan = GUIDED_PLANS.find((item) => item.id === 'morning-anchor-7');
    assert.ok(plan);

    const summary = buildGuidedPlanSummary({
      definition: plan,
      completedSessionKeys: [],
      todayKey: getLocalDateKey(),
      snapshot: {
        completedTasks: 0,
        remainingTasks: 2,
        azkarTodayCount: 1,
        quranTodayReadings: 0,
        duasTodayCount: 1,
        namesTodayCount: 0,
        masbahaTodayCount: 40,
      },
    });

    assert.equal(summary.canCompleteToday, true);
    assert.equal(summary.completedToday, false);
    assert.equal(summary.remainingSessions, 7);
    assert.equal(summary.statuses.every((item) => item.isCompleted), true);
  });

  it('ranks quran plan first when quran progress is still empty', () => {
    const ranked = rankGuidedPlans({
      completedTasks: 2,
      remainingTasks: 0,
      azkarTodayCount: 1,
      quranTodayReadings: 0,
      duasTodayCount: 1,
      namesTodayCount: 0,
      masbahaTodayCount: 33,
    }, null, GUIDED_PLANS);

    assert.equal(ranked[0]?.id, 'quran-light-10');
  });

  it('renders active plan and plan catalog inside plans route', () => {
    const todayKey = getLocalDateKey();

    usePlansStore.setState({
      activePlanId: 'morning-anchor-7',
      progressByPlanId: { 'morning-anchor-7': { startedAtKey: todayKey, completedSessionKeys: [] } },
      isInitialized: true,
    });
    useAzkarStore.setState({ completedByDate: { [todayKey]: ['zikr-1'] } });
    useDuasStore.setState({ completedByDate: { [todayKey]: ['dua-1'] } });
    useMasbahaStore.setState({ dailyCounts: { [todayKey]: 33 } });

    const markup = renderRouteWithShell({ path: '/plans', page: createElement(PlansPage) });

    assert.match(markup, /البرامج القصيرة/);
    assert.match(markup, /برنامجك الحالي: مرساة الصباح/);
    assert.match(markup, /احتسب جلسة اليوم/);
    assert.match(markup, /ورد قرآن خفيف/);
  });

  it('surfaces plans card on home when no active plan exists', () => {
    const markup = renderRouteWithShell({ path: '/', page: createElement(HomePage) });

    assert.match(markup, /برنامج قصير مقترح/);
    assert.match(markup, /البرامج القصيرة|افتـح البرامج القصيرة|افتح البرامج القصيرة/);
  });

  it('shows active plan progress on home when a plan is running', () => {
    const todayKey = getLocalDateKey();

    usePlansStore.setState({
      activePlanId: 'steady-core-14',
      progressByPlanId: { 'steady-core-14': { startedAtKey: todayKey, completedSessionKeys: [todayKey] } },
      isInitialized: true,
    });
    const items = useTasksStore.getState().items.map((item) => ({ ...item, completed: true }));
    useTasksStore.setState({
      items,
      dailyCompletions: { [todayKey]: items.map((item) => item.id) },
    });
    useQuranStore.setState({ dailyReadings: { [todayKey]: [1] } });
    useAzkarStore.setState({ completedByDate: { [todayKey]: ['zikr-1'] } });

    const markup = renderRouteWithShell({ path: '/', page: createElement(HomePage) });

    assert.match(markup, /برنامجك الحالي: تثبيت الورد/);
    assert.match(markup, /جلسة اليوم محسوبة|أنهيت جلسة اليوم/);
  });
});
