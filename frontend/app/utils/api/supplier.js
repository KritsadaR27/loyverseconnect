// frontend/app/utils/api/supplier.js
import { sendRequest } from './sendRequest';

const supplierBaseURL = process.env.REACT_APP_SUPPLIER_BASE_URL || 'http://localhost:8083';

export const fetchSuppliers = async () => {
    try {
        const url = `${supplierBaseURL}/api/suppliers`;
        const data = await sendRequest(url);
        // console.log("Raw supplier data:", data); // ตรวจสอบข้อมูลที่ได้รับจาก sendRequest

        // ตรวจสอบว่า supplier_id และ supplier_name มีค่า
        data.forEach(supplier => {
            if (!supplier.supplier_id || !supplier.supplier_name) {
                console.error("Missing supplier_id or supplier_name", supplier);
            }
        });

        // จัดการข้อมูลและตรวจสอบว่า selected_days เป็น array หรือไม่
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
    console.log("Suppliers to send:", suppliers);

    try {
        const url = `${supplierBaseURL}/api/suppliers/settings`;
        const result = await sendRequest(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(suppliers),
        });

        if (result && result.success) {
            console.log("Supplier settings saved successfully");
        } else {
            console.error("Error in saving supplier settings:", result);
        }
        return result;
    } catch (error) {
        console.error("Error saving supplier settings:", error);
        return { success: false, message: error.message };
    }
};
