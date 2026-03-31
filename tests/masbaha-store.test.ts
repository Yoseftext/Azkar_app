import './helpers/environment.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import { useMasbahaStore } from '@/features/masbaha/state/masbaha-store';

function resetStore() {
  useMasbahaStore.setState({
    isInitialized: false,
    isSilent: false,
    currentTarget: 33,
    currentSessionCount: 0,
    totalCount: 0,
    selectedPhrase: 'سبحان الله',
    customPhrases: [],
    dailyCounts: {},
  });
}

test('masbaha increments counters and rotates phrase on target completion', () => {
  resetStore();
  useMasbahaStore.getState().initialize();
  useMasbahaStore.getState().setTarget(2);
  useMasbahaStore.getState().increment();
  assert.equal(useMasbahaStore.getState().currentSessionCount, 1);
  assert.equal(useMasbahaStore.getState().selectedPhrase, 'سبحان الله');
  useMasbahaStore.getState().increment();
  assert.equal(useMasbahaStore.getState().currentSessionCount, 2);
  assert.equal(useMasbahaStore.getState().totalCount, 2);
  assert.equal(useMasbahaStore.getState().selectedPhrase, 'الحمد لله');
  assert.equal(useMasbahaStore.getState().dailyCounts['2026-03-31'], 2);
});

test('masbaha validates custom phrases and removes them safely', () => {
  resetStore();
  useMasbahaStore.getState().initialize();
  assert.deepEqual(useMasbahaStore.getState().addCustomPhrase('   '), { ok: false, error: 'أدخل ذكراً صحيحاً أولاً.' });
  assert.deepEqual(useMasbahaStore.getState().addCustomPhrase('ذكر مخصص للاختبار'), { ok: true });
  assert.equal(useMasbahaStore.getState().customPhrases.includes('ذكر مخصص للاختبار'), true);
  useMasbahaStore.getState().removeCustomPhrase('ذكر مخصص للاختبار');
  assert.equal(useMasbahaStore.getState().customPhrases.includes('ذكر مخصص للاختبار'), false);
});
