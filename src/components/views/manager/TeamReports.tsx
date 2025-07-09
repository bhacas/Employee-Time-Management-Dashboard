import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, parseISO } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ChevronLeft, ChevronRight, Download, User } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useTimeEntries } from '../../../context/TimeEntriesContext';
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];
const TeamReports: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const {
    getTeamMembers
  } = useAuth();
  const {
    getAllTeamEntries
  } = useTimeEntries();
  const teamMembers = getTeamMembers();
  const allEntries = getAllTeamEntries();
  const monthStart = startOfMonth(selectedMonth);
  const monthEnd = endOfMonth(selectedMonth);
  const goToPreviousMonth = () => {
    const newDate = new Date(selectedMonth);
    newDate.setMonth(newDate.getMonth() - 1);
    setSelectedMonth(newDate);
  };
  const goToNextMonth = () => {
    const newDate = new Date(selectedMonth);
    newDate.setMonth(newDate.getMonth() + 1);
    setSelectedMonth(newDate);
  };
  // Filter entries for the selected month
  const monthlyEntries = allEntries.filter(entry => {
    const entryDate = parseISO(entry.date);
    return entryDate >= monthStart && entryDate <= monthEnd;
  });
  // Group by user
  const entriesByUser = teamMembers.map(member => {
    const userEntries = monthlyEntries.filter(entry => entry.userId === member.id);
    const totalHours = userEntries.reduce((sum, entry) => sum + entry.duration / 60, 0);
    return {
      id: member.id,
      name: member.name,
      totalHours: parseFloat(totalHours.toFixed(1)),
      entries: userEntries.length
    };
  }).sort((a, b) => b.totalHours - a.totalHours);
  // Group by project
  const projectData = monthlyEntries.reduce((acc, entry) => {
    const project = entry.project || 'Uncategorized';
    if (!acc[project]) {
      acc[project] = 0;
    }
    acc[project] += entry.duration / 60;
    return acc;
  }, {} as Record<string, number>);
  const projectChartData = Object.entries(projectData).map(([name, hours]) => ({
    name,
    hours: parseFloat(hours.toFixed(1))
  })).sort((a, b) => b.hours - a.hours);
  // Total hours for the team
  const totalTeamHours = entriesByUser.reduce((sum, user) => sum + user.totalHours, 0);
  return <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Team Reports</h2>
          <p className="mt-1 text-sm text-gray-500">
            Comprehensive view of your team's time allocation
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button onClick={goToPreviousMonth} className="p-1 rounded-full hover:bg-gray-200">
            <ChevronLeft className="h-5 w-5 text-gray-600" />
          </button>
          <span className="text-sm font-medium">
            {format(monthStart, 'MMMM yyyy')}
          </span>
          <button onClick={goToNextMonth} className="p-1 rounded-full hover:bg-gray-200">
            <ChevronRight className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Team Members</h3>
          <p className="mt-1 text-2xl font-semibold text-gray-900">
            {teamMembers.length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Total Hours</h3>
          <p className="mt-1 text-2xl font-semibold text-gray-900">
            {totalTeamHours.toFixed(1)}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Projects</h3>
          <p className="mt-1 text-2xl font-semibold text-gray-900">
            {projectChartData.length}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h3 className="font-medium text-gray-900 mb-4">
            Hours by Team Member
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={entriesByUser} layout="vertical" margin={{
              top: 5,
              right: 30,
              left: 40,
              bottom: 5
            }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" width={100} />
                <Tooltip formatter={value => [`${value} hours`, 'Time']} />
                <Bar dataKey="totalHours" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h3 className="font-medium text-gray-900 mb-4">Hours by Project</h3>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={projectChartData} cx="50%" cy="50%" labelLine={false} outerRadius={80} fill="#8884d8" dataKey="hours" nameKey="name" label={({
                name,
                percent
              }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {projectChartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={value => [`${value} hours`, 'Time']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium text-gray-900">Team Member Details</h3>
          <button className="text-sm text-blue-600 hover:text-blue-800 flex items-center">
            <Download className="h-4 w-4 mr-1" />
            Export CSV
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Team Member
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hours
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Entries
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  % of Team
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {entriesByUser.map(user => <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                        <User className="h-4 w-4 text-gray-500" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.totalHours.toFixed(1)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.entries}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {totalTeamHours > 0 ? (user.totalHours / totalTeamHours * 100).toFixed(1) : 0}
                    %
                  </td>
                </tr>)}
            </tbody>
          </table>
        </div>
      </div>
    </div>;
};
export default TeamReports;