"use client";

import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import DateFilter from './DateFilter';

const InputField = ({
    type,
    value,
    onChange,
    options,
    formatDateToThai,
    dateCycle,
    selectedDays,
    onSelectChange,
    onDaysChange
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
      // ฟังก์ชันสำหรับเริ่มการแก้ไขจริงเมื่อกดคีย์พิมพ์ครั้งแรก
      const handleKeyDown = (e) => {
        if (clearOnType) {
            setIsEditing(true); // เข้าสู่โหมดการแก้ไขจริงเมื่อเริ่มพิมพ์
            setValue(""); // เคลียร์ค่าเมื่อเริ่มพิมพ์ครั้งแรก
            setClearOnType(false); // ปิดการเคลียร์หลังจากเริ่มพิมพ์
        } else if (e.key === "Enter") {
            disableEditing(); // ปิดโหมดแก้ไขเมื่อกด Enter
        }
    };

    switch (type) {
        case 'datepicker':
            return (
                <DatePicker
                    selected={value}
                    onChange={onChange}
                    dateFormat="dd/MM/yyyy"
                    className="border rounded p-2"
                    placeholderText="เลือกวันที่"
                />
            );
        case 'datefilter':
            return (
                <DateFilter
                    dateCycle={dateCycle}
                    selectedDays={selectedDays}
                    onSelectChange={onSelectChange}
                    onDaysChange={onDaysChange}
                />
            );
        case 'inputtext':
            return (
                isEditing ? (
                    <input
                        type="text"
                        value={displayValue}
                        onChange={handleInputTextChange}
                        onBlur={handleInputTextBlur}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") handleInputTextBlur();
                            else handleInputTextKeyDown();
                        }}
                        autoFocus
                        className="border rounded p-1"
                    />
                ) : (
                    <span
                        onClick={handleInputTextClick}
                        onKeyDown={handleKeyDown} // เริ่มการแก้ไขเมื่อพิมพ์ครั้งแรก

                        tabIndex={0}
                        style={{
                            display: "inline-block",
                            padding: "10px",
                            border: "1px solid blue",
                            cursor: "pointer",
                        }}
                    >
                        {displayValue}
                    </span>
                )
            );
        case 'single-select':
            return (
                <select value={value} onChange={onChange} className="border rounded p-1">
                    {options.map((option, index) => (
                        <option key={index} value={option}>
                            {option}
                        </option>
                    ))}
                </select>
            );
        case 'longtext':
            return <textarea value={valueFormatted} onChange={onChange} className="border rounded p-1 w-full" />;
        case 'multiple-select':
            return (
                <select multiple value={value} onChange={onChange} className="border rounded p-1">
                    {options.map((option, index) => (
                        <option key={index} value={option}>
                            {option}
                        </option>
                    ))}
                </select>
            );
        case 'checkbox':
            return <input type="checkbox" checked={value} onChange={(e) => onChange(e.target.checked)} />;
        case 'create-time':
        case 'last-update-time':
        case 'create-by':
        case 'last-update-by':
            return <span>{valueFormatted}</span>;
        case 'phone':
        case 'location':
        case 'user':
        case 'barcode':
        case 'qr-code':
        case 'url':
            return <input type={type === 'phone' ? 'tel' : 'text'} value={value} onChange={onChange} className="border rounded p-1" />;
        case 'auto-number':
            return <input type="text" value={valueFormatted} readOnly className="border rounded p-1" />;
        default:
            return <input type="text" value={valueFormatted} onChange={onChange} className="border rounded p-1" />;
    }
};

export default InputField;
