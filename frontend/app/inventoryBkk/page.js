// src/app/inventory/page.js
import React from "react";
import ClientInventoryPage from "./ClientInventoryPage";
import { fetchItemsStockData, fetchMasterData } from "../api/inventoryService";

import './IventoryCss.css'; // นำเข้าไฟล์ CSS

const InventoryPage = async () => {
    const { items, storeStocks, error } = await fetchItemsStockData();
    const masterData = await fetchMasterData(); // ดึง master data ในฝั่ง server

    return (
        <ClientInventoryPage
            initialData={items}
            storeStocks={storeStocks}
            masterData={masterData} // ส่ง master data ไปยัง ClientInventoryPage
            error={error}
        />
    );
};

export default InventoryPage;