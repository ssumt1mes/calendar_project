export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm (Optional)
  isAllDay?: boolean; // True for all-day events
}

export interface DayData {
  date: string; // YYYY-MM-DD
  moods: string[]; // Max 2 emojis
  events: CalendarEvent[];
  todos?: { id: string; text: string; completed: boolean }[];
}

// Helper type for the grid display
export interface CalendarCell {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  dateString: string; // YYYY-MM-DD
}
