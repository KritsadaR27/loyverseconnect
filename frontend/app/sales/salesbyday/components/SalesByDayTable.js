// frontend/app/sales/salesbyday/components/SalesByDayTable.js

import React from 'react';
import { formatNumber } from '../../../utils/NumberFormat';

const SalesByDayTable = ({ pivotData }) => {
    const thClass = "p-2 font-semibold text-gray-700 text-left bg-gray-100 shadow-md border-r border-gray-300 resize-handle";
    const tdClass = "p-2 border-r border-b border-gray-300 text-gray-700";

    const columnCount = pivotData.dates ? pivotData.dates.length + 1 : 1;
    const tableWidth = (columnCount - 1) * 150 + 350; // คำนวณความกว้างของ table

    return (
        <div style={{ maxHeight: '100vh', overflowY: 'auto' }}>
            <table className="min-w-full bg-white border-black table-fixed" style={{ width: `${tableWidth}px` }}>
                <thead className="bg-gray-100 shadow-lg sticky top-0 z-10">
                    <tr>
                        <th className={`${thClass} w-48`}>สินค้า</th>
                        {pivotData.dates &&
                            pivotData.dates.map((date) => (
                                <th key={date} className={`${thClass} w-48`}>
                                    {new Date(date).toLocaleDateString("th-TH", {
                                        weekday: "short",
                                        day: "2-digit",
                                        month: "2-digit",
                                        year: "numeric",
                                    })}
                                </th>
                            ))}
                    </tr>
                </thead>
                <tbody>
                    {pivotData.items &&
                        pivotData.items.map((item) => (
                            <tr key={item.item_name}>
                                <td className={`${tdClass} w-48`}>{item.item_name}</td>
                                {pivotData.dates.map((date) => (
                                    <td key={date} className={`${tdClass} w-48 text-center`}>
                                        {formatNumber(item[date] || 0)}
                                    </td>
                                ))}
                            </tr>
                        ))}
                </tbody>
            </table>
        </div>
    );
};

export default SalesByDayTable;