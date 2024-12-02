import React, { useState, useEffect, useRef } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

const daysOfWeek = ["วันอาทิตย์", "วันจันทร์", "วันอังคาร", "วันพุธ", "วันพฤหัสบดี", "วันศุกร์", "วันเสาร์"];
const dayColors = {
    "วันอาทิตย์": "bg-red-200 text-red-800 bg-opacity-50",
    "วันจันทร์": "bg-yellow-200 text-yellow-800 bg-opacity-50",
    "วันอังคาร": "bg-pink-200 text-pink-800 bg-opacity-50",
    "วันพุธ": "bg-green-200 text-green-800 bg-opacity-50",
    "วันพฤหัสบดี": "bg-orange-200 text-orange-800 bg-opacity-50",
    "วันศุกร์": "bg-blue-200 text-blue-800 bg-opacity-50",
    "วันเสาร์": "bg-purple-200 text-purple-800 bg-opacity-50",
};

const DateFilter = ({ label, defaultOption = "", defaultDays = [], onSelectChange, onDaysChange, className }) => {
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
                return (<span  className="rounded bg-green-200 mr-2 px-2 py-1  text-green-800 text-sm font-bold">ทุกวัน</span>) ;
                case 'selectDays':
                    return (
                        <>
                            <span className="rounded bg-green-200 mr-2 px-2 py-1  text-green-800 text-sm font-bold">เลือกวัน :</span>
                            {selectedDays.map(day => (
                            <span key={day} className={`inline-block px-2 py-1 mr-1 rounded-full text-xs font-medium ${dayColors[day]}`}>
                                {day}
                            </span>
                            ))}
                        </>
                    );
                case 'exceptDays':
                    return (
                        <>
                            <span  className="rounded bg-green-200 mr-2 px-2 py-1   text-green-800 text-sm font-bold">ทุกวันยกเว้น :</span> 
                            {selectedDays.map(day => (
                            <span key={day} className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${dayColors[day]}`}>
                                {day}
                            </span>
                            ))}
                        </>
                    );
            case 'alternateMon':
                return (<span  className="rounded bg-green-200 mr-2 px-2 py-1   text-green-800 text-sm font-bold">วันเว้นวันเริ่มวันจันทร์</span>) ;
            case 'alternateTue':
                return (<span  className="rounded bg-green-200 mr-2 px-2 py-1   text-green-800 text-sm font-bold">วันเว้นวันเริ่มวันอังคาร</span>) ;
            default:
                return (
                    <span className="italic text-gray-300 text-xs"> เลือกรอบวัน </span>
                );
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {label && (
                <label className="block text-gray-700 font-medium mb-2">{label}</label>
            )}
            <button
                onClick={toggleDropdown}
                className={`flex w-full px-4 
                     text-black    h-8  py-1 
                     ${showDropdown ? 'border-2 rounded border-blue-500 group-hover:border-blue-500' : ''} ${className}
                    `}
                     
            >
                <span className="hidden sm:inline flex-1 text-left">
                    {getButtonLabel()}
                </span>
                {showDropdown ? (
                    <ChevronUpIcon className="h-4 w-4 ml-1  inline text-blue-500" />
                ) : (
                    <ChevronDownIcon className="h-4 w-4 ml-1 mt-1 inline " />
                )}
            </button>

            {showDropdown && (
                <div
                    className={`absolute z-30 flex flex-1 bg-white shadow-md border rounded overflow-y-auto mt-0 overflow-x-auto ${
                        (selectedOption === "selectDays" || selectedOption === "exceptDays") ? "w-[309px] h-[325px]" : "w-[200px]"
                    }`}
                >
                    <div className="border-b">
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
                        <div className=" absolute -right-[0px] top-0 z-40 border-blue-200 border-l pb-2">
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
                                    className="bg-blue-500 text-white rounded hover:bg-blue-700 w-5/6 mx-auto "
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
