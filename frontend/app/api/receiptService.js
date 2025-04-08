const RECEIPT_API_URL = process.env.NEXT_PUBLIC_RECEIPT_BASE_URL || "http://localhost:8084/api";
const INVENTORY_API_URL = process.env.NEXT_PUBLIC_INVENTORY_BASE_URL || "http://localhost:8082/api";
import { normalizeStoreName } from '../utils/StoreName';

// ฟังก์ชันสำหรับ fetch ข้อมูลทั่วไป
const fetchData = async (url, errorMessage) => {
    try {
        console.log(`Fetching data from: ${url}`);
        const response = await fetch(url, { cache: "no-store" });

        if (!response.ok) {
            throw new Error(`${errorMessage} Status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error(`Error fetching data from: ${url}`, error.message);
        throw new Error(error.message);
    }
};

// ฟังก์ชัน fetch ข้อมูล Receipts
export const fetchReceipts = async (offset = 0, pageSize = 100) => {
    try {
        const url = `${RECEIPT_API_URL}/api/receipts?offset=${offset}&pageSize=${pageSize}`;
        return await fetchData(url, "Failed to fetch receipts.");
    } catch (error) {
        console.error("Error fetching receipts:", error.message);
        throw new Error(error.message);
    }
};

// ฟังก์ชัน fetch ข้อมูล Master Data
export const fetchMasterData = async () => {
    try {
        const [categories, rawStores, rawSuppliers] = await Promise.all([
            fetchData(`${INVENTORY_API_URL}/api/categories`, "Failed to fetch categories."),
            fetchData(`${INVENTORY_API_URL}/api/stores`, "Failed to fetch stores."),
            fetchData(`${INVENTORY_API_URL}/api/suppliers`, "Failed to fetch suppliers."),
        ]);

        const stores = rawStores.map(store => ({
            store_id: store.store_id,
            name: normalizeStoreName(store.store_name), // Normalize ชื่อร้านค้า

        }));

        const suppliers = rawSuppliers.map(supplier => ({
            supplier_id: supplier.supplier_id,
            name: supplier.supplier_name,
        }));

        return { categories, stores, suppliers };
    } catch (error) {
        console.error("Error fetching master data:", error.message);
        throw new Error(error.message);
    }
};

// ฟังก์ชันจัดกลุ่มข้อมูลตามวันที่และร้านค้า
export const groupDataByDateAndStore = (data) => {
    try {
        const groupedData = {};

        data.forEach(item => {
            const date = new Date(item.receipt_date).toLocaleDateString('th-TH');
            const store = item.store_name;

            if (!groupedData[date]) {
                groupedData[date] = {};
            }

            if (!groupedData[date][store]) {
                groupedData[date][store] = [];
            }

            groupedData[date][store].push(item);
        });

        return groupedData;
    } catch (error) {
        console.error("Error grouping data:", error.message);
        return {};
    }
};
