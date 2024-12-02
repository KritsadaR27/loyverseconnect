"use client";

import React from "react";
import { BarsArrowDownIcon, BarsArrowUpIcon } from '@heroicons/react/24/outline';

const InventoryTableHeadRow = ({ thClass, showStoreStocks, sortedStoreNames, showFriendOrder, expandAllGroups, collapseAllGroups, groupBy }) => (
    <thead className="bg-gray-100 shadow-lg sticky top-0 z-10">
        <tr>
            <th className={`${thClass} w-[360px]`}>
                {(groupBy === 'category_name' || groupBy === 'supplier_name') && (
                    <>
                        <button onClick={expandAllGroups} className="mr-1 p-0.5 bg-gray-200 rounded hover:bg-blue-700 hover:text-white active:border-blue-500 active:border" title="เปิดทั้งหมด">
                            <BarsArrowDownIcon className="h-5 w-5 inline" />
                        </button>
                        <button onClick={collapseAllGroups} className="mr-1 p-0.5 bg-gray-200 rounded hover:bg-blue-700 hover:text-white active:border-blue-500 active:border" title="ปิดทั้งหมด">
                            <BarsArrowUpIcon className="h-5 w-5 inline" />
                        </button>
                    </>
                )}
                ชื่อสินค้า
            </th>
            <th className={`${thClass} w-24`}>รวม</th>
            {showStoreStocks && sortedStoreNames.map((storeName) => (
                <React.Fragment key={storeName}>
                    <th className={` w-24 bg-yellow-300 ${thClass}`} style={{ backgroundColor: 'rgb(253, 224, 71)' }}>{storeName}</th>
                    {showFriendOrder && storeName === "ปทุมธานี" && (
                        <th className={` w-24 bg-pink-500  text-white ${thClass}`} style={{ backgroundColor: 'rgb(249, 168, 212)', color: 'rgb(100, 50, 70)' }}>โกดัง+ปทุม</th>
                    )}
                </React.Fragment>
            ))} 
            <th className={`${thClass} w-24`}>ราคาขาย</th>
            <th className={`${thClass} w-24`}>ต้นทุน</th>
            <th className={`${thClass} w-24`}>มูลค่าขาย</th>
            <th className={`${thClass} w-48`}>หมวดหมู่</th>
            <th className={`${thClass} w-36`}>ผู้จำหน่าย</th>
        </tr>
    </thead>
);

export default React.memo(InventoryTableHeadRow);
