// src/app/inventory/ClientInventoryPage.js
"use client";

import React, { useState, useMemo } from "react";
import { useInventory } from "./hooks/useInventory"; // นำเข้า useInventory
import SidebarLayout from "../../components/layouts/SidebarLayout";
import InventoryTable from "./components/InventoryTable";
import InventoryActionBar from "./components/InventoryActionBar";

const ClientInventoryPage = ({ initialData, storeStocks, masterData, error }) => {
    // console.log("Initial data:", initialData); // Log ข้อมูลที่ได้รับจาก SSR
    // console.log("Store stocks:", storeStocks); // Log ข้อมูล store stocks
    // console.log("Master data:", masterData); // Log ข้อมูล master data
    // console.log("Error:", error); // Log ข้อผิดพลาด

    const { items, filterText, filterInventory, groupBy, setGroupBy, selectedCategories, setSelectedCategories, selectedSuppliers, setSelectedSuppliers } = useInventory(initialData, storeStocks, masterData, error); // ใช้ Client-side hook

    const [showStoreStocks, setShowStoreStocks] = useState(false);
    const [showFriendOrder, setShowFriendOrder] = useState(false);
    const handleFriendOrderToggle = () => {
        setShowFriendOrder(!showFriendOrder);
        setShowStoreStocks(true);
        setGroupBy('supplier_name');
        // กำหนด suppliers ที่ต้องการกรอง
    };

    const handleFriendOrderCancel = () => {
        setShowFriendOrder(false);
        setShowStoreStocks(false);
        setGroupBy('');
        // รีเซ็ต suppliers ที่กรอง
    };
    // ฟังก์ชันสำหรับการเปลี่ยนค่า groupBy
    const handleGroupByChange = (newGroupBy) => {
        setGroupBy(newGroupBy);
    };

    const memoizedItems = useMemo(() => items, [items]);
    const memoizedStoreStocks = useMemo(() => storeStocks, [storeStocks]);
    const memoizedCategories = useMemo(() => masterData.categories, [masterData.categories]);
    const memoizedSuppliers = useMemo(() => masterData.suppliers, [masterData.suppliers]);

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
                    setGroupBy={handleGroupByChange}
                    categories={memoizedCategories}
                    selectedCategories={selectedCategories}
                    setSelectedCategories={setSelectedCategories}
                    suppliers={memoizedSuppliers}
                    selectedSuppliers={selectedSuppliers}
                    setSelectedSuppliers={setSelectedSuppliers}
                    toggleShowStoreStocks={() => setShowStoreStocks(!showStoreStocks)}
                    showStoreStocks={showStoreStocks}
                    showFriendOrder={showFriendOrder}
                    setShowFriendOrder={setShowFriendOrder}
                    handleFriendOrderToggle={handleFriendOrderToggle}
                    handleFriendOrderCancel={handleFriendOrderCancel}

                />
            }
        >
            <InventoryTable items={memoizedItems} storeStocks={memoizedStoreStocks} showStoreStocks={showStoreStocks} groupBy={groupBy} showFriendOrder={showFriendOrder} />
        </SidebarLayout>
    );
};

export default ClientInventoryPage;