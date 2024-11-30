"use client";

import React, { useMemo } from "react";
// frontend/app/inventory/components/InventoryTableItemRow.js
import { formatNumber, formatCurrency } from '../../utils/NumberFormat';
import { normalizeStoreName } from '../../utils/StoreName';

const InventoryTableItemRow = React.memo(({ item, showStoreStocks, sortedStoreNames, storeStocks, showFriendOrder, tdClass }) => {
    const formattedInStock = useMemo(() => formatNumber(item.in_stock), [item.in_stock]);
    const formattedSellingPrice = useMemo(() => formatCurrency(item.selling_price), [item.selling_price]);
    const formattedCostPrice = useMemo(() => formatCurrency(item.cost), [item.cost]);
    const formattedTotalValue = useMemo(() => formatCurrency(item.selling_price * item.in_stock), [item.selling_price, item.in_stock]);

    const storeSums = useMemo(() => {
        return sortedStoreNames.reduce((acc, storeName) => {
            acc[storeName] = formatNumber(storeStocks[item.item_id]?.find(store => normalizeStoreName(store.store_name) === storeName)?.in_stock || 0);
            return acc;
        }, {});
    }, [sortedStoreNames, storeStocks, item.item_id]);

    const friendOrderSum = useMemo(() => {
        return formatNumber((storeStocks[item.item_id]?.find(store => normalizeStoreName(store.store_name) === "โกดังปทุม")?.in_stock || 0) + (storeStocks[item.item_id]?.find(store => normalizeStoreName(store.store_name) === "ปทุมธานี")?.in_stock || 0));
    }, [storeStocks, item.item_id]);

    return (
        <tr key={item.item_id}>
            <td className={`${tdClass} w-[360px] text-left py-2`}>{item.item_name}</td>
            <td className={`${tdClass} w-24  text-right py-2`}>{formattedInStock}</td>
            {showStoreStocks && sortedStoreNames.map((storeName) => (
                <td key={storeName} className={`${tdClass} w-24  text-right py-2`}>
                    {storeSums[storeName]}
                </td>
            ))}
            {showFriendOrder && (
                <td className={`${tdClass} w-24  text-right py-2`}>
                    {friendOrderSum}
                </td>
            )}
            <td className={`${tdClass} w-24  text-right py-2`}>{formattedSellingPrice}</td>
            <td className={`${tdClass} w-24  text-right py-2`}>{formattedCostPrice}</td>
            <td className={`${tdClass} w-24  text-right py-2`}>{formattedTotalValue}</td>
            <td className={`${tdClass} w-48 text-left py-2`}>{item.category_name}</td>
            <td className={`${tdClass} w-36 text-left py-2`}>{item.supplier_name}</td>
        </tr>
    );
});

export default InventoryTableItemRow;