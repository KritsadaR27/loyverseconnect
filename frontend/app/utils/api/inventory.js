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
    return axios.post(`${inventoryBaseURL}/api/inventory/saveItemFields`, { itemFields });
};
