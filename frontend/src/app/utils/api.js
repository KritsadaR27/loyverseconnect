// src/utils/api.js
export const fetchItemsStockData = async () => {
    try {
        const response = await fetch('http://localhost:8080/api/get-item-stock-data'); // URL สำหรับเรียกดูข้อมูล
        if (!response.ok) {
            throw new Error("Failed to fetch items");
        }
        const data = await response.json();
        console.log("Data fetched:", data); // เพิ่ม Log เพื่อตรวจสอบโครงสร้างข้อมูล
        return data;
    } catch (error) {
        console.error("Error fetching items:", error);
    }
};


// // src/utils/api.js
// export const fetchInventoryTotal = async (itemName) => {
//     try {
//         const response = await fetch(`http://localhost:8080/api/inventory/total?item_name=${encodeURIComponent(itemName)}`);
//         if (!response.ok) {
//             throw new Error("Failed to fetch inventory total");
//         }
//         const data = await response.json();
//         console.log("Fetched total stock:", data.total_stock); // Log เพื่อตรวจสอบค่า
//         return data.total_stock;
//     } catch (error) {
//         console.error("Error fetching inventory total:", error);
//         return null;
//     }
// };


// Save reserve values to the database
export const saveReserveValuesToDB = async (reserveValues) => {
    try {
        const response = await fetch('http://localhost:8080/api/saveReserveValues', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(reserveValues),
        });

        if (!response.ok) {
            throw new Error("Failed to save reserve values");
        }

        const data = await response.json();
        console.log("Reserve values saved:", data);
        return data;
    } catch (error) {
        console.error("Error saving reserve values:", error);
        throw error;
    }
};



