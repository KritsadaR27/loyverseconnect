// utils.js  

/**
 * Format number with commas
 * @param {number} number - The number to format
 * @returns {string} - The formatted number
 */
export const formatNumber = (number) => {
    return number.toLocaleString();
};

/**
 * Format currency with commas and currency symbol
 * @param {number} number - The number to format
 * @returns {string} - The formatted currency
 */
export const formatCurrency = (number) => {
    return number.toLocaleString('th-TH', { style: 'currency', currency: 'THB' });
};

/**
 * Normalize store name by removing the prefix "ลุงรวย สาขา"
 * @param {string} storeName - The original store name
 * @returns {string} - The normalized store name
 */
export const normalizeStoreName = (storeName) => {
    return storeName.replace("ลุงรวย สาขา", "").trim();
};

/**
 * Calculate the sum of in_stock for a specific store
 * @param {Array} items - The list of items
 * @param {string} storeName - The store name to calculate the sum for
 * @param {Object} storeStocks - The store stocks data
 * @returns {number} - The sum of in_stock for the specified store
 */
export const calculateStoreSum = (items, storeName, storeStocks) => {
    return items.reduce((acc, item) => {
        const storeStock = storeStocks[item.item_id]?.find(store => normalizeStoreName(store.store_name) === storeName);
        return acc + (storeStock?.in_stock || 0);
    }, 0);
};