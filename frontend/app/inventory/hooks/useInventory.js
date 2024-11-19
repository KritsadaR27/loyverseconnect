// frontend/app/inventory/hooks/useInventory.js
import { useState, useEffect } from "react";
import axios from "axios";

export const useInventory = () => {
    const [items, setItems] = useState([]);
    const [storeStocks, setStoreStocks] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchItemStockData = async () => {
        setLoading(true);
        try {
            const response = await axios.get("http://localhost:8082/api/item-stock");
            const groupedItems = [];
            const stores = {};

            response.data.forEach((item) => {
                
                const existingItem = groupedItems.find((i) => i.item_id === item.item_id);
                if (existingItem) {
                    existingItem.in_stock += item.in_stock;
                } else {
                    groupedItems.push({ ...item });
                }

                if (!stores[item.item_id]) {
                    stores[item.item_id] = [];
                }
                stores[item.item_id].push({
                    store_name: item.store_name,
                    in_stock: item.in_stock,
                });
            });

            setItems(groupedItems);
            setStoreStocks(stores);
        } catch (err) {
            setError(err.message || "Error fetching item stock data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchItemStockData();
    }, []);

    return { items, storeStocks, loading, error, fetchItemStockData };
};
