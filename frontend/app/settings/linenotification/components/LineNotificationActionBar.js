// frontend/app/settings/linenotification/components/LineNotificationActionBar.js

import React, { memo, useState } from 'react';
import { CloudArrowUpIcon, BellIcon, ArrowLeftIcon, TrashIcon, PlayIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

const LineNotificationActionBar = memo(({ 
    onSave, 
    onTest, 
    onRun,
    onDelete, 
    isLoading, 
    isEdit = false,
    formValid = true
}) => {
    const router = useRouter();
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const handleBack = () => {
        router.push('/settings/linenotification');
    };

    const handleDeleteClick = () => {
        setShowDeleteConfirm(true);
    };

    const handleConfirmDelete = () => {
        onDelete();
        setShowDeleteConfirm(false);
    };

    const handleCancelDelete = () => {
        setShowDeleteConfirm(false);
    };

    return (
        <>
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
                    {isEdit && (
                        <button
                            onClick={handleDeleteClick}
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
                    
                    {isEdit && onRun && (
                        <button
                            onClick={onRun}
                            disabled={isLoading}
                            className={`flex items-center px-4 py-2 rounded font-medium ${
                                isLoading 
                                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                                    : 'bg-purple-500 text-white hover:bg-purple-600 transition duration-200'
                            }`}
                            title="Run this notification now"
                        >
                            <PlayIcon className="h-5 w-5 mr-2" />
                            Run Now
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

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-4">
                        <h3 className="text-xl font-bold mb-4 text-gray-800">Confirm Deletion</h3>
                        <p className="mb-6 text-gray-600">
                            Are you sure you want to delete this notification? This action cannot be undone.
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={handleCancelDelete}
                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmDelete}
                                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
});

LineNotificationActionBar.displayName = 'LineNotificationActionBar';

export default LineNotificationActionBar;