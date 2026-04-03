/**
 * ====================================================================
 * Auth Store — متجر المصادقة
 * ====================================================================
 * BUG-V3-04: أُعيد تنسيق الملف — كان one-liner بطول 1700 حرف.
 *            Source maps لا تعمل على one-liners.
 *
 * BUG-V3-05: unsubscribeAuth نُقل من module scope إلى closure scope.
 *            يُمنع memory leak في React StrictMode وHMR.
 * ====================================================================
 */
import { create } from 'zustand';
import type { AuthUser } from '@/kernel/auth/auth-types';
import { hasRequiredFirebaseEnv } from '@/kernel/auth/auth-config';
import type { FirebaseAuthRuntime } from '@/kernel/auth/firebase-auth-runtime';

interface AuthStore {
  user:         AuthUser | null;
  isReady:      boolean;
  isConfigured: boolean;
  initialize:   () => void;
  signIn:       () => Promise<void>;
  signOut:      () => Promise<void>;
}

// singleton للـ runtime — module-level مقبول هنا (لا يحمل user state)
let _runtimePromise: Promise<FirebaseAuthRuntime | null> | null = null;

async function getAuthRuntime(): Promise<FirebaseAuthRuntime | null> {
  if (!hasRequiredFirebaseEnv()) return null;
  if (!_runtimePromise) {
    _runtimePromise = import('@/kernel/auth/firebase-auth-runtime')
      .then(({ FirebaseAuthRuntime: Runtime }) => new Runtime())
      .catch((err) => {
        console.error('[Auth] Failed to load Firebase Auth runtime:', err);
        _runtimePromise = null;
        return null;
      });
  }
  return _runtimePromise;
}

export const useAuthStore = create<AuthStore>((set) => {
  // BUG-V3-05 FIX: closure scope بدلاً من module scope
  let _unsubscribe: (() => void) | null = null;

  return {
    user:         null,
    isReady:      false,
    isConfigured: hasRequiredFirebaseEnv(),

    initialize: () => {
      if (_unsubscribe) return; // حماية من StrictMode double-call

      if (!hasRequiredFirebaseEnv()) {
        set({ user: null, isReady: true, isConfigured: false });
        return;
      }

      void getAuthRuntime()
        .then((runtime) => {
          if (!runtime || _unsubscribe) {
            if (!runtime) set({ user: null, isReady: true, isConfigured: false });
            return;
          }
          _unsubscribe = runtime.subscribe((user) => {
            set({ user, isReady: true, isConfigured: true });
          });
        })
        .catch(() => {
          set({ user: null, isReady: true, isConfigured: false });
        });
    },

    signIn: async () => {
      const runtime = await getAuthRuntime();
      if (!runtime) throw new Error('Firebase Auth غير مُهيَّأ.');
      await runtime.signInWithGoogle();
    },

    signOut: async () => {
      const runtime = await getAuthRuntime();
      if (!runtime) return;
      await runtime.signOut();
    },
  };
});
