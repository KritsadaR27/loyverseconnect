// frontend/app/sales/monthlycategorysales/components/MonthlyCategorySalesTable.js

import React from 'react';
import { formatNumber, formatCurrency } from '../../../utils/NumberFormat';

const MonthlyCategorySalesTable = ({ salesData, categories, displayMode }) => {
    const thClass = "p-2 font-semibold text-gray-700 text-left bg-gray-100 shadow-md border-r border-gray-300 resize-handle";
    const tdClass = "p-2 border-r border-b border-gray-300 text-gray-700";

    const sortedCategories = [
        "หมูปิ้งนมสด",
        "จัมโบ้",
        "ไส้กรอกหมู",
        "ไส้กรอกข้าว",
        "ไส้กรอกแท่ง",
        "หมูปิ้งโบราณ",
        "หมูทอด",
        "ไก่ปิ้ง",
        "บาร์บีคิว",
        "น้ำจิ้ม",
        "ไส้อั่ว",
        "เนื้อโคขุน",
        "เนื้อริบอาย",
        "แหนม",
        ...categories.filter(category => ![
            "หมูปิ้งนมสด",
            "จัมโบ้",
            "ไส้กรอกหมู",
            "ไส้กรอกข้าว",
            "ไส้กรอกแท่ง",
            "หมูปิ้งโบราณ",
            "หมูทอด",
            "ไก่ปิ้ง",
            "บาร์บีคิว",
            "น้ำจิ้ม",
            "ไส้อั่ว",
            "เนื้อโคขุน",
            "เนื้อริบอาย",
            "แหนม"
        ].includes(category))
    ];

    const categoryTotals = sortedCategories.reduce((totals, category) => {
        totals[category] = Object.values(salesData).reduce(
            (sum, data) => sum + (data[category]?.[displayMode] || 0),
            0
        );
        return totals;
    }, {});

    return (
        <table className="min-w-full bg-white border">
            <thead className="bg-gray-100 shadow-lg sticky top-0 z-10">
                <tr className="border">
                    <th className={`${thClass} w-48`}>เดือน</th>
                    {sortedCategories.map((category) => (
                        <th key={category}>{category}</th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {Object.entries(salesData).map(([month, data]) => (
                    <tr key={month} className="border-b">
                        <td className={`${tdClass} w-96 text-left`}>{month}</td>
                        {sortedCategories.map((category) => (
                            <td key={category} className={`${tdClass} w-48 text-right`}>
                                {displayMode === "sales" || displayMode === "profit"
                                    ? formatCurrency(data[category]?.[displayMode] || 0)
                                    : formatNumber(data[category]?.[displayMode] || 0)}
                            </td>
                        ))}
                    </tr>
                ))}
                <tr className="font-bold bg-gray-100 p-2">
                    <td>รวม</td>
                    {sortedCategories.map((category) => (
                        <td key={category} className='text-right'>
                            {displayMode === "sales" || displayMode === "profit"
                                ? formatCurrency(categoryTotals[category] || 0)
                                : formatNumber(categoryTotals[category] || 0)}
                        </td>
                    ))}
                </tr>
            </tbody>
        </table>
    );
};

export default MonthlyCategorySalesTable;