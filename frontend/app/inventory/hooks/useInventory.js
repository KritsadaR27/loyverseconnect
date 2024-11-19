import { useState, useEffect } from "react";
import { fetchItemsStockData } from "../../utils/api/inventory";
import { fetchSuppliers } from "../../utils/api/supplier";


export const useInventory = () => {
    const [items, setItems] = useState([]); // Grouped items with total stock
    const [storeStocks, setStoreStocks] = useState({}); // Store-specific stock for each item
    const [suppliers, setSuppliers] = useState([]); // Suppliers data

    const [loading, setLoading] = useState(false); // Loading state
    const [error, setError] = useState(null); // Error state

    const fetchInventoryData = async () => {
        setLoading(true);
        try {
            // Fetch items data and suppliers data in parallel
            const [rawItems, rawSuppliers] = await Promise.all([
                fetchItemsStockData(),
                fetchSuppliers()
            ]);

            const groupedItems = [];
            const stores = {};

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
                if (!stores[item.item_id]) {
                    stores[item.item_id] = [];
                }
                stores[item.item_id].push({
                    store_name: item.store_name,
                    in_stock: item.in_stock,
                });
            });

            setItems(groupedItems); // Update grouped items state
            setStoreStocks(stores); // Update store-specific stocks state
            setSuppliers(rawSuppliers); // Set suppliers data

        } catch (err) {
            setError(err.message || "Error fetching inventory data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInventoryData(); // Fetch inventory data on component mount
    }, []);

    return { items, storeStocks, suppliers, loading, error, fetchInventoryData };
};
