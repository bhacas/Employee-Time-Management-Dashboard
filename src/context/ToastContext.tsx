import React, { createContext, useContext } from 'react';
import { toast } from 'sonner';
type ToastContextType = {
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
};
const ToastContext = createContext<ToastContextType | undefined>(undefined);
export const ToastProvider: React.FC<{
  children: React.ReactNode;
}> = ({
  children
}) => {
  const showSuccess = (message: string) => {
    toast.success(message);
  };
  const showError = (message: string) => {
    toast.error(message);
  };
  return <ToastContext.Provider value={{
    showSuccess,
    showError
  }}>
      {children}
    </ToastContext.Provider>;
};
export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};