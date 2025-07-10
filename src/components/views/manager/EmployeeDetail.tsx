import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth } from 'date-fns';
import { ChevronLeftIcon, ChevronRightIcon, ArrowLeftIcon, UserIcon } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useTimeEntries } from '../../../context/TimeEntriesContext';
import TimeEntryCard from '../../TimeEntryCard';
const EmployeeDetail: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const {
    getTeamMembers
  } = useAuth();
  const {
    getMonthlyEntries,
    getDailyEntries
  } = useTimeEntries();
  // Find the employee
  const { employeeId: employeeIdParam } = useParams<{ employeeId: string }>();
  const employeeId = Number(employeeIdParam);
  const employee = getTeamMembers().find(member => member.id === employeeId);
  if (!employee) {
    return <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-700">
          Employee not found
        </h2>
        <Link to="/dashboard/team-overview" className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-800">
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Back to Team Overview
        </Link>
      </div>;
  }
  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(selectedDate);
  const daysInMonth = eachDayOfInterval({
    start: monthStart,
    end: monthEnd
  });
  const monthlyEntries = getMonthlyEntries(selectedDate, employee.id);
  const goToPreviousMonth = () => {
    setSelectedDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  };
  const goToNextMonth = () => {
    setSelectedDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  };
  const goToCurrentMonth = () => {
    setSelectedDate(new Date());
  };
  // Calculate stats
  const totalDuration = monthlyEntries.reduce((sum, entry) => sum + entry.duration, 0);
  const totalHours = totalDuration / 60;
  const daysWithEntries = new Set(monthlyEntries.map(entry => entry.date)).size;
  const averageHoursPerDay = daysWithEntries > 0 ? totalHours / daysWithEntries : 0;
  // Group entries by project
  const entriesByProject = monthlyEntries.reduce((acc, entry) => {
    const project = entry.project || 'Uncategorized';
    if (!acc[project]) {
      acc[project] = 0;
    }
    acc[project] += entry.duration / 60;
    return acc;
  }, {} as Record<string, number>);
  const projectData = Object.entries(entriesByProject).map(([project, hours]) => ({
    project,
    hours
  })).sort((a, b) => b.hours - a.hours);
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };
  return <div>
      <div className="mb-6">
        <Link to="/dashboard/team-overview" className="inline-flex items-center text-blue-600 hover:text-blue-800">
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Back to Team Overview
        </Link>
        <div className="mt-4 flex items-center">
          <div className="flex-shrink-0 h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
            <UserIcon className="h-6 w-6 text-gray-500" />
          </div>
          <div className="ml-4">
            <h2 className="text-2xl font-bold text-gray-900">
              {employee.name}
            </h2>
            <p className="text-sm text-gray-500">{employee.email}</p>
          </div>
        </div>
      </div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <button onClick={goToPreviousMonth} className="p-1 rounded-full hover:bg-gray-200">
            <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
          </button>
          <h3 className="text-xl font-semibold mx-4">
            {format(monthStart, 'MMMM yyyy')}
          </h3>
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
          <h3 className="text-sm font-medium text-gray-500">Avg Hours/Day</h3>
          <p className="mt-1 text-2xl font-semibold text-gray-900">
            {averageHoursPerDay.toFixed(1)}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h3 className="font-medium text-gray-900 mb-4">Projects</h3>
          {projectData.length > 0 ? <div className="space-y-4">
              {projectData.map(({
            project,
            hours
          }) => <div key={project} className="flex items-center">
                  <div className="w-32 text-sm font-medium text-gray-900 truncate">
                    {project}
                  </div>
                  <div className="flex-1 ml-2">
                    <div className="bg-gray-200 rounded-full h-2.5">
                      <div className="bg-blue-600 h-2.5 rounded-full" style={{
                  width: `${Math.min(100, hours / totalHours * 100)}%`
                }}></div>
                    </div>
                  </div>
                  <div className="ml-3 text-sm text-gray-500 w-16 text-right">
                    {hours.toFixed(1)}h
                  </div>
                </div>)}
            </div> : <p className="text-gray-500 text-sm py-4">
              No project data for this month
            </p>}
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h3 className="font-medium text-gray-900 mb-4">Calendar</h3>
          <div className="grid grid-cols-7 gap-px bg-gray-200">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => <div key={day} className="bg-gray-50 py-2 text-center text-xs font-medium text-gray-500">
                {day}
              </div>)}
          </div>
          <div className="grid grid-cols-7 gap-px bg-gray-200">
            {daysInMonth.map((day, i) => {
            const dayEntries = getDailyEntries(day, employee.id);
            const totalMinutes = dayEntries.reduce((sum, entry) => sum + entry.duration, 0);
            const dayHours = totalMinutes / 60;
            return <div key={i} className={`bg-white p-1 h-14 text-center ${format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd') ? 'border border-blue-500' : ''}`}>
                  <div className="text-xs font-medium">{format(day, 'd')}</div>
                  {dayHours > 0 && <div className="mt-1 text-xs font-medium text-blue-600">
                      {dayHours.toFixed(1)}h
                    </div>}
                </div>;
          })}
          </div>
        </div>
      </div>
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <h3 className="font-medium text-gray-900 mb-4">Time Entries</h3>
        {monthlyEntries.length > 0 ? <div className="space-y-3">
            {monthlyEntries.map(entry => <TimeEntryCard key={entry.id} entry={entry} />)}
          </div> : <p className="text-center py-6 text-gray-500">
            No time entries for this month
          </p>}
      </div>
    </div>;
};
export default EmployeeDetail;