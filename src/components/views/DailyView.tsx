import React, { useState } from 'react';
import { format, parseISO, addDays, subDays } from 'date-fns';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { useTimeEntries } from '../../context/TimeEntriesContext';
import { useAuth } from '../../context/AuthContext';
import TimeEntryCard from '../TimeEntryCard';
const DailyView: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { user } = useAuth();
  const {
    getDailyEntries
  } = useTimeEntries();
  const entries = getDailyEntries(selectedDate, user?.id);
  const goToPreviousDay = () => {
    setSelectedDate(prevDate => subDays(prevDate, 1));
  };
  const goToNextDay = () => {
    setSelectedDate(prevDate => addDays(prevDate, 1));
  };
  const goToToday = () => {
    setSelectedDate(new Date());
  };
  const totalDuration = entries.reduce((total, entry) => total + entry.duration, 0);
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };
  return <div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <button onClick={goToPreviousDay} className="p-1 rounded-full hover:bg-gray-200">
            <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
          </button>
          <h2 className="text-xl font-semibold mx-4">
            {format(selectedDate, 'EEEE, MMMM d, yyyy')}
          </h2>
          <button onClick={goToNextDay} className="p-1 rounded-full hover:bg-gray-200">
            <ChevronRightIcon className="h-5 w-5 text-gray-600" />
          </button>
        </div>
        <button onClick={goToToday} className="text-sm text-blue-600 hover:text-blue-800">
          Today
        </button>
      </div>
      {entries.length > 0 ? <div>
          <div className="bg-blue-50 p-3 rounded-lg mb-4">
            <p className="text-sm text-blue-800">
              Total time:{' '}
              <span className="font-semibold">
                {formatDuration(totalDuration)}
              </span>
            </p>
          </div>
          <div>
            {entries.map(entry => <TimeEntryCard key={entry.id} entry={entry} />)}
          </div>
        </div> : <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <p className="text-gray-500">No time entries for this day</p>
          <p className="text-sm text-gray-400 mt-1">
            Click the "New Entry" button to add one
          </p>
        </div>}
    </div>;
};
export default DailyView;