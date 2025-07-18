import React, { useEffect, useState, createContext, useContext } from 'react';
import { format, parseISO, startOfMonth, endOfMonth, startOfWeek, endOfWeek, startOfDay, endOfDay } from 'date-fns';
import { useAuth } from './AuthContext';
import { useConfig } from '../context/ConfigContext';
import { useAuthenticatedFetch } from '../hooks/useAuthenticatedFetch';

export interface TimeEntry {
  id: string;
  userId: string;
  date: string;
  startTime: string;
  endTime: string;
  description: string;
  duration: number;
  project?: string;
}

interface TimeEntriesContextType {
  entries: TimeEntry[];
  addEntry: (entry: Omit<TimeEntry, 'id'>) => void;
  updateEntry: (id: string, entry: Partial<TimeEntry>) => void;
  deleteEntry: (id: string) => void;
  getEntriesByDateRange: (start: Date, end: Date, userId?: string) => TimeEntry[];
  getDailyEntries: (date: Date, userId?: string) => TimeEntry[];
  getWeeklyEntries: (date: Date, userId?: string) => TimeEntry[];
  getMonthlyEntries: (date: Date, userId?: string) => TimeEntry[];
  getEntriesByUserId: (userId: string) => TimeEntry[];
  getAllTeamEntries: () => TimeEntry[];
}

const TimeEntriesContext = createContext<TimeEntriesContextType | undefined>(undefined);

export const TimeEntriesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, getTeamMembers } = useAuth();
  const { config } = useConfig();
  const apiFetch = useAuthenticatedFetch(); // ✅ wywołane na górze komponentu
  const [entries, setEntries] = useState<TimeEntry[]>([]);

  // Fetch entries when user changes
  useEffect(() => {
    const fetchEntries = async () => {
      if (!user) return;

      try {
        const response = await apiFetch('/api/time_entries', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            Accept: 'application/json',
          },
        });

        if (!response || !response.ok) throw new Error('Błąd podczas pobierania danych');

        const data = await response.json();
        setEntries(data);
      } catch (error) {
        console.error('Błąd ładowania wpisów:', error);
      }
    };

    fetchEntries();
  }, [user]);

  // Save entries to localStorage
  useEffect(() => {
    if (user && entries.length > 0) {
      localStorage.setItem(`timeEntries_${user.id}`, JSON.stringify(entries));
    }
  }, [entries, user]);

  const addEntry = async (entry: Omit<TimeEntry, 'id'>) => {
    if (!user) return;

    try {
      const response = await apiFetch('/api/time_entries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(entry),
      });

      if (!response || !response.ok) throw new Error('Failed to add entry');

      const newEntry: TimeEntry = await response.json();
      setEntries([...entries, newEntry]);
    } catch (error) {
      console.error('Error adding entry:', error);
    }
  };

  const updateEntry = async (id: string, updatedFields: Partial<TimeEntry>) => {
    if (!user) return;

    try {
      const response = await apiFetch(`/api/time_entries/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/merge-patch+json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(updatedFields),
      });

      if (!response || !response.ok) throw new Error('Nie udało się zaktualizować wpisu');

      const updatedEntry: TimeEntry = await response.json();
      setEntries(prevEntries =>
          prevEntries.map(entry => (entry.id === id ? updatedEntry : entry))
      );
    } catch (error) {
      console.error('Błąd podczas aktualizacji wpisu:', error);
    }
  };

  const deleteEntry = async (id: string) => {
    if (!user) return;

    try {
      const response = await apiFetch(`/api/time_entries/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response || !response.ok) throw new Error('Remove entry error');

      setEntries(entries.filter(entry => entry.id !== id));
    } catch (error) {
      console.error('Remove entry error:', error);
    }
  };

  const getEntriesByDateRange = (start: Date, end: Date, userId?: string) => {
    return entries.filter(entry => {
      const entryDate = parseISO(entry.date);
      const userMatch = userId ? entry.userId === userId : true;
      return entryDate >= start && entryDate <= end && userMatch;
    });
  };

  const getDailyEntries = (date: Date, userId?: string) => {
    const start = startOfDay(date);
    const end = endOfDay(date);
    return getEntriesByDateRange(start, end, userId);
  };

  const getWeeklyEntries = (date: Date, userId?: string) => {
    const start = startOfWeek(date, { weekStartsOn: 1 });
    const end = endOfWeek(date, { weekStartsOn: 1 });
    return getEntriesByDateRange(start, end, userId);
  };

  const getMonthlyEntries = (date: Date, userId?: string) => {
    const start = startOfMonth(date);
    const end = endOfMonth(date);
    return getEntriesByDateRange(start, end, userId);
  };

  const getEntriesByUserId = (userId: string) => {
    return entries.filter(entry => entry.userId === userId);
  };

  const getAllTeamEntries = () => {
    if (!user || user.role !== 'manager' || !user.teamMembers) {
      return [];
    }
    return entries.filter(entry => user.teamMembers?.includes(entry.userId) || entry.userId === user.id);
  };

  return (
      <TimeEntriesContext.Provider
          value={{
            entries,
            addEntry,
            updateEntry,
            deleteEntry,
            getEntriesByDateRange,
            getDailyEntries,
            getWeeklyEntries,
            getMonthlyEntries,
            getEntriesByUserId,
            getAllTeamEntries,
          }}
      >
        {children}
      </TimeEntriesContext.Provider>
  );
};

export const useTimeEntries = () => {
  const context = useContext(TimeEntriesContext);
  if (context === undefined) {
    throw new Error('useTimeEntries must be used within a TimeEntriesProvider');
  }
  return context;
};
