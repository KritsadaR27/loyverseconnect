// src/utils/api.js

export const fetchItemsStockData = async () => {
    try {
        const response = await fetch('http://localhost:8080/api/get-item-stock-data');
        if (!response.ok) {
            throw new Error("Failed to fetch items");
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching items:", error);
    }
};

export const saveItemOrderToAPI = async (supplier, newOrder, orderDate) => {
    try {
        const response = await fetch('http://localhost:8080/api/saveOrder', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                order_date: orderDate, // ตรวจสอบรูปแบบวันที่
                items: newOrder.map(item => ({
                    item_name: item.item_name,
                    supplier_name: supplier,
                    sort_order: item.sort_order
                }))
            }),
        });
        if (!response.ok) throw new Error('Failed to save order');
    } catch (error) {
        console.error("Error saving order:", error);
    }
};



export const fetchSuppliers = async () => {
    try {
        const response = await fetch('http://localhost:8080/api/suppliers');
        if (!response.ok) throw new Error("Failed to fetch suppliers");

        const data = await response.json();
        
        // แปลง selected_days เป็น array ถ้ายังเป็น string อยู่
        return data.map(supplier => ({
            ...supplier,
            selected_days: typeof supplier.selected_days === 'string'
                ? supplier.selected_days.split(',')
                : supplier.selected_days || []
        }));
    } catch (error) {
        console.error("Error fetching suppliers:", error);
        return [];
    }
};
// In src/utils/api.js
export const fetchSupplierCycles = async () => {
    try {
        const response = await fetch('http://localhost:8080/api/supplierCycles'); // Adjust the endpoint as necessary
        if (!response.ok) {
            throw new Error('Failed to fetch supplier cycles');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching supplier cycles:', error);
        return [];
    }
};





export const saveSupplierSettings = async (suppliers) => {
    try {
        // เปลี่ยนโครงสร้างของ suppliers ก่อนส่ง
        const suppliersToSend = suppliers.map(supplier => ({
            id: supplier.id,
            name: supplier.name,
            order_cycle: supplier.order_cycle || "",    // เปลี่ยนให้เป็น string ธรรมดา
            sort_order: supplier.sort_order,
            selected_days: supplier.selected_days || []
        }));

        console.log("Saving suppliers:", suppliersToSend); // Log ข้อมูลเพื่อตรวจสอบ
        const response = await fetch('http://localhost:8080/api/suppliers/settings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(suppliersToSend),
        });
        if (!response.ok) throw new Error("Failed to save supplier settings");
    } catch (error) {
        console.error("Error saving supplier settings:", error);
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



