import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { ChevronRightIcon, ClockIcon, UserIcon } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useTimeEntries } from '../../../context/TimeEntriesContext';
const TeamOverview: React.FC = () => {
  const {
    getTeamMembers
  } = useAuth();
  const {
    getEntriesByUserId
  } = useTimeEntries();
  const teamMembers = getTeamMembers();
  // Get today's date
  const today = new Date();
  const todayFormatted = format(today, 'yyyy-MM-dd');
  // Calculate stats for each team member
  const teamMembersWithStats = teamMembers.map(member => {
    const userEntries = getEntriesByUserId(member.id);
    // Calculate total hours this week
    const weeklyHours = userEntries.filter(entry => {
      const entryDate = new Date(entry.date);
      const diffTime = Math.abs(today.getTime() - entryDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 7;
    }).reduce((total, entry) => total + entry.duration / 60, 0);
    // Check if they logged time today
    const loggedToday = userEntries.some(entry => entry.date === todayFormatted);
    // Get total projects
    const projects = new Set(userEntries.map(entry => entry.project || 'Uncategorized')).size;
    return {
      ...member,
      weeklyHours,
      loggedToday,
      projects
    };
  });
  return <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Team Overview</h2>
        <p className="mt-1 text-sm text-gray-500">
          Monitor your team's time entries and productivity
        </p>
      </div>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Team Members
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            {teamMembers.length} members in your team
          </p>
        </div>
        <ul className="divide-y divide-gray-200">
          {teamMembersWithStats.map(member => <li key={member.id}>
              <Link to={`/dashboard/employee/${member.id}`} className="block hover:bg-gray-50">
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <UserIcon className="h-6 w-6 text-gray-500" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-blue-600">
                          {member.name}
                        </p>
                        <p className="text-sm text-gray-500">{member.email}</p>
                      </div>
                    </div>
                    <div className="ml-2 flex-shrink-0 flex">
                      <ChevronRightIcon className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <p className="flex items-center text-sm text-gray-500">
                        <ClockIcon className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                        {member.weeklyHours.toFixed(1)} hours this week
                      </p>
                      <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                        <span className={`h-2 w-2 rounded-full mr-1.5 ${member.loggedToday ? 'bg-green-400' : 'bg-red-400'}`}></span>
                        {member.loggedToday ? 'Logged time today' : 'No time logged today'}
                      </p>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                      <p>
                        {member.projects}{' '}
                        {member.projects === 1 ? 'project' : 'projects'}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            </li>)}
        </ul>
      </div>
    </div>;
};
export default TeamOverview;