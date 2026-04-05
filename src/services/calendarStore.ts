import { appConfig, getCalendarScopeKey, isSupabaseConfigured } from '../config';
import { CalendarDataSnapshot, DayData, SharedCalendarProfile, SyncHealth } from '../types';
import { getCurrentUser } from './auth';

const STORAGE_KEY_PREFIX = 'web-calendar-data';
const CACHE_KEY_PREFIX = 'web-calendar-cache';

const emptySnapshot = (): CalendarDataSnapshot => ({});

const safeJsonParse = <T>(raw: string | null, fallback: T): T => {
  if (!raw) {
    return fallback;
  }

  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? (parsed as T) : fallback;
  } catch {
    return fallback;
  }
};

const getStorageKey = (): string => {
  const user = getCurrentUser();
  const scopeKey = getCalendarScopeKey(user?.id);
  return `${STORAGE_KEY_PREFIX}:${scopeKey}`;
};

const getCacheKey = (): string => {
  return `${CACHE_KEY_PREFIX}:${appConfig.calendarSlug}`;
};

const loadLocalSnapshot = (key: string): CalendarDataSnapshot => {
  return safeJsonParse<CalendarDataSnapshot>(localStorage.getItem(key), emptySnapshot());
};

const saveLocalSnapshot = (key: string, snapshot: CalendarDataSnapshot) => {
  localStorage.setItem(key, JSON.stringify(snapshot));
};

const getBaseHeaders = (): HeadersInit => ({
  apikey: appConfig.supabaseAnonKey,
  Authorization: `Bearer ${appConfig.supabaseAnonKey}`,
  'Content-Type': 'application/json',
});

const mapRowsToSnapshot = (rows: Array<{ date: string; payload: DayData }>): CalendarDataSnapshot => {
  return rows.reduce<CalendarDataSnapshot>((acc, row) => {
    if (row?.date && row?.payload) {
      acc[row.date] = row.payload;
    }
    return acc;
  }, {});
};

const createRemoteRows = (snapshot: CalendarDataSnapshot) => {
  return Object.entries(snapshot).map(([date, payload]) => ({
    calendar_slug: appConfig.calendarSlug,
    date,
    payload,
    updated_at: payload.updatedAt ?? new Date().toISOString(),
  }));
};

const loadSupabaseSnapshot = async (): Promise<CalendarDataSnapshot> => {
  if (!isSupabaseConfigured()) {
    return loadLocalSnapshot(getCacheKey());
  }

  const url = new URL('/rest/v1/calendar_days', appConfig.supabaseUrl);
  url.searchParams.set('calendar_slug', `eq.${appConfig.calendarSlug}`);
  url.searchParams.set('select', 'date,payload');
  url.searchParams.set('order', 'date.asc');

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: getBaseHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Supabase load failed: ${response.status}`);
  }

  const rows = (await response.json()) as Array<{ date: string; payload: DayData }>;
  const snapshot = mapRowsToSnapshot(rows);
  saveLocalSnapshot(getCacheKey(), snapshot);
  return snapshot;
};

const saveSupabaseSnapshot = async (snapshot: CalendarDataSnapshot): Promise<void> => {
  saveLocalSnapshot(getCacheKey(), snapshot);

  if (!isSupabaseConfigured()) {
    return;
  }

  const response = await fetch(new URL('/rest/v1/calendar_days', appConfig.supabaseUrl).toString(), {
    method: 'POST',
    headers: {
      ...getBaseHeaders(),
      Prefer: 'resolution=merge-duplicates',
    },
    body: JSON.stringify(createRemoteRows(snapshot)),
  });

  if (!response.ok) {
    throw new Error(`Supabase save failed: ${response.status}`);
  }
};

export interface CalendarStore {
  loadSnapshot: () => Promise<CalendarDataSnapshot>;
  saveSnapshot: (snapshot: CalendarDataSnapshot) => Promise<void>;
  getProfile: () => SharedCalendarProfile;
}

export const createCalendarStore = (): CalendarStore => {
  if (appConfig.syncProvider === 'supabase') {
    return {
      loadSnapshot: loadSupabaseSnapshot,
      saveSnapshot: saveSupabaseSnapshot,
      getProfile: () => ({
        slug: appConfig.calendarSlug,
        name: appConfig.calendarName,
        syncStatus: isSupabaseConfigured() ? 'supabase-ready' : 'supabase-ready',
        syncHealth: isSupabaseConfigured() ? 'remote-active' : 'local-cache',
        storageScope: isSupabaseConfigured() ? `supabase:${appConfig.calendarSlug}` : getCacheKey(),
      }),
    };
  }

  return {
    loadSnapshot: async () => loadLocalSnapshot(getStorageKey()),
    saveSnapshot: async (snapshot) => {
      saveLocalSnapshot(getStorageKey(), snapshot);
    },
    getProfile: () => ({
      slug: appConfig.calendarSlug,
      name: appConfig.calendarName,
      syncStatus: 'local-only',
      syncHealth: 'local-only',
      storageScope: getStorageKey(),
    }),
  };
};

export const getCalendarStoreStatusLabel = (health: SyncHealth): string => {
  switch (health) {
    case 'remote-active':
      return 'Supabase live sync';
    case 'local-cache':
      return 'Supabase setup pending';
    default:
      return 'Local device';
  }
};
