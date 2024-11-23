// src/api/inventoryService.js
const ITEM_STOCK_API_URL = typeof window === 'undefined' ? 'http://host.docker.internal:8082/api' : process.env.NEXT_PUBLIC_ITEM_STOCK_API_URL;
const MASTER_DATA_API_URL = typeof window === 'undefined' ? 'http://host.docker.internal:8080/api' : process.env.NEXT_PUBLIC_MASTER_DATA_API_URL;

export const fetchItemsStockData = async () => {
    let items = [];
    let storeStocks = {};
    let error = null;

    try {
        console.log("Fetching items stock data from server..."); // Log ก่อนการเรียก API
        const response = await fetch(`${ITEM_STOCK_API_URL}/item-stock`, {
            cache: "no-store",
        });
        console.log("Response received:", response); // Log หลังการเรียก API

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const rawItems = await response.json();
        console.log("Raw items data (JSON):", rawItems); // Log ข้อมูลที่ได้รับจาก API

        // ตรวจสอบว่ามีข้อมูลใน rawItems หรือไม่
        if (!rawItems || rawItems.length === 0) {
            console.error("No items data received from API");
            return { items, storeStocks, error: "No items data received from API" };
        }

        // Grouping logic
        const groupedItems = [];
        storeStocks = {};

        rawItems.forEach((item) => {
            const existingItem = groupedItems.find((i) => i.item_id === item.item_id);

            if (existingItem) {
                existingItem.in_stock += item.in_stock;
            } else {
                groupedItems.push({ ...item });
            }

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

    return { items, storeStocks, error };
};

export const fetchMasterData = async () => {
    console.log("Fetching master data from server..."); // Log ก่อนการเรียก API
    try {
        const res = await fetch(`${MASTER_DATA_API_URL}/masterdata`);
        console.log("Response received:", res); // Log หลังการเรียก API

        if (!res.ok) {
            throw new Error(`Failed to fetch master data: ${res.status} ${res.statusText}`);
        }

        const masterData = await res.json();
        console.log("Master data:", masterData); // Log ข้อมูลที่ได้รับจาก API

        return masterData;
    } catch (err) {
        console.error("Error fetching master data:", err.message);
        throw err;
    }
};