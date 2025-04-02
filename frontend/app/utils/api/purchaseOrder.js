// src/utils/api/purchaseOrder.js
const purchaseOrderBaseURL = process.env.NEXT_PUBLIC_PURCHASE_ORDER_BASE_URL || 'http://localhost:8080';

export const saveOrderItems = async (supplierName, orderDate, status, updatedBy, itemOrder) => {
    try {
        const response = await fetch(`${purchaseOrderBaseURL}/api/purchase-orders/line-item/save`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                poData: { supplierName, orderDate, status, updatedBy },
                lineItems: itemOrder
            }),
        });
        if (!response.ok) throw new Error('Failed to save data');
        alert("บันทึกข้อมูลสำเร็จ");
    } catch (error) {
        console.error("Error saving order items:", error.message);
        alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    }
};

export const saveReserveValuesToDB = async (reserveValues) => {
    try {
        const response = await fetch(`${purchaseOrderBaseURL}/api/saveReserveValues`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(reserveValues),
        });
        if (!response.ok) throw new Error("Failed to save reserve values");
        return await response.json();
    } catch (error) {
        console.error("Error saving reserve values:", error);
        throw error;
    }
};
