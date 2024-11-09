// src/utils/api.js

export const fetchItemsStockData = async () => {
    try {
        const response = await fetch('http://localhost:8082/api/item-stock');
        if (!response.ok) {
            throw new Error("Failed to fetch items");
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching items:", error);
    }
};
export const saveItemFields = async (itemFields) => {
    return axios.post('/api/inventory/saveItemFields', { itemFields });
};

export const saveSupplierFields = async (supplierFields) => {
    return axios.post('/api/supplier/saveSupplierFields', { supplierFields });
};
export const SaveOrderItems = async () => {
    try {
        const response = await fetch('/api/purchase-orders/line-item/save', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                poData: { supplierName, orderDate, status, updatedBy }, // ข้อมูล PO
                lineItems: itemOrder // รายการ line items
            }),
        });

        if (response.ok) {
            alert("บันทึกข้อมูลสำเร็จ");
        } else {
            throw new Error('Failed to save data');
        }
    } catch (error) {
        console.error("Error saving order items:", error.message);
        alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
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
        const response = await fetch('http://localhost:8083/api/suppliers');
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
        const response = await fetch('http://localhost:8083/api/suppliers/settings', {
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
// export const fetchReceipts = async () => {
//     try {
//         const response = await fetch('http://localhost:8084/api/receipts');
//         if (!response.ok) {
//             throw new Error('Failed to fetch receipts');
//         }
//         return await response.json();
//     } catch (error) {
//         console.error(error);
//         return [];
//     }
// };






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



