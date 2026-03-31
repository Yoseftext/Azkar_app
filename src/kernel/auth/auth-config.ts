function normalizeEnvValue(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

export function hasRequiredFirebaseEnv(): boolean {
  return Boolean(
    normalizeEnvValue(import.meta.env.VITE_FIREBASE_API_KEY) &&
      normalizeEnvValue(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN) &&
      normalizeEnvValue(import.meta.env.VITE_FIREBASE_PROJECT_ID) &&
      normalizeEnvValue(import.meta.env.VITE_FIREBASE_APP_ID),
  );
}
