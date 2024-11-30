"use client";

import React, { useMemo } from "react";
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
// frontend/app/inventory/components/InventoryTableGroupRow.js
import { formatNumber, formatCurrency } from '../../utils/NumberFormat';
import { normalizeStoreName, calculateStoreSum } from '../../utils/StoreName';


const InventoryTableGroupRow = React.memo(({ group, groupItems, isExpanded, toggleExpandGroup, showStoreStocks, sortedStoreNames, storeStocks, showFriendOrder, tdClass }) => {
    const totalInStock = useMemo(() => groupItems.reduce((acc, item) => acc + (item.in_stock || 0), 0), [groupItems]);

    const storeSums = useMemo(() => {
        return sortedStoreNames.reduce((acc, storeName) => {
            acc[storeName] = calculateStoreSum(groupItems, storeName, storeStocks);
            return acc;
        }, {});
    }, [groupItems, sortedStoreNames, storeStocks]);

    const friendOrderSum = useMemo(() => {
        return groupItems.reduce((acc, item) => acc + ((storeStocks[item.item_id]?.find(store => normalizeStoreName(store.store_name) === "โกดังปทุม")?.in_stock || 0) + (storeStocks[item.item_id]?.find(store => normalizeStoreName(store.store_name) === "ปทุมธานี")?.in_stock || 0)), 0);
    }, [groupItems, storeStocks]);

    const totalValue = useMemo(() => {
        return groupItems.reduce((acc, item) => acc + (item.selling_price * item.in_stock || 0), 0);
    }, [groupItems]);

    const formattedTotalInStock = useMemo(() => formatNumber(totalInStock), [totalInStock]);
    const formattedTotalValue = useMemo(() => formatCurrency(totalValue), [totalValue]);
    const formattedStoreSums = useMemo(() => {
        return Object.keys(storeSums).reduce((acc, storeName) => {
            acc[storeName] = formatNumber(storeSums[storeName]);
            return acc;
        }, {});
    }, [storeSums]);
    const formattedFriendOrderSum = useMemo(() => formatNumber(friendOrderSum), [friendOrderSum]);

    return (
        <>
            {group && group !== "" && (
                <tr onClick={() => toggleExpandGroup(group)}>
                    <td className={`${tdClass} w-[360px] bg-gray-200 text-left py-2 cursor-pointer`}>
                        {isExpanded[group] ? <ChevronUpIcon className="h-5 w-5 inline" /> : <ChevronDownIcon className="h-5 w-5 inline" />} {group} ({Array.isArray(groupItems) ? groupItems.length : 0})
                    </td>
                    <td className={`${tdClass} w-24 bg-gray-200  text-right py-2 text-xs`}>รวม {formattedTotalInStock}</td>
                    {showStoreStocks && sortedStoreNames.map((storeName) => (
                        <React.Fragment key={storeName}>
                            <td className={`${tdClass} w-24 bg-gray-200  text-right  py-2 text-xs`}>
                                {formattedStoreSums[storeName]}
                            </td>
                            {showFriendOrder && storeName === "ปทุมธานี" && (
                                <td className={`${tdClass} w-24 bg-gray-200  text-right py-2 text-xs`}>
                                    {formattedFriendOrderSum}
                                </td>
                            )}
                        </React.Fragment>
                    ))}
                    <td className={`${tdClass} w-24 bg-gray-200 py-2 text-xs`}></td>
                    <td className={`${tdClass} w-24 bg-gray-200 py-2 text-xs`}></td>
                    <td className={`${tdClass} w-24 bg-gray-200  text-right py-2 text-xs`}>{formattedTotalValue}</td>
                    <td className={`${tdClass} w-48 bg-gray-200 py-2 text-xs`}></td>
                    <td className={`${tdClass} w-36 bg-gray-200 py-2 text-xs`}></td>
                </tr>
            )}
            {isExpanded[group] && groupItems.map((item) => (
                <tr key={item.item_id}>
                    <td className={`${tdClass} w-[360px] text-left py-2`}>{item.item_name}</td>
                    <td className={`${tdClass} w-24  text-right py-2 `}>{formatNumber(item.in_stock)}</td>
                    {showStoreStocks && sortedStoreNames.map((storeName) => (
                        <React.Fragment key={storeName}>
                            <td className={`${tdClass} w-24  text-right py-2 `}>
                                {formatNumber(storeStocks[item.item_id]?.find(store => normalizeStoreName(store.store_name) === storeName)?.in_stock || 0)}
                            </td>
                            {showFriendOrder && storeName === "ปทุมธานี" && (
                                <td className={`${tdClass} w-24  text-right py-2 `}>
                                    {formatNumber((storeStocks[item.item_id]?.find(store => normalizeStoreName(store.store_name) === "โกดังปทุม")?.in_stock || 0) + (storeStocks[item.item_id]?.find(store => normalizeStoreName(store.store_name) === "ปทุมธานี")?.in_stock || 0))}
                                </td>
                            )}
                        </React.Fragment>
                    ))}
                    <td className={`${tdClass} w-24 text-right py-2 `}>{formatCurrency(item.selling_price)}</td>
                    <td className={`${tdClass} w-24 text-right py-2 `}>{formatCurrency(item.cost)}</td>
                    <td className={`${tdClass} w-24 text-right py-2 `}>{formatCurrency(item.selling_price * item.in_stock)}</td>
                    <td className={`${tdClass} w-48 text-left py-2 `}>{item.category_name}</td>
                    <td className={`${tdClass} w-36 text-left py-2 `}>{item.supplier_name}</td>
                </tr>
            ))}
        </>
    );
});

export default InventoryTableGroupRow;