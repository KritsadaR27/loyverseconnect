// components/Alert.js
import React, { useEffect, useState } from 'react';
import { CheckCircleIcon, ExclamationIcon, XCircleIcon, InformationCircleIcon, XIcon } from '@heroicons/react/outline';

// Set a consistent duration for auto-dismissing alerts (in milliseconds)
const AUTO_DISMISS_DURATION = 5000; // 5 seconds

const Alert = ({ message, type = 'info', description, onClose, autoDismiss = true }) => {
  const [isVisible, setIsVisible] = useState(true);
  
  // Auto-dismiss the alert after duration
  useEffect(() => {
    if (autoDismiss && isVisible) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        if (onClose) onClose();
      }, AUTO_DISMISS_DURATION);
      
      return () => clearTimeout(timer);
    }
  }, [autoDismiss, isVisible, onClose]);
  
  // Handle manual close
  const handleClose = () => {
    setIsVisible(false);
    if (onClose) onClose();
  };
  
  // Don't render if not visible
  if (!isVisible) return null;
  
  // Determine the appropriate styles and icon based on the alert type
  const getAlertStyles = () => {
    switch (type) {
      case 'success':
        return {
          bgColor: 'bg-green-50',
          borderColor: 'border-green-400',
          textColor: 'text-green-800',
          icon: <CheckCircleIcon className="h-5 w-5 text-green-400" />,
        };
      case 'error':
        return {
          bgColor: 'bg-red-50',
          borderColor: 'border-red-400',
          textColor: 'text-red-800',
          icon: <XCircleIcon className="h-5 w-5 text-red-400" />,
        };
      case 'warning':
        return {
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-400',
          textColor: 'text-yellow-800',
          icon: <ExclamationIcon className="h-5 w-5 text-yellow-400" />,
        };
      case 'info':
      default:
        return {
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-400',
          textColor: 'text-blue-800',
          icon: <InformationCircleIcon className="h-5 w-5 text-blue-400" />,
        };
    }
  };
  
  const { bgColor, borderColor, textColor, icon } = getAlertStyles();
  
  return (
    <div className={`rounded-md p-4 ${bgColor} border ${borderColor} mb-4`} role="alert">
      <div className="flex">
        <div className="flex-shrink-0 mr-3">{icon}</div>
        <div className="flex-1">
          <h3 className={`text-sm font-medium ${textColor}`}>{message}</h3>
          {description && (
            <div className={`mt-2 text-sm ${textColor} opacity-90`}>
              <p>{description}</p>
            </div>
          )}
        </div>
        <div className="ml-auto pl-3">
          <div className="-mx-1.5 -my-1.5">
            <button
              type="button"
              onClick={handleClose}
              className={`inline-flex rounded-md p-1.5 ${textColor} hover:bg-opacity-20 hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-${bgColor} focus:ring-${borderColor}`}
            >
              <span className="sr-only">Dismiss</span>
              <XIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Alert;