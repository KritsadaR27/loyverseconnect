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
 * @param {string} storeName - The name of the store
 * @param {Object} storeStocks - The store stocks data
 * @returns {number} - The sum of in_stock for the specified store
 */
export const calculateStoreSum = (items, storeName, storeStocks) => {
    const normalizedName = normalizeStoreName(storeName);
    return items.reduce((sum, item) => {
        const stock = storeStocks[item.item_id]?.find(store => store.store_name === normalizedName)?.in_stock || 0;
        return sum + stock;
    }, 0);
};