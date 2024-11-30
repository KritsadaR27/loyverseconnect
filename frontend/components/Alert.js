import React, { useEffect } from 'react';
import { XMarkIcon, CheckCircleIcon, ExclamationCircleIcon, ExclamationTriangleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

const Alert = ({ message, type, onClose, duration = 3000, className = '', title }) => {
    const typeClasses = {
        success: 'bg-green-50 border-green-400 text-green-700',
        error: 'bg-red-50 border-red-400 text-red-700',
        warning: 'bg-yellow-50 border-yellow-400 text-yellow-700',
        info: 'bg-blue-50 border-blue-400 text-blue-700',
    };

    const defaultTitles = {
        success: 'สำเร็จแล้ว!',
        error: 'ต้องมีอะไรผิดพลาดแน่ๆ!',
        warning: 'คำเตือน',
        info: 'ข้อมูล',
    };

    const icons = {
        success: <CheckCircleIcon className="h-10 w-10 text-green-700" />,
        error: <ExclamationCircleIcon className="h-10 w-10 text-red-700" />,
        warning: <ExclamationTriangleIcon className="h-10 w-10 text-yellow-700" />,
        info: <InformationCircleIcon className="h-10 w-10 text-blue-700" />,
    };

    useEffect(() => {
        const timer = setTimeout(onClose, duration);
        return () => clearTimeout(timer);
    }, [onClose, duration]);

    return (
        <div className={`fixed top-4 z-50 left-1/2 transform -translate-x-1/2 border-l-4 p-4 ${typeClasses[type]} ${className}`} role="alert">
            <div className="flex justify-between items-center">
                <div className="flex items-center">
                    {icons[type]}
                    <div className="ml-2">
                        <p className="font-bold">{title || defaultTitles[type]}</p>
                        <p>{message}</p>
                    </div>
                </div>
                <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                    <XMarkIcon className="h-5 w-5" />
                </button>
            </div>
        </div>
    );
};

export default Alert;