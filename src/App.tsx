import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { TimeEntriesProvider } from './context/TimeEntriesContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
export function App() {
  return <BrowserRouter>
      <AuthProvider>
        <TimeEntriesProvider>
          <div className="w-full min-h-screen bg-gray-50">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/dashboard/*" element={<ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </div>
        </TimeEntriesProvider>
      </AuthProvider>
    </BrowserRouter>;
}