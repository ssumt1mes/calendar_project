export type SyncProvider = 'local' | 'supabase';
export type AuthProvider = 'local' | 'supabase';

const normalizeProvider = <T extends string>(value: string | undefined, fallback: T, allowed: readonly T[]): T => {
  if (!value) return fallback;
  return (allowed as readonly string[]).includes(value) ? (value as T) : fallback;
};

const normalizeBoolean = (value: string | undefined, fallback = false): boolean => {
  if (value == null || value === '') return fallback;
  return value === 'true';
};

export const appConfig = {
  appName: import.meta.env.VITE_APP_NAME || 'Liquid Glass Calendar',
  syncProvider: normalizeProvider(import.meta.env.VITE_SYNC_PROVIDER, 'local', ['local', 'supabase'] as const),
  authProvider: normalizeProvider(import.meta.env.VITE_AUTH_PROVIDER, 'local', ['local', 'supabase'] as const),
  calendarSlug: import.meta.env.VITE_SHARED_CALENDAR_SLUG || 'default-shared-calendar',
  calendarName: import.meta.env.VITE_SHARED_CALENDAR_NAME || 'Shared Calendar',
  googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
  googleEnabled: normalizeBoolean(import.meta.env.VITE_ENABLE_GOOGLE_CALENDAR, false),
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL || '',
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
};

export const isSupabaseConfigured = (): boolean => {
  return Boolean(appConfig.supabaseUrl && appConfig.supabaseAnonKey);
};

export const getCalendarScopeKey = (userId?: string | null): string => {
  if (appConfig.syncProvider === 'supabase') {
    return `calendar:${appConfig.calendarSlug}`;
  }

  return userId ? `user:${userId}` : `guest:${appConfig.calendarSlug}`;
};

export const getStorageModeLabel = (): string => {
  if (appConfig.syncProvider === 'supabase') {
    return isSupabaseConfigured() ? 'Supabase-ready' : 'Supabase planned';
  }

  return 'Local device';
};
