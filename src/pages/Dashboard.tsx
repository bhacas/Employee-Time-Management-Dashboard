import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import DailyView from '../components/views/DailyView';
import WeeklyView from '../components/views/WeeklyView';
import MonthlyView from '../components/views/MonthlyView';
import ReportView from '../components/views/ReportView';
import Header from '../components/Header';
import TeamOverview from '../components/views/manager/TeamOverview';
import TeamReports from '../components/views/manager/TeamReports';
import EmployeeDetail from '../components/views/manager/EmployeeDetail';
import { useAuth } from '../context/AuthContext';
const Dashboard: React.FC = () => {
  const {
    isManager
  } = useAuth();
  return <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Routes>
            {/* Employee Routes */}
            <Route path="daily" element={<DailyView />} />
            <Route path="weekly" element={<WeeklyView />} />
            <Route path="monthly" element={<MonthlyView />} />
            <Route path="reports" element={<ReportView />} />
            {/* Manager Routes */}
            {isManager && <>
                <Route path="team-overview" element={<TeamOverview />} />
                <Route path="team-reports" element={<TeamReports />} />
                <Route path="employee/:employeeId" element={<EmployeeDetail />} />
              </>}
            <Route path="*" element={<Navigate to="daily" replace />} />
          </Routes>
        </main>
      </div>
    </div>;
};
export default Dashboard;