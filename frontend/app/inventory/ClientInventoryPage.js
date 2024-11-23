// src/app/inventory/ClientInventoryPage.js
"use client";

import React, { useState } from "react";
import { useInventory } from "./hooks/useInventory"; // นำเข้า useInventory
import SidebarLayout from "../../components/layouts/SidebarLayout";
import InventoryTable from "./components/InventoryTable";
import InventoryActionBar from "./components/InventoryActionBar";

const ClientInventoryPage = ({ initialData, storeStocks, masterData, error }) => {
    console.log("Initial data:", initialData); // Log ข้อมูลที่ได้รับจาก SSR
    console.log("Store stocks:", storeStocks); // Log ข้อมูล store stocks
    console.log("Master data:", masterData); // Log ข้อมูล master data
    console.log("Error:", error); // Log ข้อผิดพลาด

    const { items, filterText, filterInventory, groupBy, setGroupBy, selectedCategories, setSelectedCategories, selectedSuppliers, setSelectedSuppliers } = useInventory(initialData, storeStocks, masterData, error); // ใช้ Client-side hook
    const [showStoreStocks, setShowStoreStocks] = useState(false);

    if (error) {
        return <div className="text-center text-red-500">Error: {error}</div>;
    }

    return (
        <SidebarLayout
            headerTitle="สต็อกสินค้า"
            actionBar={
                <InventoryActionBar
                    filterText={filterText}
                    filterInventory={filterInventory}
                    groupBy={groupBy}
                    setGroupBy={setGroupBy}
                    categories={masterData.categories}
                    selectedCategories={selectedCategories}
                    setSelectedCategories={setSelectedCategories}
                    suppliers={masterData.suppliers}
                    selectedSuppliers={selectedSuppliers}
                    setSelectedSuppliers={setSelectedSuppliers}
                    toggleShowStoreStocks={() => setShowStoreStocks(!showStoreStocks)}
                    showStoreStocks={showStoreStocks}
                />
            }
        >
            <InventoryTable items={items} storeStocks={storeStocks} showStoreStocks={showStoreStocks} />
        </SidebarLayout>
    );
};

export default ClientInventoryPage;