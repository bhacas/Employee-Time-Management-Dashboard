import React from 'react';
import { ConfigProvider } from './context/ConfigContext';
import AppContent from './AppContent';

export function App() {
    return (
        <ConfigProvider>
            <AppContent />
        </ConfigProvider>
    );
}
