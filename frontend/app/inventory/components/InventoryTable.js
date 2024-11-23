"use client";

import React, { useState, useEffect } from "react";
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

const formatNumber = (number) => {
    return new Intl.NumberFormat('th-TH').format(number);
};

const formatCurrency = (number) => {
    return `฿${new Intl.NumberFormat('th-TH').format(number)}`;
};

const InventoryTable = ({ items, storeStocks, showStoreStocks }) => {
    const [isExpanded, setIsExpanded] = useState({});

    useEffect(() => {
        console.log("Items:", items);
        console.log("Store Stocks:", storeStocks);
    }, [items, storeStocks]);

    const toggleExpandGroup = (group) => {
        setIsExpanded((prev) => ({
            ...prev,
            [group]: !prev[group],
        }));
    };

    if (!items || Object.keys(items).length === 0) {
        return <p className="text-center">No items to display.</p>;
    }

    // สร้างรายการชื่อสาขา
    const storeNames = Object.values(storeStocks).flat().map(store => store.store_name.replace("ลุงรวย สาขา", ""));
    const uniqueStoreNames = [...new Set(storeNames)];
    const thClass = "p-2  font-semibold text-gray-700 text-left bg-gray-100 shadow-md backdrop-blur-lg";
    const tdClass = "p-2 border-r border-b text-gray-700";
    return (
        <table className="min-w-full bg-white border border-gray-300 ">
            <thead className="bg-gray-100 shadow-lg   sticky top-0 z-10 ">
                <tr>
                    <th className={`${thClass} w-96`}>ชื่อสินค้า</th>
                    <th className={`${thClass} w-24`}>รวม</th>
                    {showStoreStocks && uniqueStoreNames.map(storeName => (
                        <th key={storeName} className={`${thClass} w-24 bg-yellow-100`}>{storeName}</th>
                    ))}
                    <th className={`${thClass} w-24`}>ราคาขาย</th>
                    <th className={`${thClass} w-24`}>ต้นทุน</th>
                    <th className={`${thClass} w-24`}>มูลค่าขาย</th>
                    <th className={`${thClass} w-24`}>หมวดหมู่</th>
                    <th className={`${thClass} w-24`}>ผู้จำหน่าย</th>
                </tr>
            </thead>
            <tbody>
                {Object.entries(items).map(([group, groupItems]) => (
                    <React.Fragment key={group}>
                        {group && group !== "" && (
                            <tr onClick={() => toggleExpandGroup(group)}>
                                <td colSpan={8 + (showStoreStocks ? uniqueStoreNames.length : 0)} className="bg-gray-200 text-left py-2 cursor-pointer">
                                    {isExpanded[group] ? <ChevronUpIcon className="h-5 w-5 inline" /> : <ChevronDownIcon className="h-5 w-5 inline" />} {group} ({Array.isArray(groupItems) ? groupItems.length : 0})
                                </td>
                            </tr>
                        )}
                        {(group === "" || isExpanded[group]) && Array.isArray(groupItems) && groupItems.map((item) => (
                            <tr key={item.item_id}>
                                <td className={`${tdClass} w-108`}>{item.item_name}</td>
                                <td className={`${tdClass} w-24`}>{item.in_stock}</td>
                                {showStoreStocks && uniqueStoreNames.map(storeName => (
                                    <td key={storeName} className="py-2 px-4 border-b  border-r border-r-yellow-300 border-dashed text-left w-24 bg-yellow-50">
                                        {storeStocks[item.item_id] && storeStocks[item.item_id].find(store => store.store_name.replace("ลุงรวย สาขา", "") === storeName)?.in_stock || 0}
                                    </td>
                                ))}
                                <td className={`${tdClass} w-24`}>{formatCurrency(item.selling_price)}</td>
                                <td className={`${tdClass} w-24`}>{formatCurrency(item.cost)}</td>
                                <td className={`${tdClass} w-24`}>{formatCurrency(item.selling_price * item.in_stock)}</td>
                                <td className={`${tdClass} w-48`}>{item.category_name}</td>
                                <td className={`${tdClass} w-36`}>{item.supplier_name}</td>
                            </tr>
                        ))}
                    </React.Fragment>
                ))}
            </tbody>
        </table>

    );
};

export default InventoryTable;