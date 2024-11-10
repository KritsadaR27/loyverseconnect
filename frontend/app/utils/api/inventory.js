// src/utils/api/inventory.js

const inventoryBaseURL = process.env.REACT_APP_INVENTORY_BASE_URL || 'http://localhost:8082';


export const fetchItemsStockData = async () => {
    try {
        const response = await fetch(`${inventoryBaseURL}/api/item-stock`);
        if (!response.ok) throw new Error("Failed to fetch items");
        return await response.json();
    } catch (error) {
        console.error("Error fetching items:", error);
    }
};


export const saveItemFields = async (itemFields) => {
    console.log("Sending item fields:", itemFields); // ตรวจสอบข้อมูลที่จะส่งไป
    
    try {
        const response = await fetch(`${inventoryBaseURL}/api/item-supplier-settings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(itemFields),  // ส่งข้อมูลแบบ array ของ CustomItemField
        });

        if (!response.ok) {
            throw new Error("Failed to save item fields");
        }

        return await response.json();
    } catch (error) {
        console.error("Error saving item fields:", error);
        return { success: false, message: error.message };
    }
};
