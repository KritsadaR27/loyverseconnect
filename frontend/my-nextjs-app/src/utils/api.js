// src/utils/api.js
export const fetchItemsFromSuppliers = async () => {
    try {
        const response = await fetch('http://localhost:8080/api/getItemsFromSuppliers');
        if (!response.ok) {
            throw new Error("Failed to fetch items");
        }
        const data = await response.json();
        console.log(data);
        return data;
    } catch (error) {
        console.error("Error fetching items:", error);
    }
};
