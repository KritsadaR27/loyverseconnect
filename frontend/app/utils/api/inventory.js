// frontend/app/utils/api/inventory.js
import { sendRequest } from './sendRequest';

const inventoryBaseURL = process.env.REACT_APP_INVENTORY_BASE_URL || 'http://localhost:8082';

export const fetchItemsStockData = async () => {
    try {
        const url = `${inventoryBaseURL}/api/item-stock`;
        return await sendRequest(url);
    } catch (error) {
        console.error("Error fetching items:", error);
        return [];
    }
};

export const saveItemFields = async (itemFields) => {
    console.log("Sending item fields:", itemFields);

    try {
        const url = `${inventoryBaseURL}/api/item-supplier-settings`;
        return await sendRequest(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(itemFields),
        });
    } catch (error) {
        console.error("Error saving item fields:", error);
        return { success: false, message: error.message };
    }
};


const fetchSalesByDay = async (startDate, endDate, setPivotData) => {
    try {
        const response = await axios.get("http://localhost:8084/api/sales/days", {
            params: {
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString(),
            },
        });

        const salesData = response.data;
        const pivotedData = transformSalesData(salesData);
        setPivotData(pivotedData); // เซ็ตข้อมูลที่ได้เพื่อใช้งานในคอลัมน์ใหม่
    } catch (error) {
        console.error("Error fetching sales by day:", error);
    }
};

