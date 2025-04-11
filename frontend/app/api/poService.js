// app/api/poService.js
import axios from 'axios';

const isServer = typeof window === 'undefined';
const PO_API_URL = isServer 
  ? process.env.PURCHASE_ORDER_API_URL 
  : process.env.NEXT_PUBLIC_PURCHASE_ORDER_BASE_URL;

const INVENTORY_API_URL = isServer
  ? process.env.INVENTORY_API_URL
  : process.env.NEXT_PUBLIC_INVENTORY_BASE_URL;

/**
 * Fetch inventory data for PO generation
 * @returns {Promise<Array>} Array of inventory items
 */
export const fetchInventoryData = async () => {
  try {
    const response = await axios.get(`${INVENTORY_API_URL}/api/inventory-po`);
    return response.data;
  } catch (error) {
    console.error("Error fetching inventory data:", error);
    throw new Error("Failed to fetch inventory data");
  }
};

/**
 * Fetch sales data for specified date range
 * @param {Array<Date>} dates Array of dates to fetch sales for
 * @returns {Promise<Object>} Sales data by day
 */
export const fetchSalesData = async (dates) => {
  try {
    // Convert dates to ISO string format for API
    const dateParams = dates.map(date => date.toISOString()).join(',');
    
    const response = await axios.get(`${PO_API_URL}/api/sales-by-date`, {
      params: { dates: dateParams }
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching sales data:", error);
    throw new Error("Failed to fetch sales data");
  }
};

/**
 * Fetch store stock levels for specified items
 * @param {Array<string>} itemIds Array of item IDs
 * @returns {Promise<Object>} Stock levels by store
 */
export const fetchStoreStocks = async (itemIds) => {
  try {
    const response = await axios.get(`${INVENTORY_API_URL}/api/store-stocks`, {
      params: { item_ids: itemIds.join(',') }
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching store stocks:", error);
    throw new Error("Failed to fetch store stocks");
  }
};

/**
 * Save buffer quantities for items
 * @param {Array<Object>} items Items with buffer quantities
 * @returns {Promise<Object>} Save result
 */
export const saveBufferQuantities = async (items) => {
  try {
    const bufferData = items.map(item => ({
      item_id: item.id,
      buffer: item.buffer || 0
    }));
    
    const response = await axios.post(`${PO_API_URL}/api/buffer-quantities`, bufferData);
    return response.data;
  } catch (error) {
    console.error("Error saving buffer quantities:", error);
    throw new Error("Failed to save buffer quantities");
  }
};

/**
 * Send LINE notification for purchase order
 * @param {Object} notificationData Notification data
 * @returns {Promise<Object>} Notification result
 */
export const sendLineNotification = async (notificationData) => {
  try {
    const response = await axios.post(`${PO_API_URL}/api/notify/line`, notificationData);
    return response.data;
  } catch (error) {
    console.error("Error sending LINE notification:", error);
    throw new Error("Failed to send LINE notification");
  }
};

/**
 * Generate purchase order
 * @param {Object} purchaseOrderData Purchase order data
 * @returns {Promise<Object>} Generated purchase order
 */
export const generatePurchaseOrder = async (purchaseOrderData) => {
  try {
    const response = await axios.post(`${PO_API_URL}/api/purchase-orders`, purchaseOrderData);
    return response.data;
  } catch (error) {
    console.error("Error generating purchase order:", error);
    throw new Error("Failed to generate purchase order");
  }
};