import React, { useEffect } from 'react';
import { Button } from './';

export type AlertType = 'success' | 'error' | 'warning' | 'info';

interface AlertModalProps {
  isOpen: boolean;
  type: AlertType;
  title?: string;
  message: string;
  onClose: () => void;
  confirmText?: string;
}

const AlertModal: React.FC<AlertModalProps> = ({
  isOpen,
  type,
  title,
  message,
  onClose,
  confirmText = '확인',
}) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          icon: '✅',
          iconBg: 'bg-green-100',
          iconColor: 'text-trip-success',
          borderColor: 'border-green-200',
        };
      case 'error':
        return {
          icon: '❌',
          iconBg: 'bg-red-100',
          iconColor: 'text-trip-error',
          borderColor: 'border-red-200',
        };
      case 'warning':
        return {
          icon: '⚠️',
          iconBg: 'bg-yellow-100',
          iconColor: 'text-trip-warning',
          borderColor: 'border-yellow-200',
        };
      case 'info':
        return {
          icon: 'ℹ️',
          iconBg: 'bg-blue-100',
          iconColor: 'text-trip-primary',
          borderColor: 'border-blue-200',
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />

        {/* Modal panel */}
        <div className="relative inline-block w-full max-w-md transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:align-middle">
          {/* Content */}
          <div className="px-6 py-5">
            <div className="flex items-start space-x-4">
              {/* Icon */}
              <div
                className={`flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full ${styles.iconBg}`}
              >
                <span className="text-2xl">{styles.icon}</span>
              </div>

              {/* Text content */}
              <div className="flex-1">
                {title && (
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {title}
                  </h3>
                )}
                <p className="text-sm text-gray-600 whitespace-pre-wrap">
                  {message}
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 flex justify-end">
            <Button onClick={onClose} size="sm">
              {confirmText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertModal;
