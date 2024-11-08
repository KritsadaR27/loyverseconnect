import React, { useState, useEffect } from 'react';
import './DateFilter.css';

const daysOfWeek = ["จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์", "อาทิตย์"];

const DateFilter = ({ label, defaultOption = "", defaultDays = [], onSelectChange, onDaysChange }) => {
    const [selectedOption, setSelectedOption] = useState(defaultOption);
    const [selectedDays, setSelectedDays] = useState(defaultDays);

    useEffect(() => {
        setSelectedOption(defaultOption);
        setSelectedDays(defaultDays);
    }, [defaultOption, JSON.stringify(defaultDays)]);

    const handleOptionChange = (e) => {
        const value = e.target.value;
        setSelectedOption(value);
        setSelectedDays([]); // Reset selected days when changing option
        if (onSelectChange) onSelectChange(value);
    };

    const handleDaysChange = (e) => {
        const value = e.target.value;
        const updatedDays = selectedDays.includes(value)
            ? selectedDays.filter(day => day !== value)
            : [...selectedDays, value];
        setSelectedDays(updatedDays);
        if (onDaysChange) onDaysChange(updatedDays);
    };

    return (
        <div className="max-w-md mx-auto p-4">
            {label && (
                <label className="block text-gray-700 font-medium mb-2">{label}</label>
            )}
            <select
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring"
                value={selectedOption}
                onChange={handleOptionChange}
            >
                <option value="">เลือก...</option>
                <option value="daily">ทุกวัน</option>
                <option value="selectDays">เลือกวัน</option>
                <option value="exceptDays">ทุกวันยกเว้น</option>
                <option value="alternateMon">วันเว้นวันเริ่มวันจันทร์</option>
                <option value="alternateTue">วันเว้นวันเริ่มวันอังคาร</option>
            </select>

            {(selectedOption === "selectDays" || selectedOption === "exceptDays") && (
                <div className="mt-4">
                    <label className="block text-gray-700 font-medium mb-2">
                        {selectedOption === "selectDays" ? "เลือกวัน:" : "ทุกวันยกเว้น:"}
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                        {daysOfWeek.map((day) => (
                            <label key={day} className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    value={day}
                                    checked={selectedDays.includes(day)}
                                    onChange={handleDaysChange}
                                    className={`custom-checkbox ${selectedOption === "exceptDays" ? "except-checkbox" : ""}`}
                                />
                                <span className="text-gray-700">{day}</span>
                            </label>
                        ))}
                    </div>
                </div>
        )}
        </div>
    );
};

export default DateFilter;
