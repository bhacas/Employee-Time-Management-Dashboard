import React from 'react';
import { Toaster } from 'sonner';
export const Toast: React.FC = () => {
  return <Toaster position="top-right" toastOptions={{
    style: {
      fontSize: '14px'
    },
    success: {
      style: {
        backgroundColor: '#f0fdf4',
        border: '1px solid #bbf7d0',
        color: '#166534'
      }
    },
    error: {
      style: {
        backgroundColor: '#fef2f2',
        border: '1px solid #fecaca',
        color: '#b91c1c'
      }
    }
  }} />;
};