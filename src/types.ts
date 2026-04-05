export type SyncStatus = 'local-only' | 'supabase-ready';
export type SyncHealth = 'local-only' | 'local-cache' | 'remote-active';
export type CalendarDataSnapshot = Record<string, DayData>;

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm (Optional)
  isAllDay?: boolean; // True for all-day events
  ownerId?: string;
  visibility?: 'private' | 'calendar';
  updatedAt?: string;
}

export interface DailyTodo {
  id: string;
  text: string;
  completed: boolean;
  ownerId?: string;
  updatedAt?: string;
}

export interface DayData {
  date: string; // YYYY-MM-DD
  moods: string[]; // Max 2 emojis
  events: CalendarEvent[];
  todos?: DailyTodo[];
  updatedAt?: string;
}

export interface SharedCalendarMember {
  userId: string;
  role: 'owner' | 'editor' | 'viewer';
  displayName?: string;
}

export interface SharedCalendarProfile {
  slug: string;
  name: string;
  syncStatus: SyncStatus;
  syncHealth?: SyncHealth;
  storageScope: string;
  members?: SharedCalendarMember[];
}

// Helper type for the grid display
export interface CalendarCell {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  dateString: string; // YYYY-MM-DD
}
