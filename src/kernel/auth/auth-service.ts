import type { AuthUser } from '@/kernel/auth/auth-types';

export interface AuthService {
  signInWithGoogle(): Promise<void>;
  signOut(): Promise<void>;
  getCurrentUser(): AuthUser | null;
  subscribe(listener: (user: AuthUser | null) => void): () => void;
  isConfigured(): boolean;
}
