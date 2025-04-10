// frontend/app/settings/linenotification/components/LineNotificationActionBar.js

import React, { memo } from 'react';
import { CloudArrowUpIcon, BellIcon, ArrowLeftIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

const LineNotificationActionBar = memo(({ 
    onSave, 
    onTest, 
    onDelete, 
    isLoading, 
    isEdit = false,
    formValid = true
}) => {
    const router = useRouter();

    const handleBack = () => {
        router.push('/settings/linenotification');
    };

    return (
        <div className="flex items-center justify-between py-1.5 rounded-md" style={{ maxWidth: '100vw' }}>
            {/* Left section with navigation */}
            <div className="flex items-center space-x-2">
                <button
                    onClick={handleBack}
                    className="flex items-center px-3 py-1.5 rounded font-medium text-gray-600 hover:bg-gray-200 transition duration-200"
                >
                    <ArrowLeftIcon className="h-5 w-5 mr-1" />
                    Back to List
                </button>
            </div>

            {/* Right section with action buttons */}
            <div className="flex space-x-3">
                {isEdit && onDelete && (
                    <button
                        onClick={onDelete}
                        disabled={isLoading}
                        className={`flex items-center px-4 py-2 rounded font-medium ${
                            isLoading 
                                ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                                : 'bg-red-500 text-white hover:bg-red-600 transition duration-200'
                        }`}
                        title="Delete this notification"
                    >
                        <TrashIcon className="h-5 w-5 mr-2" />
                        Delete
                    </button>
                )}
                
                <button
                    onClick={onTest}
                    disabled={isLoading || !formValid}
                    className={`flex items-center px-4 py-2 rounded font-medium ${
                        isLoading || !formValid
                            ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                            : 'bg-blue-500 text-white hover:bg-blue-600 transition duration-200'
                    }`}
                    title={!formValid ? "Please fix validation errors first" : "Send a test notification"}
                >
                    <BellIcon className="h-5 w-5 mr-2" />
                    {isLoading ? 'Testing...' : 'Test Notification'}
                </button>
                
                <button
                    onClick={onSave}
                    disabled={isLoading || !formValid}
                    className={`flex items-center px-4 py-2 rounded font-medium ${
                        isLoading || !formValid
                            ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                            : 'bg-green-500 text-white hover:bg-green-600 transition duration-200'
                    }`}
                    title={!formValid ? "Please fix validation errors first" : "Save notification settings"}
                >
                    <CloudArrowUpIcon className="h-5 w-5 mr-2" />
                    {isLoading ? 'Saving...' : (isEdit ? 'Update' : 'Save Settings')}
                </button>
            </div>
        </div>
    );
});

LineNotificationActionBar.displayName = 'LineNotificationActionBar';

export default LineNotificationActionBar;