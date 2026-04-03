/**
 * ====================================================================
 * Firebase Auth Runtime
 * ====================================================================
 * EDGE-07: initializeApp لا تتحقق من وجود app سابقة.
 *   الإصلاح: استخدام getApps() للتحقق قبل initializeApp،
 *   مع fallback لـ signInWithPopup عند فشل signInWithRedirect
 *   (EDGE-03: Firefox Private Mode يحجب redirect).
 * ====================================================================
 */
import {
  getApps,
  initializeApp,
  type FirebaseApp,
} from 'firebase/app';
import {
  GoogleAuthProvider,
  getAuth,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  type Auth,
  type User,
} from 'firebase/auth';
import type { AuthUser } from '@/kernel/auth/auth-types';

const FIREBASE_APP_NAME = 'azkar-app';

function mapUser(user: User | null): AuthUser | null {
  if (!user) return null;
  return {
    uid:         user.uid,
    displayName: user.displayName,
    email:       user.email,
    photoURL:    user.photoURL,
  };
}

function getOrCreateApp(): FirebaseApp {
  // EDGE-07 FIX: تحقق من وجود app بنفس الاسم قبل إنشاء جديدة
  const existing = getApps().find((a) => a.name === FIREBASE_APP_NAME);
  if (existing) return existing;

  return initializeApp(
    {
      apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
      appId:             import.meta.env.VITE_FIREBASE_APP_ID,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    },
    FIREBASE_APP_NAME,
  );
}

export class FirebaseAuthRuntime {
  private readonly auth:     Auth;
  private readonly provider: GoogleAuthProvider;

  public constructor() {
    const app    = getOrCreateApp();
    this.auth     = getAuth(app);
    this.provider = new GoogleAuthProvider();
  }

  public async signInWithGoogle(): Promise<void> {
    try {
      // المحاولة الأولى: redirect (أفضل UX على موبايل)
      await signInWithRedirect(this.auth, this.provider);
    } catch {
      // EDGE-03 FIX: fallback لـ popup عند فشل redirect
      // (Firefox Private Mode، third-party cookies محجوبة)
      await signInWithPopup(this.auth, this.provider);
    }
  }

  public async signOut(): Promise<void> {
    await signOut(this.auth);
  }

  public getCurrentUser(): AuthUser | null {
    return mapUser(this.auth.currentUser ?? null);
  }

  public subscribe(listener: (user: AuthUser | null) => void): () => void {
    return onAuthStateChanged(this.auth, (user) => listener(mapUser(user)));
  }
}
