import React, { useState, useEffect } from 'react';
import { PlusIcon, TrashIcon, ChevronUpIcon, ChevronDownIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

// Predefined cron schedules with user-friendly labels
const CRON_PRESETS = [
    { label: 'ทุกวัน 8 โมงเช้า', value: '0 0 8 * * *', description: 'Sends notification daily at 8:00 AM' },
    { label: 'ทุกวัน เที่ยง', value: '0 0 12 * * *', description: 'Sends notification daily at 12:00 PM' },
    { label: 'ทุกวัน 6 โมงเย็น', value: '0 0 18 * * *', description: 'Sends notification daily at 6:00 PM' },
    { label: 'Every weekday at 8:00 AM', value: '0 0 8 * * 1-5', description: 'Sends notification Monday-Friday at 8:00 AM' },
    { label: 'Every hour', value: '0 0 * * * *', description: 'Sends notification at the start of every hour' },
    { label: 'Custom schedule', value: 'custom', description: 'Enter a custom cron expression' }
];

const ScheduleConfigurationSection = ({ config, setConfig, showScheduleSection, setShowScheduleSection }) => {
    const [selectedPreset, setSelectedPreset] = useState('custom');
    const [showCronHelp, setShowCronHelp] = useState(false);

    // Initialize the selected preset based on the current schedule
    useEffect(() => {
        const matchingPreset = CRON_PRESETS.find(preset => preset.value === config.schedule);
        if (matchingPreset) {
            setSelectedPreset(matchingPreset.value);
        } else {
            setSelectedPreset('custom');
        }
    }, [config.schedule]);

    const handlePresetChange = (e) => {
        const value = e.target.value;
        setSelectedPreset(value);
        
        if (value !== 'custom') {
            setConfig(prev => ({ ...prev, schedule: value }));
            
            // If it's a daily schedule, also update the notification time to match
            if (value.includes('* * *')) {
                const match = value.match(/^(\d+) (\d+) (\d+) \* \* \*/);
                if (match) {
                    const [_, seconds, minutes, hours] = match;
                    const timeStr = `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
                    setConfig(prev => ({
                        ...prev,
                        notificationTimes: [timeStr]
                    }));
                }
            }
        }
    };

    const handleCustomCronChange = (e) => {
        setConfig(prev => ({ ...prev, schedule: e.target.value }));
    };

    // Handle time change including updating the cron expression if it's a daily schedule
    const handleTimeChange = (index, value) => {
        const newTimes = [...config.notificationTimes];
        newTimes[index] = value;
        
        // Update the cron expression for the first time
        if (index === 0) {
            const [hours, minutes] = value.split(':');
            
            // Make sure we use the 6-field cron format (with seconds)
            const newCron = `0 ${minutes} ${hours} * * *`;
            
            setConfig(prev => ({
                ...prev,
                notificationTimes: newTimes,
                schedule: newCron
            }));
        } else {
            setConfig(prev => ({
                ...prev,
                notificationTimes: newTimes
            }));
        }
    };

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

    // Parse a cron expression to get a human-readable description
    const getCronDescription = (cronExpression) => {
        if (!cronExpression) return "No schedule set";
        
        const parts = cronExpression.split(" ");
        
        // Handle 6-field cron (with seconds)
        if (parts.length === 6) {
            const [seconds, minutes, hours, dayOfMonth, month, dayOfWeek] = parts;
            
            if (seconds === "0" && minutes !== "*" && hours !== "*" && dayOfMonth === "*" && month === "*" && dayOfWeek === "*") {
                return `Daily at ${hours}:${minutes.padStart(2, '0')}`;
            } else if (seconds === "0" && minutes !== "*" && hours !== "*" && dayOfMonth === "*" && month === "*" && dayOfWeek !== "*") {
                if (dayOfWeek === "1-5") {
                    return `Weekdays at ${hours}:${minutes.padStart(2, '0')}`;
                } else {
                    return `On days ${dayOfWeek} at ${hours}:${minutes.padStart(2, '0')}`;
                }
            }
        } 
        // Handle 5-field cron (standard)
        else if (parts.length === 5) {
            const [minutes, hours, dayOfMonth, month, dayOfWeek] = parts;
            
            if (minutes !== "*" && hours !== "*" && dayOfMonth === "*" && month === "*" && dayOfWeek === "*") {
                return `Daily at ${hours}:${minutes.padStart(2, '0')}`;
            } else if (minutes !== "*" && hours !== "*" && dayOfMonth === "*" && month === "*" && dayOfWeek !== "*") {
                if (dayOfWeek === "1-5") {
                    return `Weekdays at ${hours}:${minutes.padStart(2, '0')}`;
                } else {
                    return `On days ${dayOfWeek} at ${hours}:${minutes.padStart(2, '0')}`;
                }
            }
        }
        
        return cronExpression;
    };

    // Ensure cron expression is valid with 6 fields
    const validateCronExpression = (cron) => {
        if (!cron) return false;
        
        const parts = cron.split(" ");
        
        // If we have 5 fields, add the leading '0' for seconds
        if (parts.length === 5) {
            return `0 ${cron}`;
        }
        
        // If we have 6 fields, return as-is
        if (parts.length === 6) {
            return cron;
        }
        
        // Otherwise, default to a valid expression
        return '0 0 0 * * *';
    };

    return (
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
                            Schedule Type
                        </label>
                        
                        <select
                            value={selectedPreset}
                            onChange={handlePresetChange}
                            className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            {CRON_PRESETS.map(preset => (
                                <option key={preset.value} value={preset.value}>
                                    {preset.label} {preset.value !== 'custom' ? `(${preset.value})` : ''}
                                </option>
                            ))}
                        </select>
                        
                        <p className="text-sm text-gray-500 mt-1">
                            {CRON_PRESETS.find(p => p.value === selectedPreset)?.description || "Choose when to send notifications"}
                        </p>
                    </div>
                    
                    {selectedPreset === 'custom' && (
                        <div className="mb-4">
                            <div className="flex items-center justify-between">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Custom Cron Expression
                                </label>
                                <button
                                    type="button"
                                    onClick={() => setShowCronHelp(!showCronHelp)}
                                    className="text-blue-500 hover:text-blue-700 flex items-center"
                                >
                                    <InformationCircleIcon className="h-5 w-5 mr-1" />
                                    Help
                                </button>
                            </div>
                            
                            <input
                                type="text"
                                value={config.schedule || ''}
                                onChange={handleCustomCronChange}
                                className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="0 0 9 * * *"
                            />
                            
                            <div className="text-sm text-gray-500 mt-1">
                                Current schedule: <span className="font-medium">{getCronDescription(config.schedule)}</span>
                            </div>
                            
                            {showCronHelp && (
                                <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                                    <h4 className="font-semibold text-blue-800 mb-1">Cron Expression Format (6-field)</h4>
                                    <p className="text-sm text-gray-600 mb-2">
                                        <code className="bg-gray-100 px-1 rounded">seconds minutes hours day-of-month month day-of-week</code>
                                    </p>
                                    <ul className="text-sm text-gray-600 list-disc pl-5 space-y-1">
                                        <li><code className="bg-gray-100 px-1 rounded">0 0 9 * * *</code> = Every day at 9:00 AM</li>
                                        <li><code className="bg-gray-100 px-1 rounded">0 0 9 * * 1-5</code> = Every weekday at 9:00 AM</li>
                                        <li><code className="bg-gray-100 px-1 rounded">0 0 */2 * * *</code> = Every 2 hours</li>
                                        <li><code className="bg-gray-100 px-1 rounded">0 0 9 * * 1,3,5</code> = Monday, Wednesday, Friday at 9:00 AM</li>
                                    </ul>
                                    <div className="mt-2 text-sm font-medium text-red-600">
                                        <p>Important: This system requires 6-field cron format with seconds!</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                    
                    <div>
                        <h3 className="text-md font-semibold mb-2 text-gray-700">
                            Notification Times
                        </h3>
                        <p className="text-sm text-gray-500 mb-2">
                            {selectedPreset !== 'custom' 
                                ? "This time will be used when sending notifications on the schedule above" 
                                : "If your schedule triggers multiple times a day, these are the specific times when notifications will be sent"}
                        </p>
                        <div className="space-y-2">
                            {(config.notificationTimes || []).map((time, index) => (
                                <div key={index} className="flex items-center space-x-2">
                                    <input
                                        type="time"
                                        value={time}
                                        onChange={(e) => handleTimeChange(index, e.target.value)}
                                        className="border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                    {config.notificationTimes.length > 1 && (
                                        <button 
                                            onClick={() => handleRemoveTime(index)}
                                            className="text-red-500 hover:text-red-700"
                                            title="Remove this time"
                                        >
                                            <TrashIcon className="h-5 w-5" />
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button
                                onClick={handleAddTime}
                                className="flex items-center text-blue-500 hover:text-blue-700"
                            >
                                <PlusIcon className="h-5 w-5 mr-1" />
                                Add Another Time
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default ScheduleConfigurationSection;