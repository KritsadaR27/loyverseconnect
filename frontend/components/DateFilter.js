import React, { useState, useEffect, useRef } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

const daysOfWeek = ["จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์", "อาทิตย์"];

const DateFilter = ({ label, defaultOption = "", defaultDays = [], onSelectChange, onDaysChange,className }) => {
    const [selectedOption, setSelectedOption] = useState(defaultOption);
    const [selectedDays, setSelectedDays] = useState(defaultDays);
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        console.log("defaultDays updated:", defaultDays); // ตรวจสอบว่า defaultDays ได้รับค่าถูกต้อง

        setSelectedOption(defaultOption);
        setSelectedDays(defaultDays);
    }, [defaultOption, JSON.stringify(defaultDays)]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleOptionChange = (value) => {
        setSelectedOption(value);
        if (value !== 'selectDays' && value !== 'exceptDays') {
            setSelectedDays([]); // Reset selected days when changing option
            setShowDropdown(false); // ปิด dropdown เมื่อเลือกค่า
        }
        if (onSelectChange) onSelectChange(value);
    };

    const toggleDay = (day) => {
        const updatedDays = selectedDays.includes(day)
            ? selectedDays.filter(d => d !== day)
            : [...selectedDays, day];
        setSelectedDays(updatedDays);
        if (onDaysChange) onDaysChange(updatedDays);
    };

    const clearDays = () => {
        setSelectedDays([]);
        if (onDaysChange) onDaysChange([]);
    };

    const selectAllDays = () => {
        setSelectedDays(daysOfWeek);
        if (onDaysChange) onDaysChange(daysOfWeek);
    };

    const toggleDropdown = () => {
        setShowDropdown((prev) => !prev);
    };

    const getButtonLabel = () => {
        switch (selectedOption) {
            case 'daily':
                return 'ทุกวัน';
            case 'selectDays':
                return `เลือกวัน: ${selectedDays.join(', ')}`;
            case 'exceptDays':
                return `ทุกวันยกเว้น: ${selectedDays.join(', ')}`;
            case 'alternateMon':
                return 'วันเว้นวันเริ่มวันจันทร์';
            case 'alternateTue':
                return 'วันเว้นวันเริ่มวันอังคาร';
            default:
                return '-';
        }
    };

    return (
        <div className="max-w-md mx-auto  relative" ref={dropdownRef}>
            {label && (
                <label className="block text-gray-700 font-medium mb-2">{label}</label>
            )}
            <button
                onClick={toggleDropdown}
                className={`flex  w-full  px-4 py-1 text-black rounded border ${selectedOption ? 'bg-blue-100' : 'bg-white'
                    } ${showDropdown ? 'border-2  border-blue-600 box-border ' : 'border-white'} ${className}`}
            >
                <span className="hidden sm:inline flex-1 text-left">
                    {getButtonLabel()}
                </span>
                {showDropdown ? (
                    <ChevronUpIcon className="h-5 w-5 ml-1 inline" />
                ) : (
                    <ChevronDownIcon className="h-5 w-5 ml-1 inline" />
                )}
            </button>

            {showDropdown && (
                <div
                className={`absolute z-30 flex flex-1 bg-white shadow-md border rounded   overflow-y-auto mt-2 overflow-x-auto ${
                    (selectedOption === "selectDays" || selectedOption === "exceptDays") ? "w-[315px]  h-[325px]" : "w-60"
                }`}
                >                    
                    <div className="px-2 py-1 border-b">
                        <button
                            onClick={() => handleOptionChange('daily')}
                            className={`block w-full text-left px-4 py-2 hover:bg-gray-100 ${selectedOption === 'daily' ? 'bg-blue-100' : ''}`}
                        >
                            ทุกวัน
                        </button>
                        <button
                            onClick={() => handleOptionChange('selectDays')}
                            className={`block w-full text-left px-4 py-2 hover:bg-gray-100 ${selectedOption === 'selectDays' ? 'bg-blue-100' : ''}`}
                        >
                            เลือกวัน
                        </button>
                        <button
                            onClick={() => handleOptionChange('exceptDays')}
                            className={`block w-full text-left px-4 py-2 hover:bg-gray-100 ${selectedOption === 'exceptDays' ? 'bg-blue-100' : ''}`}
                        >
                            ทุกวันยกเว้น
                        </button>
                        <button
                            onClick={() => handleOptionChange('alternateMon')}
                            className={`block w-full text-left px-4 py-2 hover:bg-gray-100 ${selectedOption === 'alternateMon' ? 'bg-blue-100' : ''}`}
                        >
                            วันเว้นวันเริ่มวันจันทร์
                        </button>
                        <button
                            onClick={() => handleOptionChange('alternateTue')}
                            className={`block w-full text-left px-4 py-2 hover:bg-gray-100 ${selectedOption === 'alternateTue' ? 'bg-blue-100' : ''}`}
                        >
                            วันเว้นวันเริ่มวันอังคาร
                        </button>
                    </div>
                    {(selectedOption === "selectDays" || selectedOption === "exceptDays") && (
                        <div className="px-2 py-1 border-t absolute right-0 top-0 z-40 border-blue-100 border">
                            {daysOfWeek.map((day) => (
                                <label key={day} className="block px-4 py-2 cursor-pointer hover:bg-gray-100">
                                    <input
                                        type="checkbox"
                                        value={day}
                                        checked={selectedDays.includes(day)}
                                        onChange={() => toggleDay(day)}
                                        className="mr-2"
                                    />
                                    {day}
                                </label>
                            ))}
                            <div className="flex justify-end mt-2">
                                <button
                                    onClick={() => setShowDropdown(false)}
                                    className=" bg-blue-500 text-white rounded hover:bg-blue-700 w-full"
                                >
                                    เลือก
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default DateFilter;
