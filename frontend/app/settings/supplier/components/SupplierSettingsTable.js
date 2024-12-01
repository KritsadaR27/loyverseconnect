"use client";

import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import DateFilter from '../../../../components/DateFilter';
import DraggableTable from '../../../../components/DraggableTable';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
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
    className // เพิ่ม prop สำหรับ className
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
                        onKeyDown={handleInputTextKeyDown} // เริ่มการแก้ไขเมื่อพิมพ์ครั้งแรก
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
        case 'button':
            return (
                <button onClick={onClick} className={className}>
                    {icon && <span className="mr-2">{icon}</span>}
                    {value}
                </button>
            );
        case 'create-time':
        case 'last-update-time':
        case 'create-by':
        case 'last-update-by':
            return <span>{valueFormatted}</span>;
        default:
            return <input type="text" value={valueFormatted} onChange={onChange} className="border rounded p-1" />;
    }
};

const SupplierSettingsTable = ({ suppliers, groupedItems, expandedItems, toggleExpand, handleInputChange, handleFocus, handleBlur, inputRefs, highlightedSupplierId }) => {
    const mapSupplierToColumns = (supplier) => [
        {
            type: 'text',
            label: 'supplier_name',
            value: supplier.supplier_name || "ไม่ระบุ",
            className: 'p-2 border w-48',
        },
        {
            type: 'datefilter',
            label: 'order_cycle',
            value: supplier.order_cycle,
            dateCycle: supplier.order_cycle,
            selectedDays: supplier.selected_days,
            onSelectChange: (value) => handleInputChange(supplier.supplier_id, 'order_cycle', value),
            onDaysChange: (days) => handleInputChange(supplier.supplier_id, 'selected_days', days),
            className: 'w-96',
        },
        {
            type: 'number',
            label: 'sort_order',
            value: supplier.sort_order || 0,
            onChange: (e) => handleInputChange(supplier.supplier_id, 'sort_order', e.target.value),
            onFocus: () => handleFocus(supplier.supplier_id),
            onBlur: handleBlur,
            className: `p-2 border w-96 ${highlightedSupplierId === supplier.supplier_id ? 'border-blue-500 bg-yellow-100' : 'border-gray-300'} rounded w-full`,
        }
    ];

    return (
        <DndProvider backend={HTML5Backend}>
            <DraggableTable
                headers={['ชื่อซัพพลายเออร์', 'รอบการสั่งซื้อ', 'ลำดับ', 'รายการสินค้า']}
                items={suppliers}
                mapItemToColumns={mapSupplierToColumns}
                onMoveItem={(from, to) => console.log(`Moved from ${from} to ${to}`)}
                expandedItems={expandedItems}
                toggleExpand={toggleExpand}
                expandedContent={(supplier) => (
                    <table className="bg-yellow-100 w-full">
                        <thead>
                            <tr>
                                <th className="py-2 px-4 text-left">ชื่อสินค้า</th>
                                <th className="py-2 px-4 text-left">ชื่อเรียกผู้ขาย</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(groupedItems[supplier.supplier_id] || []).map(item => (
                                <tr key={`${supplier.supplier_id}-${item.item_id}`} className="py-1 border-b">
                                    <td className="py-2 px-4">{item.item_name}</td>
                                    <td className="py-2 px-4">{item.item_supplier_call}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            />
        </DndProvider>
    );
};

export default SupplierSettingsTable;