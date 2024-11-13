// app/po/services/poService.js
import axios from 'axios';

export const fetchPOs = async () => {
    try {
        const response = await axios.get('/api/purchase_orders');
        return response.data;
    } catch (error) {
        console.error("Error fetching PO list:", error);
        return [];
    }
};
