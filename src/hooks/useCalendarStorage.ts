import { useState, useEffect } from 'react';
import { DayData, CalendarEvent } from '../types';

const STORAGE_KEY = 'web-calendar-data';
const EVENT_KEY = 'calendar-storage-update'; // Custom event key

export const useCalendarStorage = () => {
  const [data, setData] = useState<Record<string, DayData>>({});

  const loadData = () => {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          // Protection against null/invalid storage (legacy data fix)
          if (parsed && typeof parsed === 'object') {
            setData(parsed);
          } else {
             setData({});
          }
        } catch (e) {
          console.error('Failed to parse calendar data', e);
          setData({});
        }
      }
  };

  useEffect(() => {
    loadData(); // Initial load

    // Listen for custom cross-component updates
    const handleStorageUpdate = () => loadData();
    window.addEventListener(EVENT_KEY, handleStorageUpdate);
    
    // Listen for cross-tab updates
    window.addEventListener('storage', handleStorageUpdate);

    return () => {
        window.removeEventListener(EVENT_KEY, handleStorageUpdate);
        window.removeEventListener('storage', handleStorageUpdate);
    };
  }, []);

  const saveData = (newData: Record<string, DayData>) => {
    setData(newData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
    // Dispatch event to notify other hooks
    window.dispatchEvent(new Event(EVENT_KEY));
  };

  const getDayData = (dateString: string): DayData => {
    return (data && data[dateString]) || { date: dateString, moods: [], events: [] };
  };

  const addMood = (dateString: string, mood: string) => {
    const current = getDayData(dateString);
    if (current.moods.length >= 2) return; // Max 2 limit

    const updated = {
      ...current,
      moods: [...current.moods, mood],
    };

    saveData({
      ...data,
      [dateString]: updated,
    });
  };

  const removeMood = (dateString: string, index: number) => {
    const current = getDayData(dateString);
    const newMoods = [...current.moods];
    newMoods.splice(index, 1);

    const updated = {
      ...current,
      moods: newMoods,
    };
    saveData({ ...data, [dateString]: updated });
  }

  const addEvent = (dateString: string, event: Omit<CalendarEvent, 'id' | 'date'>) => {
    const current = getDayData(dateString);
    const newEvent: CalendarEvent = {
        ...event,
        id: crypto.randomUUID(),
        date: dateString
    };

    const updated = {
        ...current,
        events: [...current.events, newEvent]
    };
    saveData({ ...data, [dateString]: updated });
  };

  const deleteEvent = (dateString: string, eventId: string) => {
      const current = getDayData(dateString);
      const updated = {
          ...current,
          events: current.events.filter(e => e.id !== eventId)
      };
      saveData({ ...data, [dateString]: updated });
  }

  const addDailyTodo = (dateString: string, text: string) => {
      const current = getDayData(dateString);
      const newTodo = { id: crypto.randomUUID(), text, completed: false };
      const updated = {
          ...current,
          todos: [...(current.todos || []), newTodo]
      };
      saveData({ ...data, [dateString]: updated });
  };

  const toggleDailyTodo = (dateString: string, todoId: string) => {
      const current = getDayData(dateString);
      const updated = {
          ...current,
          todos: (current.todos || []).map(t => t.id === todoId ? { ...t, completed: !t.completed } : t)
      };
      saveData({ ...data, [dateString]: updated });
  };
  
  const deleteDailyTodo = (dateString: string, todoId: string) => {
      const current = getDayData(dateString);
      const updated = {
          ...current,
          todos: (current.todos || []).filter(t => t.id !== todoId)
      };
      saveData({ ...data, [dateString]: updated });
  };

  const getAllEvents = (): CalendarEvent[] => {
      const allEvents: CalendarEvent[] = [];
      Object.values(data).forEach(dayData => {
          if (dayData.events) {
              allEvents.push(...dayData.events);
          }
      });
      return allEvents;
  };

  return {
    data,
    getDayData,
    addMood,
    removeMood,
    addEvent,
    deleteEvent,
    addDailyTodo,
    toggleDailyTodo,
    deleteDailyTodo,
    getAllEvents
  };
};
