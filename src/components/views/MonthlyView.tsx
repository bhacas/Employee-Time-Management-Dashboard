import React, { useState } from 'react';
import { format, parseISO, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth } from 'date-fns';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { useTimeEntries } from '../../context/TimeEntriesContext';
const MonthlyView: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const {
    getMonthlyEntries,
    getDailyEntries
  } = useTimeEntries();
  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(selectedDate);
  const daysInMonth = eachDayOfInterval({
    start: monthStart,
    end: monthEnd
  });
  const monthlyEntries = getMonthlyEntries(selectedDate);
  const goToPreviousMonth = () => {
    setSelectedDate(prevDate => subMonths(prevDate, 1));
  };
  const goToNextMonth = () => {
    setSelectedDate(prevDate => addMonths(prevDate, 1));
  };
  const goToCurrentMonth = () => {
    setSelectedDate(new Date());
  };
  const totalDuration = monthlyEntries.reduce((total, entry) => total + entry.duration, 0);
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };
  const getDayEntryCount = (day: Date) => {
    return getDailyEntries(day).length;
  };
  const getDayTotalHours = (day: Date) => {
    const entries = getDailyEntries(day);
    const totalMinutes = entries.reduce((total, entry) => total + entry.duration, 0);
    return totalMinutes / 60;
  };
  return <div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <button onClick={goToPreviousMonth} className="p-1 rounded-full hover:bg-gray-200">
            <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
          </button>
          <h2 className="text-xl font-semibold mx-4">
            {format(monthStart, 'MMMM yyyy')}
          </h2>
          <button onClick={goToNextMonth} className="p-1 rounded-full hover:bg-gray-200">
            <ChevronRightIcon className="h-5 w-5 text-gray-600" />
          </button>
        </div>
        <button onClick={goToCurrentMonth} className="text-sm text-blue-600 hover:text-blue-800">
          This Month
        </button>
      </div>
      <div className="bg-blue-50 p-3 rounded-lg mb-4">
        <p className="text-sm text-blue-800">
          Total time this month:{' '}
          <span className="font-semibold">{formatDuration(totalDuration)}</span>
        </p>
      </div>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="grid grid-cols-7 gap-px bg-gray-200">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => <div key={day} className="bg-gray-50 py-2 text-center text-sm font-medium text-gray-500">
              {day}
            </div>)}
        </div>
        <div className="grid grid-cols-7 gap-px bg-gray-200">
          {daysInMonth.map((day, i) => {
          const entryCount = getDayEntryCount(day);
          const totalHours = getDayTotalHours(day);
          const isCurrentMonth = isSameMonth(day, selectedDate);
          const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
          return <div key={i} className={`bg-white p-2 h-24 ${!isCurrentMonth ? 'bg-gray-50 text-gray-400' : ''} ${isToday ? 'border-2 border-blue-500' : ''}`}>
                <div className="text-right text-sm font-medium">
                  {format(day, 'd')}
                </div>
                {entryCount > 0 && <div className="mt-2">
                    <div className={`text-xs rounded-full px-2 py-1 font-medium ${totalHours > 0 ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                      {entryCount} {entryCount === 1 ? 'entry' : 'entries'}
                    </div>
                    {totalHours > 0 && <div className="mt-1 text-xs text-gray-600">
                        {totalHours.toFixed(1)}h
                      </div>}
                  </div>}
              </div>;
        })}
        </div>
      </div>
    </div>;
};
export default MonthlyView;