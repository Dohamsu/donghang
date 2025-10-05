import React, { createContext, useState, useCallback } from 'react';
import AlertModal, { AlertType } from '../components/ui/AlertModal';

interface AlertOptions {
  type?: AlertType;
  title?: string;
  message: string;
  confirmText?: string;
}

interface AlertContextType {
  showAlert: (options: AlertOptions) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
}

export const AlertContext = createContext<AlertContextType | undefined>(
  undefined
);

interface AlertProviderProps {
  children: React.ReactNode;
}

export const AlertProvider: React.FC<AlertProviderProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [alertOptions, setAlertOptions] = useState<AlertOptions>({
    type: 'info',
    message: '',
  });

  const showAlert = useCallback((options: AlertOptions) => {
    setAlertOptions({
      type: options.type || 'info',
      title: options.title,
      message: options.message,
      confirmText: options.confirmText,
    });
    setIsOpen(true);
  }, []);

  const success = useCallback(
    (message: string, title?: string) => {
      showAlert({ type: 'success', message, title });
    },
    [showAlert]
  );

  const error = useCallback(
    (message: string, title?: string) => {
      showAlert({ type: 'error', message, title });
    },
    [showAlert]
  );

  const warning = useCallback(
    (message: string, title?: string) => {
      showAlert({ type: 'warning', message, title });
    },
    [showAlert]
  );

  const info = useCallback(
    (message: string, title?: string) => {
      showAlert({ type: 'info', message, title });
    },
    [showAlert]
  );

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <AlertContext.Provider value={{ showAlert, success, error, warning, info }}>
      {children}
      <AlertModal
        isOpen={isOpen}
        type={alertOptions.type || 'info'}
        title={alertOptions.title}
        message={alertOptions.message}
        confirmText={alertOptions.confirmText}
        onClose={handleClose}
      />
    </AlertContext.Provider>
  );
};
