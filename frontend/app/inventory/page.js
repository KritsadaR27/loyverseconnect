//frontend/app/inventory/page.js
import React from "react";
import SidebarLayout from "../../components/layouts/SidebarLayout";
import InventoryTable from "./components/InventoryTable";
import InventoryActionBar from "./components/InventoryActionBar";

const InventoryPage = async () => {
    let items = [];
    let error = null;

    try {
        const response = await fetch(`http://host.docker.internal:8082/api/item-stock`, {
            cache: "no-store",
        });
        console.log("Response status:", response.status);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        items = await response.json();
    } catch (err) {
        console.error("Error fetching items:", err.message);
        error = err.message;
    }

    return (
        <SidebarLayout headerTitle="สต็อกสินค้า" actionBar={<InventoryActionBar />}
        >  {error ? (
            <div className="text-center text-red-500">Error: {error}</div>
        ) : (
            <InventoryTable />
        )}
        </SidebarLayout>
    );
};

export default InventoryPage;
