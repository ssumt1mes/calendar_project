import {
  createElement,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { DayData, CalendarEvent, SharedCalendarProfile, DailyTodo, CalendarDataSnapshot } from '../types';
import { AUTH_EVENT_KEY, getCurrentUser } from '../services/auth';
import { createCalendarStore } from '../services/calendarStore';

const EVENT_KEY = 'calendar-storage-update';

const emptyDayData = (dateString: string): DayData => ({
  date: dateString,
  moods: [],
  events: [],
  todos: [],
  updatedAt: new Date().toISOString(),
});

const touchDay = (day: DayData): DayData => ({
  ...day,
  updatedAt: new Date().toISOString(),
});

const touchTodo = (todo: DailyTodo): DailyTodo => ({
  ...todo,
  updatedAt: new Date().toISOString(),
});

export interface CalendarSyncState {
  isSaving: boolean;
  lastSavedAt: string | null;
  error: string | null;
}

export interface CalendarStorageValue {
  data: CalendarDataSnapshot;
  calendarProfile: SharedCalendarProfile;
  syncState: CalendarSyncState;
  getDayData: (dateString: string) => DayData;
  addMood: (dateString: string, mood: string) => void;
  removeMood: (dateString: string, index: number) => void;
  addEvent: (dateString: string, event: Omit<CalendarEvent, 'id' | 'date'>) => void;
  deleteEvent: (dateString: string, eventId: string) => void;
  updateEvent: (dateString: string, eventId: string, event: Omit<CalendarEvent, 'id' | 'date'>) => void;
  addDailyTodo: (dateString: string, text: string) => void;
  toggleDailyTodo: (dateString: string, todoId: string) => void;
  deleteDailyTodo: (dateString: string, todoId: string) => void;
  getAllEvents: () => CalendarEvent[];
}

const CalendarStorageContext = createContext<CalendarStorageValue | null>(null);

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^(?:[01]\d|2[0-3]):[0-5]\d$/;
const MAX_EVENT_TITLE_LENGTH = 80;
const MAX_EVENT_DESCRIPTION_LENGTH = 500;
const MAX_TODO_LENGTH = 120;

const sanitizeText = (value: string, maxLength: number): string => {
  return value.replace(/[\u0000-\u001F\u007F]/g, '').replace(/\s+/g, ' ').trim().slice(0, maxLength);
};

const sanitizeOptionalText = (value: string | undefined, maxLength: number): string | undefined => {
  if (!value) {
    return undefined;
  }

  const sanitized = sanitizeText(value, maxLength);
  return sanitized || undefined;
};

const sanitizeMood = (value: string): string => {
  return Array.from(value.trim()).slice(0, 4).join('');
};

const isValidDateString = (dateString: string): boolean => {
  if (!DATE_PATTERN.test(dateString)) {
    return false;
  }

  const date = new Date(`${dateString}T00:00:00`);
  return !Number.isNaN(date.getTime());
};

const sanitizeTime = (value: string | undefined, isAllDay: boolean | undefined): string | undefined => {
  if (isAllDay) {
    return undefined;
  }

  if (!value) {
    return undefined;
  }

  return TIME_PATTERN.test(value) ? value : undefined;
};

const useCalendarStorageState = (): CalendarStorageValue => {
  const store = useMemo(() => createCalendarStore(), []);
  const [data, setData] = useState<CalendarDataSnapshot>({});
  const [calendarProfile, setCalendarProfile] = useState<SharedCalendarProfile>(() => store.getProfile());
  const [syncState, setSyncState] = useState<CalendarSyncState>({
    isSaving: false,
    lastSavedAt: null,
    error: null,
  });

  const loadData = useCallback(async () => {
    try {
      const snapshot = await store.loadSnapshot();
      setData(snapshot);
      setCalendarProfile(store.getProfile());
    } catch (e) {
      console.error('Failed to load calendar data', e);
      setData({});
      setCalendarProfile(store.getProfile());
      setSyncState((prev) => ({
        ...prev,
        error: '데이터를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.',
      }));
    }
  }, [store]);

  useEffect(() => {
    void loadData();

    const handleStorageUpdate = () => {
      void loadData();
    };

    window.addEventListener(EVENT_KEY, handleStorageUpdate);
    window.addEventListener(AUTH_EVENT_KEY, handleStorageUpdate);
    window.addEventListener('storage', handleStorageUpdate);

    return () => {
      window.removeEventListener(EVENT_KEY, handleStorageUpdate);
      window.removeEventListener(AUTH_EVENT_KEY, handleStorageUpdate);
      window.removeEventListener('storage', handleStorageUpdate);
    };
  }, [loadData]);

  const saveData = useCallback(
    async (newData: CalendarDataSnapshot) => {
      setData(newData);
      setSyncState((prev) => ({ ...prev, isSaving: true, error: null }));

      try {
        await store.saveSnapshot(newData);
        const savedAt = new Date().toISOString();
        setSyncState({
          isSaving: false,
          lastSavedAt: savedAt,
          error: null,
        });
      } catch (e) {
        console.error('Failed to save calendar data', e);
        setSyncState((prev) => ({
          ...prev,
          isSaving: false,
          error: '저장에 실패했습니다. 네트워크 또는 설정 상태를 확인해주세요.',
        }));
      } finally {
        setCalendarProfile(store.getProfile());
        window.dispatchEvent(new Event(EVENT_KEY));
      }
    },
    [store],
  );

  const getDayData = useCallback((dateString: string): DayData => {
    return (data && data[dateString]) || emptyDayData(dateString);
  }, [data]);

  const addMood = useCallback((dateString: string, mood: string) => {
    if (!isValidDateString(dateString)) {
      return;
    }

    const sanitizedMood = sanitizeMood(mood);
    if (!sanitizedMood) {
      return;
    }

    const current = getDayData(dateString);
    if (current.moods.length >= 2) return;

    const updated = touchDay({
      ...current,
      moods: [...current.moods, sanitizedMood],
    });

    void saveData({
      ...data,
      [dateString]: updated,
    });
  }, [data, getDayData, saveData]);

  const removeMood = useCallback((dateString: string, index: number) => {
    if (!isValidDateString(dateString)) {
      return;
    }

    const current = getDayData(dateString);
    const newMoods = [...current.moods];
    newMoods.splice(index, 1);

    const updated = touchDay({
      ...current,
      moods: newMoods,
    });
    void saveData({ ...data, [dateString]: updated });
  }, [data, getDayData, saveData]);

  const addEvent = useCallback((dateString: string, event: Omit<CalendarEvent, 'id' | 'date'>) => {
    if (!isValidDateString(dateString)) {
      return;
    }

    const title = sanitizeText(event.title, MAX_EVENT_TITLE_LENGTH);
    if (!title) {
      return;
    }

    const current = getDayData(dateString);
    const user = getCurrentUser();
    const newEvent: CalendarEvent = {
      ...event,
      id: crypto.randomUUID(),
      title,
      description: sanitizeOptionalText(event.description, MAX_EVENT_DESCRIPTION_LENGTH),
      date: dateString,
      time: sanitizeTime(event.time, event.isAllDay),
      ownerId: user?.id,
      visibility: event.visibility ?? 'calendar',
      updatedAt: new Date().toISOString(),
    };

    const updated = touchDay({
      ...current,
      events: [...current.events, newEvent],
    });
    void saveData({
      ...data,
      [dateString]: updated,
    });
  }, [data, getDayData, saveData]);

  const deleteEvent = useCallback((dateString: string, eventId: string) => {
    if (!isValidDateString(dateString)) {
      return;
    }

    const current = getDayData(dateString);
    const updated = touchDay({
      ...current,
      events: current.events.filter((e) => e.id !== eventId),
    });
    void saveData({ ...data, [dateString]: updated });
  }, [data, getDayData, saveData]);

  const updateEvent = useCallback((
    dateString: string,
    eventId: string,
    event: Omit<CalendarEvent, 'id' | 'date'>,
  ) => {
    if (!isValidDateString(dateString)) {
      return;
    }

    const title = sanitizeText(event.title, MAX_EVENT_TITLE_LENGTH);
    if (!title) {
      return;
    }

    const current = getDayData(dateString);
    const updated = touchDay({
      ...current,
      events: current.events.map((existing) => {
        if (existing.id !== eventId) {
          return existing;
        }

        return {
          ...existing,
          ...event,
          title,
          description: sanitizeOptionalText(event.description, MAX_EVENT_DESCRIPTION_LENGTH),
          id: eventId,
          date: dateString,
          time: sanitizeTime(event.time, event.isAllDay),
          updatedAt: new Date().toISOString(),
        };
      }),
    });

    void saveData({ ...data, [dateString]: updated });
  }, [data, getDayData, saveData]);

  const addDailyTodo = useCallback((dateString: string, text: string) => {
    if (!isValidDateString(dateString)) {
      return;
    }

    const sanitizedText = sanitizeText(text, MAX_TODO_LENGTH);
    if (!sanitizedText) {
      return;
    }

    const current = getDayData(dateString);
    const user = getCurrentUser();
    const newTodo: DailyTodo = touchTodo({
      id: crypto.randomUUID(),
      text: sanitizedText,
      completed: false,
      ownerId: user?.id,
    });
    const updated = touchDay({
      ...current,
      todos: [...(current.todos || []), newTodo],
    });
    void saveData({ ...data, [dateString]: updated });
  }, [data, getDayData, saveData]);

  const toggleDailyTodo = useCallback((dateString: string, todoId: string) => {
    if (!isValidDateString(dateString)) {
      return;
    }

    const current = getDayData(dateString);
    const updated = touchDay({
      ...current,
      todos: (current.todos || []).map((t) =>
        t.id === todoId ? touchTodo({ ...t, completed: !t.completed }) : t,
      ),
    });
    void saveData({ ...data, [dateString]: updated });
  }, [data, getDayData, saveData]);

  const deleteDailyTodo = useCallback((dateString: string, todoId: string) => {
    if (!isValidDateString(dateString)) {
      return;
    }

    const current = getDayData(dateString);
    const updated = touchDay({
      ...current,
      todos: (current.todos || []).filter((t) => t.id !== todoId),
    });
    void saveData({ ...data, [dateString]: updated });
  }, [data, getDayData, saveData]);

  const getAllEvents = useCallback((): CalendarEvent[] => {
    const allEvents: CalendarEvent[] = [];
    Object.values(data).forEach((dayData) => {
      if (dayData.events) {
        allEvents.push(...dayData.events);
      }
    });
    return allEvents;
  }, [data]);

  return {
    data,
    calendarProfile,
    syncState,
    getDayData,
    addMood,
    removeMood,
    addEvent,
    deleteEvent,
    updateEvent,
    addDailyTodo,
    toggleDailyTodo,
    deleteDailyTodo,
    getAllEvents,
  };
};

export const CalendarStorageProvider = ({ children }: { children: ReactNode }) => {
  const value = useCalendarStorageState();
  return createElement(CalendarStorageContext.Provider, { value }, children);
};

export const useCalendarStorage = () => {
  const context = useContext(CalendarStorageContext);
  if (!context) {
    throw new Error('useCalendarStorage must be used within CalendarStorageProvider');
  }

  return context;
};
