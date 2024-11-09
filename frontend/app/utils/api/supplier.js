// src/utils/api/supplier.js

const supplierBaseURL = process.env.REACT_APP_SUPPLIER_BASE_URL || 'http://localhost:8083';


export const fetchSuppliers = async () => {
    try {
        const response = await fetch(`${supplierBaseURL}/api/suppliers`);
        if (!response.ok) throw new Error("Failed to fetch suppliers");
        const data = await response.json();
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
        const suppliersToSend = suppliers.map(supplier => ({
            id: supplier.id,
            name: supplier.name,
            order_cycle: supplier.order_cycle || "",
            sort_order: supplier.sort_order,
            selected_days: supplier.selected_days || []
        }));
        const response = await fetch(`${supplierBaseURL}/api/suppliers/settings`, {
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
