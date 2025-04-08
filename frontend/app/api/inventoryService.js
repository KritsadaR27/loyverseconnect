// ใช้แยกตามฝั่ง
// const isServer = typeof window === "undefined";
// const INVENTORY_API_URL = isServer
//   ? process.env.INVENTORY_API_URL
//   : process.env.NEXT_PUBLIC_INVENTORY_BASE_URL;
export const dynamic = 'force-dynamic';

const INVENTORY_API_URL = process.env.NEXT_PUBLIC_INVENTORY_BASE_URL;

// ฟังก์ชันสำหรับ fetch ข้อมูลทั่วไป
const fetchData = async (url, errorMessage) => {
    try {
        console.log(`Fetching data from: ${url}`); // Log URL ที่กำลัง fetch
        const response = await fetch(url, { cache: "no-store" });

        if (!response.ok) {
            throw new Error(`${errorMessage} Status: ${response.status}`);
        }

        const data = await response.json();
        console.log(`Data fetched successfully from: ${url}`); // Log เมื่อ fetch สำเร็จ
        return data;
    } catch (error) {
        console.error(`Error fetching data from: ${url}`, error.message); // Log ข้อผิดพลาด
        throw new Error(error.message);
    }
};

// ฟังก์ชัน fetch ข้อมูล Master Data
export const fetchMasterData = async () => {
    try {
        console.log("Fetching master data...");
        const [categories, stores, suppliers] = await Promise.allSettled([
            fetchData(`${INVENTORY_API_URL}/api/categories`, "Failed to fetch categories."),
            fetchData(`${INVENTORY_API_URL}/api/stores`, "Failed to fetch stores."),
            fetchData(`${INVENTORY_API_URL}/api/suppliers`, "Failed to fetch suppliers.")
        ]);

        // ตรวจสอบผลลัพธ์ของแต่ละ API
        if (categories.status === "rejected") {
            console.error(categories.reason.message);
        }
        if (stores.status === "rejected") {
            console.error(stores.reason.message);
        }
        if (suppliers.status === "rejected") {
            console.error(suppliers.reason.message);
        }

        // เปลี่ยนชื่อฟิลด์ supplier_name เป็น name
        const supplierData = suppliers.status === "fulfilled" ? suppliers.value.map(supplier => ({
            ...supplier,
            name: supplier.supplier_name
        })) : [];

        return {
            categories: categories.status === "fulfilled" ? categories.value : [],
            stores: stores.status === "fulfilled" ? stores.value : [],
            suppliers: supplierData
        };
    } catch (error) {
        console.error("Error fetching master data:", error.message);
        throw error;
    }
};

// ฟังก์ชันจัดการข้อมูล Stock โดยใช้ Map
export const fetchItemsStockData = async () => {
    try {
        console.log("Fetching item stock data...");
        console.log(`Fetching data from: ${INVENTORY_API_URL}/api/item-stock`);
        const rawItems = await fetchData(
            `${INVENTORY_API_URL}/api/item-stock`,
            "Failed to fetch item stock data."
        );

        if (!rawItems || rawItems.length === 0) {
            console.error("No items data received from API");
            return { items: [], storeStocks: {}, error: "No items data received from API" };
        }

        const itemsMap = new Map();
        const storeStocks = {};

        rawItems.forEach((item) => {
            // Grouping items by item_id using Map
            if (itemsMap.has(item.item_id)) {
                const existingItem = itemsMap.get(item.item_id);
                existingItem.in_stock += item.in_stock;
            } else {
                itemsMap.set(item.item_id, { ...item });
            }

            // Collecting store stock details
            if (!storeStocks[item.item_id]) {
                storeStocks[item.item_id] = [];
            }
            storeStocks[item.item_id].push({
                store_name: item.store_name,
                in_stock: item.in_stock,
            });
        });

        const items = Array.from(itemsMap.values()); // Convert Map back to array


        return { items, storeStocks, error: null };
    } catch (error) {
        console.error("Error fetching item stock data:", error.message);
        return { items: [], storeStocks: {}, error: error.message };
    }
};

// การเรียก API แบบ Parallel
export const fetchAllInventoryData = async () => {
    try {
        console.log("Fetching all inventory data...");
        const [itemsStockData, masterData] = await Promise.all([
            fetchItemsStockData(),
            fetchMasterData(),
        ]);


        return {
            itemsStockData,
            masterData,
            error: null,
        };
    } catch (error) {

        return {
            itemsStockData: { items: [], storeStocks: {}, error: error.message },
            masterData: null,
            error: error.message,
        };
    }
};