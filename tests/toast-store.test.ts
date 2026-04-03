import test from 'node:test';
import assert from 'node:assert/strict';
import { resetToastStoreForTests, showToast, useToastStore } from '@/shared/ui/feedback/toast-store';

test.beforeEach(() => {
  resetToastStoreForTests();
});

test('showToast dedupes identical active toasts', () => {
  showToast('عاد الاتصال بالإنترنت ✅', 'success');
  showToast('عاد الاتصال بالإنترنت ✅', 'success');

  const toasts = useToastStore.getState().toasts;
  assert.equal(toasts.length, 1);
  assert.equal(toasts[0]?.message, 'عاد الاتصال بالإنترنت ✅');
});

test('showToast keeps different toast types/messages separate', () => {
  showToast('عاد الاتصال بالإنترنت ✅', 'success');
  showToast('تم حفظ إعدادات التنبيه 🔔', 'success');
  showToast('عاد الاتصال بالإنترنت ✅', 'warning');

  const toasts = useToastStore.getState().toasts;
  assert.equal(toasts.length, 3);
});

test('toast store trims active toasts to a bounded count', () => {
  showToast('1', 'info');
  showToast('2', 'info');
  showToast('3', 'info');
  showToast('4', 'info');
  showToast('5', 'info');

  const toasts = useToastStore.getState().toasts;
  assert.equal(toasts.length, 4);
  assert.deepEqual(toasts.map((toast) => toast.message), ['2', '3', '4', '5']);
});
