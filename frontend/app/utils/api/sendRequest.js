// src/utils/api/sendRequest.js

const defaultTimeout = 15000; // กำหนด Timeout 15 วินาทีเป็นค่าเริ่มต้น

export const sendRequest = async (url, options = {}, timeout = defaultTimeout) => {
    const controller = new AbortController();
    const { signal } = controller;

    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await fetch(url, { ...options, signal });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error ${response.status}: ${errorText}`);
        }

        return await response.json();
    } catch (error) {
        if (error.name === "AbortError") {
            console.error("Request timed out");
        } else {
            console.error("Request error:", error);
        }
        return { success: false, message: error.message };
    } finally {
        clearTimeout(timeoutId); // ยกเลิก Timeout
    }
};
