// frontend/hooks/useItemStock.js
import { useState, useEffect } from "react";
import axios from "axios";

export const useItemStock = () => {
    const [items, setItems] = useState([]);
    const [storeStocks, setStoreStocks] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchStoreStock = async (itemIDs) => {
        try {
            const requests = itemIDs.map((itemID) =>
                axios.get(`http://localhost:8082/api/item-stock/store`, {
                    params: { item_id: itemID },
                })
            );
            const responses = await Promise.all(requests);
            responses.forEach((response, index) => {
                const itemID = itemIDs[index];
                setStoreStocks((prev) => ({ ...prev, [itemID]: response.data }));
            });
        } catch (error) {
            console.error("Error loading store stock data:", error);
        }
    };

    useEffect(() => {
        const fetchItemStockData = async () => {
            try {
                const response = await axios.get("http://localhost:8082/api/item-stock");
                const groupedItems = response.data.reduce((acc, item) => {
                    const existingItem = acc.find((i) => i.item_id === item.item_id);
                    if (existingItem) {
                        existingItem.in_stock += item.in_stock;
                    } else {
                        acc.push({ ...item });
                    }
                    return acc;
                }, []);
                setItems(groupedItems);
                setLoading(false);
            } catch (err) {
                setError("Error fetching item stock data");
                setLoading(false);
            }
        };

        fetchItemStockData();
    }, []);

    return {
        items,
        storeStocks,
        loading,
        error,
        fetchStoreStock,
    };
};
