"use client";

import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import DateFilter from './DateFilter';
import MultiSelect from './MultiSelect';
import { ChevronDownIcon, ChevronUpIcon, CheckIcon, XMarkIcon, LinkIcon, PhoneIcon, MapPinIcon } from '@heroicons/react/24/solid';
import { inputInGridClass, selectInGridClass, buttonInGridClass, gridHoverClass } from '../styles/styles'; // นำเข้า styles จาก styles.js
import { formatDateToThai } from '../app/utils/dateUtils'; // นำเข้า formatDateToThai จาก dateUtils.js

const GridInputField = ({
    type,
    value,
    onChange,
    options,
    dateCycle,
    selectedDays,
    onSelectChange,
    onDaysChange,
    icon, // เพิ่ม prop สำหรับไอคอน
    onClick, // เพิ่ม prop สำหรับ onClick
    className, // เพิ่ม prop สำหรับ className
    readOnly // เพิ่ม prop สำหรับ readOnly
}) => {
    const valueFormatted = value instanceof Date ? formatDateToThai(value) : value;

    const [isEditing, setIsEditing] = useState(false); // ใช้สำหรับ inputtext เท่านั้น
    const [displayValue, setDisplayValue] = useState(valueFormatted); // ใช้สำหรับการแสดงผล inputtext ก่อนแก้ไข
    const [clearOnType, setClearOnType] = useState(false); // ลบค่าเมื่อเริ่มพิมพ์ครั้งแรก

    const handleInputTextClick = () => {
        setIsEditing(false); // แค่แสดงกรอบเท่านั้น
        setClearOnType(true); // เตรียมลบค่าเมื่อเริ่มพิมพ์
    };

    const handleInputTextKeyDown = () => {
        if (clearOnType) {
            setIsEditing(true); // เข้าสู่โหมดการแก้ไขจริง
            setDisplayValue(""); // ลบค่าเดิม
            setClearOnType(false); // ปิดการเคลียร์หลังจากพิมพ์ครั้งแรก
        }
    };

    const handleInputTextChange = (e) => {
        setDisplayValue(e.target.value); // อัปเดตค่าทุกครั้งที่พิมพ์
        onChange(e.target.value); // อัปเดตค่าไปยัง props.onChange
    };

    const handleInputTextBlur = () => {
        setIsEditing(false); // ปิดโหมดแก้ไขเมื่อคลิกออก
        if (displayValue === "") setDisplayValue(valueFormatted); // คืนค่าเดิมถ้าไม่มีการแก้ไข
    };

    switch (type) {
        case 'select':
            return (
                <select value={value} onChange={(e) => onChange(e.target.value)} className={`border p-1 ${className}`}>
                    {options.map((option, index) => (
                        <option key={index} value={option}>
                            {option}
                        </option>
                    ))}
                </select>
            );
        case 'number':
            return (
                <input
                    type="number"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className={`${className} ${inputInGridClass}`}
                />
            );
        case 'datefilter':
            return (
                <DateFilter
                    defaultOption={value}
                    defaultDays={selectedDays}
                    onSelectChange={onSelectChange}
                    onDaysChange={onDaysChange}
                    className={`${className} ${selectInGridClass}`}
                />
            );
        case 'datepicker':
            return (
                <DatePicker
                    selected={value}
                    onChange={onChange}
                    className={`${className} ${selectInGridClass}`}
                    dateFormat="dd/MM/yyyy"
                />
            );
        case 'multiselect':
            return (
                <MultiSelect
                    title={className}
                    items={options.map(option => ({ name: option }))}
                    selectedItems={value}
                    toggleItem={onChange}
                    onClear={() => onChange([])}
                    onSelectAll={() => onChange(options)}
                    className={`${className} ${selectInGridClass}`}
                    context="grid"
                />
            );
        case 'boolean':
            return (
                <div className={`flex items-center justify-center ${className} ${gridHoverClass}`}>
                    <button onClick={() => onChange(!value)} className={`p-1 rounded-full ${value ? 'bg-green-500' : 'bg-gray-200'}`}>
                        {value ? <CheckIcon className="h-4 w-4 text-white" /> : <XMarkIcon className="h-4 w-4 text-white" />}
                    </button>
                </div>
            );
        case 'link':
            return (
                <div className={`flex items-center ${className}`}>
                    <a href={value} target="_blank" rel="noopener noreferrer">
                        <LinkIcon className="h-5 w-5 mx-2 hover:text-blue-500" />
                    </a>
                    <input
                        type="text"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        className={`${className} ${inputInGridClass}`}
                    />
                </div>
            );
        case 'phone':
            return (
                <div className={`flex items-center ${className}`}>
                    <a href={`tel:${value}`}>
                        <PhoneIcon className="h-5 w-5 mx-2 hover:text-blue-500" />
                    </a>
                    <input
                        type="text"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        className={`${className} ${inputInGridClass}`}
                    />
                </div>
            );
        case 'location':
            return (
                <div className={`flex items-center ${className}`}>
                    <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(value)}`} target="_blank" rel="noopener noreferrer">
                        <MapPinIcon className="h-5 w-5 mx-2 hover:text-blue-500" />
                    </a>
                    <input
                        type="text"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        className={`${className} ${inputInGridClass}`}
                    />
                </div>
            );
        case 'text':
        default:
            return (
                <input
                    type="text"
                    value={displayValue}
                    onChange={handleInputTextChange}
                    onClick={handleInputTextClick}
                    onKeyDown={handleInputTextKeyDown}
                    onBlur={handleInputTextBlur}
                    readOnly={readOnly}
                    className={`${className} ${inputInGridClass}`}
                />
            );
    }
};

export default GridInputField;
