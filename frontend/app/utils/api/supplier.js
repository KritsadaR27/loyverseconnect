// src/utils/api/supplier.js

const supplierBaseURL = process.env.REACT_APP_SUPPLIER_BASE_URL || 'http://localhost:8083';


export const fetchSuppliers = async () => {
    try {
        const response = await fetch(`${supplierBaseURL}/api/suppliers`);
        if (!response.ok) throw new Error("Failed to fetch suppliers");
        const data = await response.json();

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
    try {
        console.log("Suppliers to send:", suppliers); // Log the data being sent
        const baseURL = process.env.SUPPLIER_API_URL || "http://localhost:8083"; // Fallback to localhost if not defined
        const response = await fetch(`${baseURL}/api/suppliers/settings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(suppliers),
        });

        // Check if the response is okay
        if (!response.ok) {
            const errorText = await response.text();
            console.error("Error response:", errorText);  // Log error message from server
            throw new Error(`Failed to save supplier settings: ${errorText}`);
        }

        const result = await response.json();
        console.log("API Response:", result); // Log the actual response from the API
        if (result && result.success) {
            console.log("Supplier settings saved successfully");
        } else {
            console.error("Error in saving supplier settings:", result);
        }
        return result; // Return the result from the API call
    } catch (error) {
        console.error("Error saving supplier settings:", error);
        return { success: false, message: error.message };  // Return error message on failure
    }
};




