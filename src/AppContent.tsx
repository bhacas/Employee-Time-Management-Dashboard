import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { TimeEntriesProvider } from './context/TimeEntriesContext';
import { ToastProvider } from './context/ToastContext';
import { Toast } from './components/ui/Toast';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import { useConfig } from './context/ConfigContext';

const AppContent = () => {
    const { config, loading } = useConfig();

    if (loading) {
        return <div className="p-8 text-center">Config loading...</div>;
    }

    if (!config) {
        return <div className="p-8 text-center text-red-500">Error while loading config</div>;
    }

    return (
        <BrowserRouter>
            <AuthProvider>
                <TimeEntriesProvider>
                    <ToastProvider>
                        <div className="w-full min-h-screen bg-gray-50">
                            <Toast />
                            <Routes>
                                <Route path="/login" element={<Login />} />
                                <Route
                                    path="/dashboard/*"
                                    element={
                                        <ProtectedRoute>
                                            <Dashboard />
                                        </ProtectedRoute>
                                    }
                                />
                                <Route path="*" element={<Navigate to="/login" replace />} />
                            </Routes>
                        </div>
                    </ToastProvider>
                </TimeEntriesProvider>
            </AuthProvider>
        </BrowserRouter>
    );
};

export default AppContent;
