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
    fieldOptions,
    isEdit = false
}) => {
    const [showFieldsSection, setShowFieldsSection] = useState(true);
    const [showScheduleSection, setShowScheduleSection] = useState(true);
    const [validationErrors, setValidationErrors] = useState({});
    
    // Validate inputs
    const validateField = (name, value) => {
        const errors = {...validationErrors};
        
        switch(name) {
            case 'name':
                if (!value || value.trim() === '') {
                    errors.name = 'Notification name is required';
                } else {
                    delete errors.name;
                }
                break;
            case 'tableID':
                if (!value) {
                    errors.tableID = 'Airtable selection is required';
                } else {
                    delete errors.tableID;
                }
                break;
            case 'viewName':
                if (!value) {
                    errors.viewName = 'View selection is required';
                } else {
                    delete errors.viewName;
                }
                break;
            case 'fields':
                if (!value || value.length === 0) {
                    errors.fields = 'At least one field must be selected';
                } else {
                    delete errors.fields;
                }
                break;
            case 'messageTemplate':
                if (!config.enableBubbles && (!value || value.trim() === '')) {
                    errors.messageTemplate = 'Message template is required for non-bubble notifications';
                } else {
                    delete errors.messageTemplate;
                }
                break;
            case 'groupIDs':
                if (!value || value.length === 0) {
                    errors.groupIDs = 'At least one LINE group must be selected';
                } else {
                    delete errors.groupIDs;
                }
                break;
            default:
                break;
        }
        
        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };
    
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

    // Handle input change with validation
    const handleInputChange = (name, value) => {
        setConfig(prev => ({
            ...prev,
            [name]: value
        }));
        
        validateField(name, value);
    };

    // Handle field toggles for bubbles
    const handleFieldToggle = (field) => {
        const currentFields = config.fields || [];
        const newFields = currentFields.includes(field)
            ? currentFields.filter(f => f !== field)
            : [...currentFields, field];
            
        handleInputChange('fields', newFields);
    };

    // Handle table selection
    const handleTableChange = (e) => {
        const value = e.target.value;
        setConfig(prev => ({
            ...prev,
            tableID: value,
            viewName: '' // Reset view when table changes
        }));
        
        validateField('tableID', value);
    };

    // Handle view selection
    const handleViewChange = (e) => {
        const value = e.target.value;
        handleInputChange('viewName', value);
    };

    // Handle group selection
    const handleGroupToggle = (groupId) => {
        const currentGroups = config.groupIDs || [];
        const newGroups = currentGroups.includes(groupId)
            ? currentGroups.filter(g => g !== groupId)
            : [...currentGroups, groupId];
            
        handleInputChange('groupIDs', newGroups);
    };

    // Clear all selections for a multi-select
    const handleClearGroups = () => {
        setConfig(prev => ({
            ...prev,
            groupIDs: []
        }));
        
        validateField('groupIDs', []);
    };

    // Select all options for a multi-select
    const handleSelectAllGroups = () => {
        const allGroupIds = groupOptions.map(group => group.id);
        setConfig(prev => ({
            ...prev,
            groupIDs: allGroupIds
        }));
        
        validateField('groupIDs', allGroupIds);
    };

    // Handle bubble toggle
    const handleBubbleToggle = (e) => {
        const checked = e.target.checked;
        setConfig(prev => ({
            ...prev,
            enableBubbles: checked
        }));
        
        // If turning off bubbles, validate message template
        if (!checked) {
            validateField('messageTemplate', config.messageTemplate);
        }
    };

    // Handle schedule change
    const handleScheduleChange = (e) => {
        handleInputChange('schedule', e.target.value);
    };

    return (
        <div className="p-6 max-w-4xl mx-auto bg-white rounded-lg shadow">
            {/* Notification Name */}
            <div className="mb-8">
                <h2 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">
                    Notification Details
                </h2>
                
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Notification Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={config.name || ''}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className={`w-full border rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 ${
                            validationErrors.name ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter a name for this notification"
                        required
                    />
                    {validationErrors.name && (
                        <p className="text-red-500 text-sm mt-1">{validationErrors.name}</p>
                    )}
                </div>
                
                <div className="mb-4">
                    <label className="flex items-center">
                        <input
                            type="checkbox"
                            checked={config.active}
                            onChange={(e) => handleInputChange('active', e.target.checked)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">Active (Enable this notification)</span>
                    </label>
                </div>
            </div>
            
            {/* Data Source Section */}
            <div className="mb-8">
                <h2 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">
                    Data Source Configuration
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Table Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Select Airtable <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={config.tableID || ''}
                            onChange={handleTableChange}
                            className={`w-full border rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 ${
                                validationErrors.tableID ? 'border-red-500' : 'border-gray-300'
                            }`}
                        >
                            <option value="">Select a table</option>
                            {tableOptions.map(table => (
                                <option key={table.id} value={table.id}>
                                    {table.name}
                                </option>
                            ))}
                        </select>
                        {validationErrors.tableID && (
                            <p className="text-red-500 text-sm mt-1">{validationErrors.tableID}</p>
                        )}
                    </div>
                    
                    {/* View Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Select View <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={config.viewName || ''}
                            onChange={handleViewChange}
                            className={`w-full border rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 ${
                                validationErrors.viewName ? 'border-red-500' : 'border-gray-300'
                            }`}
                            disabled={!config.tableID || viewOptions.length === 0}
                        >
                            <option value="">Select a view</option>
                            {viewOptions.map(view => (
                                <option key={view.id} value={view.id}>
                                    {view.name}
                                </option>
                            ))}
                        </select>
                        {validationErrors.viewName && (
                            <p className="text-red-500 text-sm mt-1">{validationErrors.viewName}</p>
                        )}
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
                        Select LINE Groups to Notify <span className="text-red-500">*</span>
                    </label>
                    <div className={`w-full mb-4 ${validationErrors.groupIDs ? 'border-red-500' : ''}`}>
                        <MultiSelect
                            title="LINE Groups"
                            items={groupOptions.map(group => ({ name: group.name, id: group.id }))}
                            selectedItems={config.groupIDs || []}
                            toggleItem={handleGroupToggle}
                            onClear={handleClearGroups}
                            onSelectAll={handleSelectAllGroups}
                            context="form"
                        />
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mt-2">
                        {(config.groupIDs || []).map(groupId => {
                            const group = groupOptions.find(g => g.id === groupId);
                            const groupName = group ? group.name : groupId;
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
                    {validationErrors.groupIDs && (
                        <p className="text-red-500 text-sm mt-1">{validationErrors.groupIDs}</p>
                    )}
                </div>
            </div>
            
            {/* Message Formatting Section */}
            <div className="mb-8">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2 flex-1">
                        Message Formatting
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
                
                {config.enableBubbles && (
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Header Template
                        </label>
                        <input
                            type="text"
                            value={config.headerTemplate || ''}
                            onChange={(e) => handleInputChange('headerTemplate', e.target.value)}
                            className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="วันนี้ %s %s มีจัดส่ง %d กล่อง"
                        />
                        <p className="text-sm text-gray-500 mt-1">
                            You can use placeholders: %s for day of week, %s for date, %d for number of records
                        </p>
                    </div>
                )}

                {!config.enableBubbles && (
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Message Template <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={config.messageTemplate || ''}
                            onChange={(e) => handleInputChange('messageTemplate', e.target.value)}
                            className={`w-full border rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 ${
                                validationErrors.messageTemplate ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="🚨 รายการสินค้าใกล้หมด {{.Count}} รายการ:
{{range .Records}}• {{.Name}} เหลือ {{.Quantity}} (ขั้นต่ำ {{.MinimumLevel}})
{{end}}"
                            rows="6"
                        ></textarea>
                        <p className="text-sm text-gray-500 mt-1">
                            You can use Go templates with .Records, .Count, .Date, .Time
                        </p>
                        {validationErrors.messageTemplate && (
                            <p className="text-red-500 text-sm mt-1">{validationErrors.messageTemplate}</p>
                        )}
                    </div>
                )}
                
                {showFieldsSection && (
                    <div>
                        <h3 className="text-md font-semibold mb-2 text-gray-700">
                            Select Fields to Include <span className="text-red-500">*</span>
                        </h3>
                        <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${
                            validationErrors.fields ? 'border border-red-500 p-2 rounded' : ''
                        }`}>
                            {fieldOptions.map(field => (
                                <label key={field.id} className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={(config.fields || []).includes(field.id)}
                                        onChange={() => handleFieldToggle(field.id)}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <span className="ml-2 text-sm text-gray-700">{field.name}</span>
                                </label>
                            ))}
                        </div>
                        {validationErrors.fields && (
                            <p className="text-red-500 text-sm mt-1">{validationErrors.fields}</p>
                        )}
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
                    <>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Cron Schedule
                            </label>
                            <input
                                type="text"
                                value={config.schedule || ''}
                                onChange={handleScheduleChange}
                                className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="0 9 * * *"
                            />
                            <p className="text-sm text-gray-500 mt-1">
                                Format: minute hour day_of_month month day_of_week (e.g., "0 9 * * *" for every day at 9:00 AM)
                            </p>
                        </div>
                        
                        <div>
                            <h3 className="text-md font-semibold mb-2 text-gray-700">
                                Notification Times
                            </h3>
                            <div className="space-y-2">
                                {(config.notificationTimes || []).map((time, index) => (
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
                    </>
                )}
            </div>
        </div>
    );
};

export default LineNotificationForm;