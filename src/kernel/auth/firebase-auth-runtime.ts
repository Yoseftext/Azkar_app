import { initializeApp, type FirebaseApp } from 'firebase/app';
import { GoogleAuthProvider, getAuth, onAuthStateChanged, signInWithRedirect, signOut, type Auth, type User } from 'firebase/auth';
import type { AuthUser } from '@/kernel/auth/auth-types';
function mapUser(user: User | null): AuthUser | null { if(!user) return null; return { uid:user.uid, displayName:user.displayName, email:user.email, photoURL:user.photoURL }; }
export class FirebaseAuthRuntime {
  private readonly app: FirebaseApp; private readonly auth: Auth; private readonly provider: GoogleAuthProvider;
  public constructor() { this.app = initializeApp({ apiKey: import.meta.env.VITE_FIREBASE_API_KEY, authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN, projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID, appId: import.meta.env.VITE_FIREBASE_APP_ID, messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID, storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET }); this.auth = getAuth(this.app); this.provider = new GoogleAuthProvider(); }
  public async signInWithGoogle(): Promise<void> { await signInWithRedirect(this.auth, this.provider); }
  public async signOut(): Promise<void> { await signOut(this.auth); }
  public getCurrentUser(): AuthUser | null { return mapUser(this.auth.currentUser ?? null); }
  public subscribe(listener: (user: AuthUser | null) => void): () => void { return onAuthStateChanged(this.auth, (user) => listener(mapUser(user))); }
}
