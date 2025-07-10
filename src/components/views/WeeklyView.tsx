import React, { useState } from 'react';
import { format, parseISO, addWeeks, subWeeks, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { useTimeEntries } from '../../context/TimeEntriesContext';
import TimeEntryCard from '../TimeEntryCard';
import { useAuth } from '../../context/AuthContext';

const WeeklyView: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { user } = useAuth();
  const {
    getWeeklyEntries,
    getDailyEntries
  } = useTimeEntries();
  const weekStart = startOfWeek(selectedDate, {
    weekStartsOn: 1
  }); // Start on Monday
  const weekEnd = endOfWeek(selectedDate, {
    weekStartsOn: 1
  });
  const daysInWeek = eachDayOfInterval({
    start: weekStart,
    end: weekEnd
  });
  const weeklyEntries = getWeeklyEntries(selectedDate, user?.id);
  const goToPreviousWeek = () => {
    setSelectedDate(prevDate => subWeeks(prevDate, 1));
  };
  const goToNextWeek = () => {
    setSelectedDate(prevDate => addWeeks(prevDate, 1));
  };
  const goToCurrentWeek = () => {
    setSelectedDate(new Date());
  };
  const totalDuration = weeklyEntries.reduce((total, entry) => total + entry.duration, 0);
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };
  return <div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <button onClick={goToPreviousWeek} className="p-1 rounded-full hover:bg-gray-200">
            <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
          </button>
          <h2 className="text-xl font-semibold mx-4">
            {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
          </h2>
          <button onClick={goToNextWeek} className="p-1 rounded-full hover:bg-gray-200">
            <ChevronRightIcon className="h-5 w-5 text-gray-600" />
          </button>
        </div>
        <button onClick={goToCurrentWeek} className="text-sm text-blue-600 hover:text-blue-800">
          This Week
        </button>
      </div>
      <div className="bg-blue-50 p-3 rounded-lg mb-4">
        <p className="text-sm text-blue-800">
          Total time this week:{' '}
          <span className="font-semibold">{formatDuration(totalDuration)}</span>
        </p>
      </div>
      <div className="space-y-6">
        {daysInWeek.map(day => {
        const dayEntries = getDailyEntries(day, user?.id);
        const dayTotalDuration = dayEntries.reduce((total, entry) => total + entry.duration, 0);
        return <div key={format(day, 'yyyy-MM-dd')} className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-medium text-gray-900">
                  {format(day, 'EEEE, MMMM d')}
                </h3>
                <span className="text-sm text-gray-500">
                  {dayEntries.length > 0 ? formatDuration(dayTotalDuration) : 'No entries'}
                </span>
              </div>
              {dayEntries.length > 0 ? <div className="space-y-3">
                  {dayEntries.map(entry => <TimeEntryCard key={entry.id} entry={entry} />)}
                </div> : <p className="text-sm text-gray-400 py-2">
                  No time entries for this day
                </p>}
            </div>;
      })}
      </div>
    </div>;
};
export default WeeklyView;