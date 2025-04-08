// src/app/inventory/page.js
export const dynamic = 'force-dynamic';

import React from "react";
import ClientInventoryPage from "./ClientInventoryPage";
import { fetchItemsStockData, fetchMasterData } from "./../api/inventoryService";

import './IventoryCss.css'; // นำเข้าไฟล์ CSS

const InventoryPage = async () => {
    try {
        const [itemsStockData, masterData] = await Promise.all([
            fetchItemsStockData(),
            fetchMasterData()
        ]);

        const { items, storeStocks, error } = itemsStockData;

        return (
            <ClientInventoryPage
                initialData={items}
                storeStocks={storeStocks}
                masterData={masterData} // ส่ง master data ไปยัง ClientInventoryPage
                error={error}
            />
        );
    } catch (error) {
        console.error("Error fetching data:", error);
        return <div>Error loading data</div>;
    }
};

export default InventoryPage;