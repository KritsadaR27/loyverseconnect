import React from "react";
import SidebarLayout from "../../components/layouts/SidebarLayout";
import InventoryTable from "./components/InventoryTable";
import InventoryActionBar from "./components/InventoryActionBar";

const InventoryPage = async () => {
    let items = [];
    let storeStocks = {}; // เพิ่มตัวแปร storeStocks
    let error = null;

    try {
        const response = await fetch(`http://host.docker.internal:8082/api/item-stock`, {
            cache: "no-store",
        });
        console.log("Response status:", response.status);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const rawItems = await response.json();

        // Grouping logic
        const groupedItems = [];
        storeStocks = {}; // สร้าง storeStocks เป็นวัตถุ

        rawItems.forEach((item) => {
            // Check if the item already exists in groupedItems
            const existingItem = groupedItems.find((i) => i.item_id === item.item_id);

            if (existingItem) {
                // Increment the total stock for grouped items
                existingItem.in_stock += item.in_stock;
            } else {
                // Add new item to groupedItems
                groupedItems.push({ ...item });
            }

            // Add store-specific stock details
            if (!storeStocks[item.item_id]) {
                storeStocks[item.item_id] = [];
            }
            storeStocks[item.item_id].push({
                store_name: item.store_name,
                in_stock: item.in_stock,
            });
        });

        items = groupedItems;
    } catch (err) {
        console.error("Error fetching items:", err.message);
        error = err.message;
    }

    return (
        <SidebarLayout
            headerTitle="สต็อกสินค้า"
            actionBar={<InventoryActionBar />}
        >
            {error ? (
                <div className="text-center text-red-500">Error: {error}</div>
            ) : (
                <InventoryTable items={items} storeStocks={storeStocks} />
            )}
        </SidebarLayout>
    );
};

export default InventoryPage;
