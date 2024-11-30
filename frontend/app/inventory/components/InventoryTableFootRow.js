"use client";

import React, { useMemo } from "react";
// frontend/app/inventory/components/InventoryTableFootRow.js
import { formatNumber, formatCurrency } from '../../utils/NumberFormat';
import { normalizeStoreName } from '../../utils/StoreName';

const InventoryTableFootRow = ({ tdClass, items, showStoreStocks, sortedStoreNames, storeStocks, showFriendOrder, calculateSum, calculateValueSum }) => {
    const totalInStock = useMemo(() => calculateSum(Object.values(items).flat(), 'in_stock'), [items, calculateSum]);
    const totalValue = useMemo(() => calculateValueSum(Object.values(items).flat()), [items, calculateValueSum]);

    const storeSums = useMemo(() => {
        return sortedStoreNames.reduce((acc, storeName) => {
            acc[storeName] = Object.values(items).flat().reduce((sum, item) => sum + (storeStocks[item.item_id]?.find(store => normalizeStoreName(store.store_name) === storeName)?.in_stock || 0), 0);
            return acc;
        }, {});
    }, [items, sortedStoreNames, storeStocks]);

    const friendOrderSum = useMemo(() => {
        return Object.values(items).flat().reduce((acc, item) => acc + ((storeStocks[item.item_id]?.find(store => normalizeStoreName(store.store_name) === "โกดังปทุม")?.in_stock || 0) + (storeStocks[item.item_id]?.find(store => normalizeStoreName(store.store_name) === "ปทุมธานี")?.in_stock || 0)), 0);
    }, [items, storeStocks]);

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
        <tfoot className="sticky bottom-0 bg-white">
            <tr className="bg-gray-100">
                <td className={`${tdClass} text-left py-2 font-bold`}>รวมทั้งหมด</td>
                <td className={`${tdClass} w-24 text-left py-2 font-bold`}>{formattedTotalInStock}</td>
                {showStoreStocks && sortedStoreNames.map((storeName) => (
                    <td key={storeName} className={`${tdClass} w-24 text-left py-2 font-bold`}>
                        {formattedStoreSums[storeName]}
                    </td>
                ))}
                {showFriendOrder && (
                    <td className={`${tdClass} w-24 text-left py-2 font-bold`}>
                        {formattedFriendOrderSum}
                    </td>
                )}
                <td className={`${tdClass} w-24 text-left py-2 font-bold`}></td>
                <td className={`${tdClass} w-24 text-left py-2 font-bold`}></td>
                <td className={`${tdClass} w-24 text-left py-2 font-bold`}>{formattedTotalValue}</td>
                <td className={`${tdClass} w-48 text-left py-2 font-bold`}></td>
                <td className={`${tdClass} w-36 text-left py-2 font-bold`}></td>
            </tr>
        </tfoot>
    );
};

export default React.memo(InventoryTableFootRow);