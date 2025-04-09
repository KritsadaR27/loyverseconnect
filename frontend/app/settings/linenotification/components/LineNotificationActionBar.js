// frontend/app/settings/linenotification/components/LineNotificationActionBar.js

import React from 'react';
import { CloudArrowUpIcon, BellIcon } from '@heroicons/react/24/outline';

const LineNotificationActionBar = ({ onSave, onTest, isLoading }) => {
    return (
        <div className="flex items-center justify-between py-1.5 rounded-md" style={{ maxWidth: '100vw' }}>
            {/* Left section with buttons */}
            <div className="flex space-x-4">
                <button
                    onClick={onSave}
                    disabled={isLoading}
                    className={`flex items-center px-4 py-2 rounded font-medium ${
                        isLoading 
                            ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                            : 'bg-green-500 text-white hover:bg-green-600 transition duration-200'
                    }`}
                >
                    <CloudArrowUpIcon className="h-5 w-5 mr-2" />
                    {isLoading ? 'Saving...' : 'Save Settings'}
                </button>
                
                <button
                    onClick={onTest}
                    disabled={isLoading}
                    className={`flex items-center px-4 py-2 rounded font-medium ${
                        isLoading 
                            ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                            : 'bg-blue-500 text-white hover:bg-blue-600 transition duration-200'
                    }`}
                >
                    <BellIcon className="h-5 w-5 mr-2" />
                    {isLoading ? 'Testing...' : 'Test Notification'}
                </button>
            </div>
        </div>
    );
};

export default LineNotificationActionBar;