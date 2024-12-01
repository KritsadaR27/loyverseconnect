"use client";

import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import DateFilter from './DateFilter';
import MultiSelect from './MultiSelect';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/solid';

const InputField = ({
    type,
    value,
    onChange,
    options,
    formatDateToThai,
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
        onChange(e); // อัปเดตค่าไปยัง props.onChange
    };

    const handleInputTextBlur = () => {
        setIsEditing(false); // ปิดโหมดแก้ไขเมื่อคลิกออก
        if (displayValue === "") setDisplayValue(valueFormatted); // คืนค่าเดิมถ้าไม่มีการแก้ไข
    };

    switch (type) {
        case 'select':
            return (
                <select value={value} onChange={onChange}  className={`border  p-1 ${className}`}>
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
                    onChange={onChange}
                    className={`border  p-1 ${className}`}

                />
            );
        case 'datefilter':
            return (
                <DateFilter
                    defaultOption={value}
                    defaultDays={selectedDays}
                    onSelectChange={onSelectChange}
                    onDaysChange={onDaysChange}
                    className={className}

                />
            );
        case 'multiselect':
            return (
                <MultiSelect
                    title={className}
                    items={options.map(option => ({ name: option }))}
                    selectedItems={selectedDays}
                    toggleItem={onDaysChange}
                    onClear={() => onDaysChange([])}
                    onSelectAll={() => onDaysChange(options)}
                    className={className}

                />
            );
        case 'text':
        default:
            return (
                <input
                    type="text"
                    value={value}
                    onChange={onChange}
                    readOnly={readOnly}
                    className={`border  p-1 ${className}`}

                />
            );
    }
};

export default InputField;
