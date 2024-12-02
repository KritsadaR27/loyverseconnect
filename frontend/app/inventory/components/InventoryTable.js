"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import InventoryTableHeadRow from './InventoryTableHeadRow';
import InventoryTableGroupRow from './InventoryTableGroupRow';
import InventoryTableItemRow from './InventoryTableItemRow';
import InventoryTableFootRow from './InventoryTableFootRow';
import { thClass, tdClass } from '../../../styles/styles'; // นำเข้า styles จาก styles.js



const calculateSum = (items, key) => {
    const sum = items.reduce((acc, item) => acc + (item[key] || 0), 0);
    return sum;
};

const calculateValueSum = (items) => {
    return items.reduce((acc, item) => acc + (item.selling_price * item.in_stock || 0), 0);
};

const InventoryTable = ({ items, storeStocks, showStoreStocks, groupBy, showFriendOrder }) => {


    useEffect(() => {
        if (tableRef.current) {
            const tdCount = tableRef.current.querySelectorAll('td').length;
            console.log(`มี <td> ในตาราง: ${tdCount}`);
        }
    }, []);
    const [isExpanded, setIsExpanded] = useState({});
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

    const expandAllGroups = () => {
        const expandedGroups = Object.keys(items).reduce((acc, group) => {
            acc[group] = true;
            return acc;
        }, {});
        setIsExpanded(expandedGroups);
    };

    const collapseAllGroups = () => {
        const collapsedGroups = Object.keys(items).reduce((acc, group) => {
            acc[group] = false;
            return acc;
        }, {});
        setIsExpanded(collapsedGroups);
    };


    const storeNames = useMemo(() => {
        return Object.values(storeStocks).flat().map(store => store.store_name.replace("ลุงรวย สาขา", ""));
    }, [storeStocks]);

    const uniqueStoreNames = useMemo(() => {
        return [...new Set(storeNames)];
    }, [storeNames]);

    const sortedStoreNames = useMemo(() => {
        return uniqueStoreNames.sort((a, b) => {
            if (a === "โกดังปทุม") return -1;
            if (b === "โกดังปทุม") return 1;
            if (a === "ปทุมธานี") return -1;
            if (b === "ปทุมธานี") return 1;
            if (a === "โรงไก่") return 1;
            if (b === "โรงไก่") return -1;
            return a.localeCompare(b);
        });
    }, [uniqueStoreNames]);

    const itemsArray = useMemo(() => {
        return groupBy ? Object.entries(items) : Object.values(items).flat();
    }, [groupBy, items]);
    // คำนวณความกว้างของ table
    const columnCount = 6 + (showStoreStocks ? sortedStoreNames.length : 0) + (showFriendOrder ? 1 : 0); // จำนวนคอลัมน์ทั้งหมด
    const tableWidth = columnCount * 100; // กำหนดความกว้างของแต่ละคอลัมน์เป็น 150px
    return (
        <div>
            <table ref={tableRef} className="min-w-full bg-white border border-gray-300" style={{ width: `${tableWidth}px` }}>
                <InventoryTableHeadRow
                    thClass={thClass}
                    showStoreStocks={showStoreStocks}
                    sortedStoreNames={sortedStoreNames}
                    showFriendOrder={showFriendOrder}
                    expandAllGroups={expandAllGroups}
                    collapseAllGroups={collapseAllGroups}
                    groupBy={groupBy}
                />
                <tbody>
                    {itemsArray.map((itemOrGroup) => {
                        if (groupBy) {
                            const [group, groupItems] = itemOrGroup;
                            return (
                                <InventoryTableGroupRow
                                    key={group}
                                    group={group}
                                    groupItems={groupItems}
                                    isExpanded={isExpanded}
                                    toggleExpandGroup={toggleExpandGroup}
                                    showStoreStocks={showStoreStocks}
                                    sortedStoreNames={sortedStoreNames}
                                    storeStocks={storeStocks}
                                    showFriendOrder={showFriendOrder}
                                    tdClass={tdClass}
                                />
                            );
                        } else {
                            const item = itemOrGroup;
                            return (
                                <InventoryTableItemRow
                                    key={item.item_id}
                                    item={item}
                                    showStoreStocks={showStoreStocks}
                                    sortedStoreNames={sortedStoreNames}
                                    storeStocks={storeStocks}
                                    showFriendOrder={showFriendOrder}
                                    tdClass={tdClass}
                                />
                            );
                        }
                    })}
                </tbody>
                <InventoryTableFootRow
                    tdClass={tdClass}
                    items={items}
                    showStoreStocks={showStoreStocks}
                    sortedStoreNames={sortedStoreNames}
                    storeStocks={storeStocks}
                    showFriendOrder={showFriendOrder}
                    calculateSum={calculateSum}
                    calculateValueSum={calculateValueSum}
                />
            </table>
        </div>
    );
};

export default React.memo(InventoryTable);