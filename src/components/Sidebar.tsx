import React from 'react';
import { NavLink } from 'react-router-dom';
import { CalendarIcon, ClockIcon, BarChart3Icon, LogOutIcon, CalendarDaysIcon, CalendarRangeIcon, UsersIcon, UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
const Sidebar: React.FC = () => {
  const {
    logout,
    user,
    isManager
  } = useAuth();
  return <div className="bg-white w-16 md:w-64 shadow-lg flex flex-col">
      <div className="p-4 flex items-center justify-center md:justify-start">
        <ClockIcon className="h-8 w-8 text-blue-500" />
        <h1 className="ml-2 text-xl font-bold text-gray-800 hidden md:block">
          TimeTrack
        </h1>
      </div>
      <div className="hidden md:block px-4 py-2">
        <div className="text-sm font-medium text-gray-500">Welcome,</div>
        <div className="font-semibold text-gray-800">{user?.name}</div>
        {isManager && <div className="text-xs text-blue-600 mt-1">Manager</div>}
      </div>
      <nav className="flex-1 pt-4">
        {/* Employee Views */}
        <div className="px-4 py-2">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:block">
            My Time
          </h3>
        </div>
        <NavLink to="daily" className={({
        isActive
      }) => `flex items-center px-4 py-3 ${isActive ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:bg-gray-100'}`}>
          <CalendarIcon className="h-5 w-5" />
          <span className="ml-3 hidden md:block">Daily View</span>
        </NavLink>
        <NavLink to="weekly" className={({
        isActive
      }) => `flex items-center px-4 py-3 ${isActive ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:bg-gray-100'}`}>
          <CalendarDaysIcon className="h-5 w-5" />
          <span className="ml-3 hidden md:block">Weekly View</span>
        </NavLink>
        <NavLink to="monthly" className={({
        isActive
      }) => `flex items-center px-4 py-3 ${isActive ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:bg-gray-100'}`}>
          <CalendarRangeIcon className="h-5 w-5" />
          <span className="ml-3 hidden md:block">Monthly View</span>
        </NavLink>
        <NavLink to="reports" className={({
        isActive
      }) => `flex items-center px-4 py-3 ${isActive ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:bg-gray-100'}`}>
          <BarChart3Icon className="h-5 w-5" />
          <span className="ml-3 hidden md:block">Reports</span>
        </NavLink>
        {/* Manager Views */}
        {isManager && <>
            <div className="mt-6 px-4 py-2">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:block">
                Team Management
              </h3>
            </div>
            <NavLink to="team-overview" className={({
          isActive
        }) => `flex items-center px-4 py-3 ${isActive ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:bg-gray-100'}`}>
              <UsersIcon className="h-5 w-5" />
              <span className="ml-3 hidden md:block">Team Overview</span>
            </NavLink>
            <NavLink to="team-reports" className={({
          isActive
        }) => `flex items-center px-4 py-3 ${isActive ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:bg-gray-100'}`}>
              <BarChart3Icon className="h-5 w-5" />
              <span className="ml-3 hidden md:block">Team Reports</span>
            </NavLink>
          </>}
      </nav>
      <div className="p-4">
        <button onClick={logout} className="flex items-center justify-center md:justify-start w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md">
          <LogOutIcon className="h-5 w-5" />
          <span className="ml-2 hidden md:block">Logout</span>
        </button>
      </div>
    </div>;
};
export default Sidebar;