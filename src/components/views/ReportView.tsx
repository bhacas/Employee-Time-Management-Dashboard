import React, { useState } from 'react';
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, subMonths, addMonths } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChevronLeftIcon, ChevronRightIcon, DownloadIcon } from 'lucide-react';
import { useTimeEntries } from '../../context/TimeEntriesContext';
import { useAuth } from '../../context/AuthContext';

const ReportView: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { user } = useAuth();

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
  const monthlyEntries = getMonthlyEntries(selectedDate, user?.id);
  const goToPreviousMonth = () => {
    setSelectedDate(prevDate => subMonths(prevDate, 1));
  };
  const goToNextMonth = () => {
    setSelectedDate(prevDate => addMonths(prevDate, 1));
  };
  const goToCurrentMonth = () => {
    setSelectedDate(new Date());
  };
  // Group entries by project
  const entriesByProject = monthlyEntries.reduce((acc, entry) => {
    const project = entry.project || 'Uncategorized';
    if (!acc[project]) {
      acc[project] = [];
    }
    acc[project].push(entry);
    return acc;
  }, {} as Record<string, typeof monthlyEntries>);
  // Calculate total duration by project
  const projectTotals = Object.entries(entriesByProject).map(([project, entries]) => {
    const totalMinutes = entries.reduce((sum, entry) => sum + entry.duration, 0);
    const totalHours = totalMinutes / 60;
    return {
      project,
      totalHours
    };
  }).sort((a, b) => b.totalHours - a.totalHours);
  // Prepare data for daily chart
  const chartData = daysInMonth.map(day => {
    const dayEntries = getDailyEntries(day, user?.id);
    const totalMinutes = dayEntries.reduce((sum, entry) => sum + entry.duration, 0);
    const totalHours = totalMinutes / 60;
    return {
      date: format(day, 'd'),
      hours: parseFloat(totalHours.toFixed(1))
    };
  });
  // Calculate overall stats
  const totalDuration = monthlyEntries.reduce((sum, entry) => sum + entry.duration, 0);
  const totalHours = totalDuration / 60;
  const averageHoursPerDay = totalHours / daysInMonth.length;
  const daysWithEntries = new Set(monthlyEntries.map(entry => entry.date)).size;
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };
  return <div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <button onClick={goToPreviousMonth} className="p-1 rounded-full hover:bg-gray-200">
            <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
          </button>
          <h2 className="text-xl font-semibold mx-4">
            {format(monthStart, 'MMMM yyyy')} Report
          </h2>
          <button onClick={goToNextMonth} className="p-1 rounded-full hover:bg-gray-200">
            <ChevronRightIcon className="h-5 w-5 text-gray-600" />
          </button>
        </div>
        <button onClick={goToCurrentMonth} className="text-sm text-blue-600 hover:text-blue-800">
          This Month
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Total Hours</h3>
          <p className="mt-1 text-2xl font-semibold text-gray-900">
            {totalHours.toFixed(1)}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Days Worked</h3>
          <p className="mt-1 text-2xl font-semibold text-gray-900">
            {daysWithEntries} / {daysInMonth.length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">
            Average Hours/Day
          </h3>
          <p className="mt-1 text-2xl font-semibold text-gray-900">
            {averageHoursPerDay.toFixed(1)}
          </p>
        </div>
      </div>
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <h3 className="font-medium text-gray-900 mb-4">Daily Hours</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={value => [`${value} hours`, 'Time']} />
              <Bar dataKey="hours" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium text-gray-900">Time by Project</h3>
          <button className="text-sm text-blue-600 hover:text-blue-800 flex items-center">
            <DownloadIcon className="h-4 w-4 mr-1" />
            Export CSV
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Project
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hours
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Percentage
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {projectTotals.map(({
              project,
              totalHours
            }) => <tr key={project}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {project}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {totalHours.toFixed(1)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {(totalHours / (totalDuration / 60) * 100).toFixed(1)}%
                  </td>
                </tr>)}
            </tbody>
          </table>
        </div>
      </div>
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium text-gray-900">All Time Entries</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Project
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {monthlyEntries.map(entry => <tr key={entry.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(parseISO(entry.date), 'MMM d, yyyy')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {entry.project || 'Uncategorized'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                    {entry.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDuration(entry.duration)}
                  </td>
                </tr>)}
            </tbody>
          </table>
        </div>
      </div>
    </div>;
};
export default ReportView;