import React, { useEffect, useState, createContext, useContext } from 'react';
import { format, parseISO, startOfMonth, endOfMonth, startOfWeek, endOfWeek, startOfDay, endOfDay } from 'date-fns';
import { useAuth } from './AuthContext';
export interface TimeEntry {
  id: string;
  userId: string;
  date: string;
  startTime: string;
  endTime: string;
  description: string;
  duration: number; // in minutes
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
// Generate sample entries for a user
const generateSampleEntries = (userId: string): TimeEntry[] => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const twoDaysAgo = new Date(today);
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
  return [{
    id: `${userId}_1`,
    userId,
    date: format(today, 'yyyy-MM-dd'),
    startTime: '09:00',
    endTime: '12:30',
    description: 'Project planning',
    duration: 210,
    project: 'Website Redesign'
  }, {
    id: `${userId}_2`,
    userId,
    date: format(today, 'yyyy-MM-dd'),
    startTime: '13:30',
    endTime: '17:00',
    description: 'Development work',
    duration: 210,
    project: 'Website Redesign'
  }, {
    id: `${userId}_3`,
    userId,
    date: format(yesterday, 'yyyy-MM-dd'),
    startTime: '09:00',
    endTime: '17:00',
    description: 'Client meeting and follow-up',
    duration: 480,
    project: 'Client Onboarding'
  }, {
    id: `${userId}_4`,
    userId,
    date: format(twoDaysAgo, 'yyyy-MM-dd'),
    startTime: '10:00',
    endTime: '16:00',
    description: 'Documentation and testing',
    duration: 360,
    project: 'API Integration'
  }];
};
// Generate sample data for all team members
const generateTeamData = (teamMemberIds: string[]): TimeEntry[] => {
  let allEntries: TimeEntry[] = [];
  teamMemberIds.forEach(userId => {
    const userEntries = generateSampleEntries(userId);
    allEntries = [...allEntries, ...userEntries];
  });
  return allEntries;
};
export const TimeEntriesProvider: React.FC<{
  children: React.ReactNode;
}> = ({
  children
}) => {
  const {
    user,
    getTeamMembers
  } = useAuth();
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  // Load entries when user changes
  useEffect(() => {
    if (user) {
      // In a real app, this would fetch from an API
      // For now, use sample data
      const storedEntries = localStorage.getItem(`timeEntries_${user.id}`);
      if (storedEntries) {
        setEntries(JSON.parse(storedEntries));
      } else {
        // If user is a manager, generate entries for all team members
        if (user.role === 'manager' && user.teamMembers) {
          const teamEntries = generateTeamData([user.id, ...user.teamMembers]);
          setEntries(teamEntries);
          localStorage.setItem(`timeEntries_${user.id}`, JSON.stringify(teamEntries));
        } else {
          // Regular employee entries
          const sampleEntries = generateSampleEntries(user.id);
          setEntries(sampleEntries);
          localStorage.setItem(`timeEntries_${user.id}`, JSON.stringify(sampleEntries));
        }
      }
    } else {
      setEntries([]);
    }
  }, [user]);
  // Save entries to localStorage when they change
  useEffect(() => {
    if (user && entries.length > 0) {
      localStorage.setItem(`timeEntries_${user.id}`, JSON.stringify(entries));
    }
  }, [entries, user]);
  const addEntry = (entry: Omit<TimeEntry, 'id'>) => {
    if (!user) return;
    const newEntry = {
      ...entry,
      id: Date.now().toString(),
      userId: entry.userId || user.id
    };
    setEntries([...entries, newEntry]);
  };
  const updateEntry = (id: string, updatedFields: Partial<TimeEntry>) => {
    setEntries(entries.map(entry => entry.id === id ? {
      ...entry,
      ...updatedFields
    } : entry));
  };
  const deleteEntry = (id: string) => {
    setEntries(entries.filter(entry => entry.id !== id));
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
    const start = startOfWeek(date, {
      weekStartsOn: 1
    }); // Start on Monday
    const end = endOfWeek(date, {
      weekStartsOn: 1
    });
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
  return <TimeEntriesContext.Provider value={{
    entries,
    addEntry,
    updateEntry,
    deleteEntry,
    getEntriesByDateRange,
    getDailyEntries,
    getWeeklyEntries,
    getMonthlyEntries,
    getEntriesByUserId,
    getAllTeamEntries
  }}>
      {children}
    </TimeEntriesContext.Provider>;
};
export const useTimeEntries = () => {
  const context = useContext(TimeEntriesContext);
  if (context === undefined) {
    throw new Error('useTimeEntries must be used within a TimeEntriesProvider');
  }
  return context;
};