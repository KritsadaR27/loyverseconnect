// frontend/app/api/salesService.js

import axios from 'axios';

const SALES_API_URL = process.env.NEXT_PUBLIC_SALES_API_URL || "http://localhost:8084/api";

export const fetchSalesByItem = async (offset = 0, pageSize = 100) => {
    try {
        const response = await axios.get(`${SALES_API_URL}/sales/items`, {
            params: { offset, pageSize }
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching sales by item:", error);
        throw new Error(error.message);
    }
};

export const fetchSalesByDay = async (startDate, endDate) => {
    try {
        const response = await axios.get(`${SALES_API_URL}/sales/days`, {
            params: {
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString(),
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching sales by day:", error);
        throw new Error(error.message);
    }
};

export const fetchMonthlyCategorySales = async (startDate, endDate) => {
    try {
        const timeZone = 'Asia/Bangkok';
        const startInBangkok = new Date(startDate).toLocaleString('sv-SE', { timeZone }).split(" ")[0];
        const endInBangkok = new Date(endDate).toLocaleString('sv-SE', { timeZone }).split(" ")[0];

        const response = await axios.get(`${SALES_API_URL}/sales/monthly-category`, {
            params: {
                startDate: startInBangkok,
                endDate: endInBangkok,
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching monthly category sales:", error);
        throw new Error(error.message);
    }
};