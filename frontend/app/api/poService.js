// app/api/poService.js
import axios from 'axios';
import { mockPOService } from './mockService';

const isServer = typeof window === 'undefined';
const PO_API_URL = isServer 
  ? process.env.PURCHASE_ORDER_API_URL 
  : process.env.NEXT_PUBLIC_PURCHASE_ORDER_BASE_URL;

const INVENTORY_API_URL = isServer
  ? process.env.INVENTORY_API_URL
  : process.env.NEXT_PUBLIC_INVENTORY_BASE_URL;

// Flag to enable mock service
const USE_MOCK_SERVICE = true; // Set to false when backend service is available

/**
 * Fetch inventory data for PO generation
 * @returns {Promise<Array>} Array of inventory items
 */
export const fetchInventoryData = async () => {
  if (USE_MOCK_SERVICE) {
    console.log('Using mock inventory data');
    return mockPOService.fetchInventoryData();
  }
  
  try {
    const response = await axios.get(`${INVENTORY_API_URL}/api/inventory-po`);
    return response.data;
  } catch (error) {
    console.error("Error fetching inventory data:", error);
    console.log('Falling back to mock inventory data');
    return mockPOService.fetchInventoryData();
  }
};

/**
 * Fetch sales data for specified date range
 * @param {Array<Date>} dates Array of dates to fetch sales for
 * @returns {Promise<Object>} Sales data by day
 */
export const fetchSalesData = async (dates) => {
  if (USE_MOCK_SERVICE) {
    console.log('Using mock sales data');
    return mockPOService.fetchSalesData(dates);
  }
  
  try {
    // Convert dates to ISO string format for API
    const dateParams = dates.map(date => date.toISOString()).join(',');
    
    const response = await axios.get(`${PO_API_URL}/api/sales/days`, {
      params: { 
        startDate: dates[0].toISOString(),
        endDate: dates[dates.length - 1].toISOString()
      }
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching sales data:", error);
    console.log('Falling back to mock sales data');
    return mockPOService.fetchSalesData(dates);
  }
};

/**
 * Fetch store stock levels for specified items
 * @param {Array<string>} itemIds Array of item IDs
 * @returns {Promise<Object>} Stock levels by store
 */
export const fetchStoreStocks = async (itemIds) => {
  if (USE_MOCK_SERVICE) {
    console.log('Using mock store stocks');
    return mockPOService.fetchStoreStocks(itemIds);
  }
  
  try {
    const response = await axios.get(`${INVENTORY_API_URL}/api/store-stocks`, {
      params: { item_ids: itemIds.join(',') }
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching store stocks:", error);
    console.log('Falling back to mock store stocks');
    return mockPOService.fetchStoreStocks(itemIds);
  }
};

/**
 * Save buffer quantities for items
 * @param {Array<Object>} items Items with buffer quantities
 * @returns {Promise<Object>} Save result
 */
export const saveBufferQuantities = async (items) => {
  if (USE_MOCK_SERVICE) {
    console.log('Using mock buffer quantities save');
    return mockPOService.saveBufferQuantities(items);
  }
  
  try {
    const bufferData = items.map(item => ({
      item_id: item.id,
      buffer: item.buffer || 0
    }));
    
    const response = await axios.post(`${PO_API_URL}/api/buffer-quantities`, bufferData);
    return response.data;
  } catch (error) {
    console.error("Error saving buffer quantities:", error);
    console.log('Falling back to mock buffer quantities save');
    return mockPOService.saveBufferQuantities(items);
  }
};

/**
 * Send LINE notification for purchase order
 * @param {Object} notificationData Notification data
 * @returns {Promise<Object>} Notification result
 */
export const sendLineNotification = async (notificationData) => {
  if (USE_MOCK_SERVICE) {
    console.log('Using mock LINE notification');
    return mockPOService.sendLineNotification(notificationData);
  }
  
  try {
    const response = await axios.post(`${PO_API_URL}/api/notify/line`, notificationData);
    return response.data;
  } catch (error) {
    console.error("Error sending LINE notification:", error);
    console.log('Falling back to mock LINE notification');
    return mockPOService.sendLineNotification(notificationData);
  }
};

/**
 * Generate purchase order
 * @param {Object} purchaseOrderData Purchase order data
 * @returns {Promise<Object>} Generated purchase order
 */
export const generatePurchaseOrder = async (purchaseOrderData) => {
  if (USE_MOCK_SERVICE) {
    console.log('Using mock purchase order generation');
    return mockPOService.generatePurchaseOrder(purchaseOrderData);
  }
  
  try {
    const response = await axios.post(`${PO_API_URL}/api/purchase-orders`, purchaseOrderData);
    return response.data;
  } catch (error) {
    console.error("Error generating purchase order:", error);
    console.log('Falling back to mock purchase order generation');
    return mockPOService.generatePurchaseOrder(purchaseOrderData);
  }
};