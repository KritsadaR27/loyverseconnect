"use client";

import React, { useState, useEffect, useRef } from "react";
import { ChevronDownIcon, ChevronUpIcon, BarsArrowDownIcon, BarsArrowUpIcon } from '@heroicons/react/24/outline'; // ตรวจสอบการนำเข้าไอคอน


const formatNumber = (number) => {
    return new Intl.NumberFormat('th-TH').format(number);
};

const formatCurrency = (number) => {
    return `฿${new Intl.NumberFormat('th-TH').format(number)}`;
};

const InventoryTable = ({ items, storeStocks, showStoreStocks, groupBy }) => {
    const [isExpanded, setIsExpanded] = useState({});
    const [sumType, setSumType] = useState('sum'); // 'sum' or 'average'
    const tableRef = useRef(null);

    useEffect(() => {
        const expandedGroups = Object.keys(items).reduce((acc, group) => {
            acc[group] = groupBy ? true : false;
            return acc;
        }, {});
        setIsExpanded(expandedGroups);
    }, [groupBy, items]);

    const toggleExpandGroup = (group) => {
        setIsExpanded((prev) => ({
            ...prev,
            [group]: !prev[group],
        }));
    };

    const expandAll = () => {
        const expandedGroups = Object.keys(items).reduce((acc, group) => {
            acc[group] = true;
            return acc;
        }, {});
        setIsExpanded(expandedGroups);
    };

    const collapseAll = () => {
        const collapsedGroups = Object.keys(items).reduce((acc, group) => {
            acc[group] = false;
            return acc;
        }, {});
        setIsExpanded(collapsedGroups);
    };

    const calculateSum = (items, key) => {
        const sum = items.reduce((acc, item) => acc + (item[key] || 0), 0);
        return sumType === 'average' ? sum / items.length : sum;
    };

    const calculateValueSum = (items) => {
        return items.reduce((acc, item) => acc + (item.selling_price * item.in_stock || 0), 0);
    };

    console.log("groupBy value:", groupBy); // ตรวจสอบค่า groupBy

    if (!items || Object.keys(items).length === 0) {
        return <p className="text-center">No items to display.</p>;
    }

    // สร้างรายการชื่อสาขา
    const storeNames = Object.values(storeStocks).flat().map(store => store.store_name.replace("ลุงรวย สาขา", ""));
    const uniqueStoreNames = [...new Set(storeNames)];
    const thClass = "p-2 font-semibold text-gray-700 text-left bg-gray-100 shadow-md backdrop-blur-lg border-r border-gray-300 resize-handle";
    const tdClass = "p-2 border-r border-b border-gray-300 text-gray-700";

    // คำนวณความกว้างของ table
    const columnCount = 6 + (showStoreStocks ? uniqueStoreNames.length : 0); // จำนวนคอลัมน์ทั้งหมด
    const tableWidth = columnCount * 100; // กำหนดความกว้างของแต่ละคอลัมน์เป็น 150px

    return (
        <>
            <table ref={tableRef} className="min-w-full bg-white border border-gray-300" style={{ width: `${tableWidth}px` }}>
                <thead className="bg-gray-100 shadow-lg sticky top-0 z-10">
                    <tr>
                        <th className={`${thClass} w-[360px]`}>
                            {(groupBy === 'category_name' || groupBy === 'supplier_name') && (
                                <>
                                    <button onClick={expandAll} className="mr-1 p-0.5 bg-gray-200  rounded hover:bg-blue-700 hover:text-white active:border-blue-500 active:border" title="เปิดทั้งหมด">
                                        <BarsArrowDownIcon className="h-5 w-5 inline" />
                                    </button>
                                    <button onClick={collapseAll} className="mr-1 p-0.5  bg-gray-200  rounded hover:bg-blue-700 hover:text-white  active:border-blue-500 active:border" title="ปิดทั้งหมด">
                                        <BarsArrowUpIcon className="h-5 w-5 inline" />
                                    </button>
                                </>
                            )}
                            ชื่อสินค้า
                        </th>
                        <th className={`${thClass} w-24`}>รวม</th>
                        {showStoreStocks && uniqueStoreNames.map(storeName => (
                            <th key={storeName} className={`${thClass} w-24 bg-yellow-100`}>{storeName}</th>
                        ))}
                        <th className={`${thClass} w-24`}>ราคาขาย</th>
                        <th className={`${thClass} w-24`}>ต้นทุน</th>
                        <th className={`${thClass} w-24`}>มูลค่าขาย</th>
                        <th className={`${thClass} w-48`}>หมวดหมู่</th>
                        <th className={`${thClass} w-36`}>ผู้จำหน่าย</th>
                    </tr>
                </thead>
                <tbody>
                    {Object.entries(items).map(([group, groupItems]) => (
                        <React.Fragment key={group}>
                            {group && group !== "" && (
                                <tr onClick={() => toggleExpandGroup(group)}>
                                    <td className={`${tdClass} w-[360px] bg-gray-200 text-left py-2 cursor-pointer`}>
                                        {isExpanded[group] ? <ChevronUpIcon className="h-5 w-5 inline" /> : <ChevronDownIcon className="h-5 w-5 inline" />} {group} ({Array.isArray(groupItems) ? groupItems.length : 0})
                                    </td>
                                    <td className={`${tdClass} w-24 bg-gray-200 text-left py-2 text-xs`}>รวม {formatNumber(calculateSum(groupItems, 'in_stock'))}</td>
                                    {showStoreStocks && uniqueStoreNames.map(storeName => (
                                        <td key={storeName} className={`${tdClass} w-24 bg-gray-200 text-left py-2 text-xs`}>
                                            {formatNumber(groupItems.reduce((acc, item) => acc + (storeStocks[item.item_id]?.find(store => store.store_name.replace("ลุงรวย สาขา", "") === storeName)?.in_stock || 0), 0))}
                                        </td>
                                    ))}
                                    <td className={`${tdClass} w-24 bg-gray-200 text-left py-2 text-xs`}></td>
                                    <td className={`${tdClass} w-24 bg-gray-200 text-left py-2 text-xs`}></td>
                                    <td className={`${tdClass} w-24 bg-gray-200 text-left py-2 text-xs`}>{formatCurrency(calculateValueSum(groupItems))}</td>
                                    <td className={`${tdClass} w-48 bg-gray-200 text-left py-2 text-xs`}></td>
                                    <td className={`${tdClass} w-36 bg-gray-200 text-left py-2 text-xs`}></td>
                                </tr>
                            )}
                            {(group === "" || isExpanded[group]) && Array.isArray(groupItems) && groupItems.map((item) => (
                                <tr key={item.item_id}>
                                    <td className={`${tdClass} w-[360px]`}>{item.item_name}</td>
                                    <td className={`${tdClass} w-24`}>{item.in_stock}</td>
                                    {showStoreStocks && uniqueStoreNames.map(storeName => (
                                        <td key={storeName} className="py-2 px-4 border-b border-r border-r-yellow-300 border-dashed text-left w-24 bg-yellow-50">
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
                <tfoot className="sticky bottom-0 bg-white">
                    <tr className="bg-gray-100">
                        <td className={`${tdClass}  text-left py-2 font-bold`}>รวมทั้งหมด</td>
                        <td className={`${tdClass} w-24 text-left py-2 font-bold`}>{formatNumber(calculateSum(Object.values(items).flat(), 'in_stock'))}</td>
                        {showStoreStocks && uniqueStoreNames.map(storeName => (
                            <td key={storeName} className="py-2 px-4 border-b border-r border-dashed text-left w-24 font-bold">
                                {formatNumber(Object.values(items).flat().reduce((acc, item) => acc + (storeStocks[item.item_id]?.find(store => store.store_name.replace("ลุงรวย สาขา", "") === storeName)?.in_stock || 0), 0))}
                            </td>
                        ))}
                        <td className={`${tdClass} w-24 text-left py-2 font-bold`}></td>
                        <td className={`${tdClass} w-24 text-left py-2 font-bold`}></td>
                        <td className={`${tdClass} w-24 text-left py-2 font-bold`}>{formatCurrency(calculateValueSum(Object.values(items).flat()))}</td>
                        <td className={`${tdClass} w-48 text-left py-2 font-bold`}></td>
                        <td className={`${tdClass} w-36 text-left py-2 font-bold`}></td>
                    </tr>
                </tfoot>
            </table >
        </>
    );
};

export default InventoryTable;