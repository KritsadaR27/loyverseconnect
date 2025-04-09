// frontend/app/settings/linenotification/components/LineNotificationForm.js

import React, { useState } from 'react';
import { PlusIcon, TrashIcon, ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import MultiSelect from '../../../../components/MultiSelect';

const LineNotificationForm = ({ 
    config, 
    setConfig, 
    tableOptions, 
    viewOptions, 
    groupOptions,
    fieldOptions 
}) => {
    const [showFieldsSection, setShowFieldsSection] = useState(true);
    const [showScheduleSection, setShowScheduleSection] = useState(true);
    
    // Handle multi-select for notification times
    const handleAddTime = () => {
        setConfig(prev => ({
            ...prev,
            notificationTimes: [...prev.notificationTimes, "12:00"]
        }));
    };

    const handleRemoveTime = (index) => {
        setConfig(prev => ({
            ...prev,
            notificationTimes: prev.notificationTimes.filter((_, i) => i !== index)
        }));
    };

    const handleTimeChange = (index, value) => {
        setConfig(prev => {
            const newTimes = [...prev.notificationTimes];
            newTimes[index] = value;
            return {
                ...prev,
                notificationTimes: newTimes
            };
        });
    };

    // Handle field toggles for bubbles
    const handleFieldToggle = (field) => {
        setConfig(prev => {
            const currentFields = prev.bubbleFields || [];
            const newFields = currentFields.includes(field)
                ? currentFields.filter(f => f !== field)
                : [...currentFields, field];
                
            return {
                ...prev,
                bubbleFields: newFields
            };
        });
    };

    // Handle table selection
    const handleTableChange = (e) => {
        setConfig({
            ...config,
            tableID: e.target.value,
            viewName: '' // Reset view when table changes
        });
    };

    // Handle view selection
    const handleViewChange = (e) => {
        setConfig({
            ...config,
            viewName: e.target.value
        });
    };

    // Handle group selection
    const handleGroupToggle = (groupId) => {
        setConfig(prev => {
            const currentGroups = prev.groupIDs || [];
            const newGroups = currentGroups.includes(groupId)
                ? currentGroups.filter(g => g !== groupId)
                : [...currentGroups, groupId];
                
            return {
                ...prev,
                groupIDs: newGroups
            };
        });
    };

    // Clear all selections for a multi-select
    const handleClearGroups = () => {
        setConfig({
            ...config,
            groupIDs: []
        });
    };

    // Select all options for a multi-select
    const handleSelectAllGroups = () => {
        setConfig({
            ...config,
            groupIDs: groupOptions.map(group => group.id)
        });
    };

    // Handle bubble toggle
    const handleBubbleToggle = (e) => {
        setConfig({
            ...config,
            enableBubbles: e.target.checked
        });
    };

    return (
        <div className="p-6 max-w-4xl mx-auto bg-white rounded-lg shadow">
            {/* Data Source Section */}
            <div className="mb-8">
                <h2 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">
                    Data Source Configuration
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Table Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Select Airtable
                        </label>
                        <select
                            value={config.tableID}
                            onChange={handleTableChange}
                            className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">Select a table</option>
                            {tableOptions.map(table => (
                                <option key={table.id} value={table.id}>
                                    {table.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    
                    {/* View Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Select View
                        </label>
                        <select
                            value={config.viewName}
                            onChange={handleViewChange}
                            className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                            disabled={!config.tableID || viewOptions.length === 0}
                        >
                            <option value="">Select a view</option>
                            {viewOptions.map(view => (
                                <option key={view.id} value={view.id}>
                                    {view.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>
            
            {/* Group Selection */}
            <div className="mb-8">
                <h2 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">
                    LINE Group Selection
                </h2>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Select LINE Groups to Notify
                    </label>
                    <div className="w-full mb-4">
                        <MultiSelect
                            title="LINE Groups"
                            items={groupOptions.map(group => ({ name: group.id }))}
                            selectedItems={config.groupIDs}
                            toggleItem={handleGroupToggle}
                            onClear={handleClearGroups}
                            onSelectAll={handleSelectAllGroups}
                            context="form"
                        />
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mt-2">
                        {config.groupIDs.map(groupId => {
                            const groupName = groupOptions.find(g => g.id === groupId)?.name || groupId;
                            return (
                                <span key={groupId} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center">
                                    {groupName}
                                    <button 
                                        onClick={() => handleGroupToggle(groupId)}
                                        className="ml-2 text-blue-600 hover:text-blue-800"
                                    >
                                        <TrashIcon className="h-4 w-4" />
                                    </button>
                                </span>
                            );
                        })}
                    </div>
                </div>
            </div>
            
            {/* Header Template Section */}
            <div className="mb-8">
                <h2 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">
                    Message Template
                </h2>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Header Template
                    </label>
                    <input
                        type="text"
                        value={config.headerTemplate}
                        onChange={(e) => setConfig({...config, headerTemplate: e.target.value})}
                        className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter header template"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                        You can use placeholders: %s for day of week, %s for date, %d for number of records
                    </p>
                </div>
            </div>
            
            {/* Bubble Configuration */}
            <div className="mb-8">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2 flex-1">
                        Bubble Configuration
                    </h2>
                    <button 
                        onClick={() => setShowFieldsSection(!showFieldsSection)}
                        className="text-blue-500 hover:text-blue-700"
                    >
                        {showFieldsSection ? 
                            <ChevronUpIcon className="h-5 w-5" /> : 
                            <ChevronDownIcon className="h-5 w-5" />
                        }
                    </button>
                </div>
                
                <div className="mb-4">
                    <label className="flex items-center">
                        <input
                            type="checkbox"
                            checked={config.enableBubbles}
                            onChange={handleBubbleToggle}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">Enable Bubbles (Send each record separately)</span>
                    </label>
                </div>
                
                {showFieldsSection && config.enableBubbles && (
                    <div>
                        <h3 className="text-md font-semibold mb-2 text-gray-700">
                            Select Fields to Include in Bubbles
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {fieldOptions.map(field => (
                                <label key={field.id} className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={config.bubbleFields.includes(field.id)}
                                        onChange={() => handleFieldToggle(field.id)}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <span className="ml-2 text-sm text-gray-700">{field.name}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            
            {/* Schedule Configuration */}
            <div className="mb-8">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2 flex-1">
                        Schedule Configuration
                    </h2>
                    <button 
                        onClick={() => setShowScheduleSection(!showScheduleSection)}
                        className="text-blue-500 hover:text-blue-700"
                    >
                        {showScheduleSection ? 
                            <ChevronUpIcon className="h-5 w-5" /> : 
                            <ChevronDownIcon className="h-5 w-5" />
                        }
                    </button>
                </div>
                
                {showScheduleSection && (
                    <div>
                        <h3 className="text-md font-semibold mb-2 text-gray-700">
                            Notification Times
                        </h3>
                        <div className="space-y-2">
                            {config.notificationTimes.map((time, index) => (
                                <div key={index} className="flex items-center space-x-2">
                                    <input
                                        type="time"
                                        value={time}
                                        onChange={(e) => handleTimeChange(index, e.target.value)}
                                        className="border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                    <button 
                                        onClick={() => handleRemoveTime(index)}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        <TrashIcon className="h-5 w-5" />
                                    </button>
                                </div>
                            ))}
                            <button
                                onClick={handleAddTime}
                                className="flex items-center text-blue-500 hover:text-blue-700"
                            >
                                <PlusIcon className="h-5 w-5 mr-1" />
                                Add Time
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LineNotificationForm;