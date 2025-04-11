// app/api/poService.js
import axios from 'axios';

const isServer = typeof window === 'undefined';
const PO_API_URL = isServer 
  ? process.env.PURCHASE_ORDER_API_URL 
  : process.env.NEXT_PUBLIC_PURCHASE_ORDER_BASE_URL || 'http://localhost:8088';

const INVENTORY_API_URL = isServer
  ? process.env.INVENTORY_API_URL
  : process.env.NEXT_PUBLIC_INVENTORY_BASE_URL || 'http://localhost:8082';

// เปลี่ยนจาก SALES_API_URL เป็น RECEIPT_API_URL เพื่อดึงข้อมูลยอดขาย
const RECEIPT_API_URL = isServer
  ? process.env.RECEIPT_API_URL
  : process.env.NEXT_PUBLIC_RECEIPT_BASE_URL || 'http://localhost:8086';

// ฟังก์ชันสำหรับการจัดการข้อผิดพลาดจาก API
const handleApiError = (error, fallbackData = [], errorMessage = "API request failed") => {
  console.error(errorMessage, error);
  
  // ถ้าเป็น error จาก axios ให้แสดงรายละเอียดเพิ่มเติม
  if (error.response) {
    // คำขอสำเร็จแต่ server ส่งสถานะ error กลับมา
    console.error('Error response:', error.response.status, error.response.data);
  } else if (error.request) {
    // คำขอถูกส่งแต่ไม่ได้รับการตอบกลับ
    console.error('No response received:', error.request);
  }
  
  return fallbackData;
};

/**
 * Fetch inventory stock data
 * @returns {Promise<Array>} Array of inventory items with stock information
 */
export const fetchInventoryData = async () => {
  try {
    console.log(`Fetching inventory data from: ${INVENTORY_API_URL}/api/item-stock`);
    const response = await axios.get(`${INVENTORY_API_URL}/api/item-stock`, {
      timeout: 10000 // เพิ่ม timeout เพื่อป้องกันการรอนานเกินไป
    });
    return response.data;
  } catch (error) {
    // แทนที่จะ throw error ให้ return ข้อมูลเปล่าและ log error
    return handleApiError(error, [], "Error fetching inventory data");
  }
};

/**
 * Fetch sales data by day for a specific date range
 * @param {string} startDate - Start date (YYYY-MM-DD format)
 * @param {string} endDate - End date (YYYY-MM-DD format)
 * @returns {Promise<Array>} - Sales data by day
 */
export const fetchSalesByDay = async (startDate, endDate) => {
  try {
    console.log(`Fetching sales data from: ${RECEIPT_API_URL}/api/sales/days with range:`, startDate, 'to', endDate);
    
    // แก้ไขให้ใช้ RECEIPT_API_URL แทน SALES_API_URL และส่งพารามิเตอร์ในรูปแบบที่ถูกต้อง
    const response = await axios.get(`${RECEIPT_API_URL}/api/sales/days`, {
      params: {
        startDate: startDate,
        endDate: endDate
      },
      timeout: 10000
    });
    
    return response.data;
  } catch (error) {
    // ถ้าเกิดข้อผิดพลาด ส่งข้อมูลเปล่ากลับไป
    return handleApiError(error, [], "Error fetching sales data");
  }
};

/**
 * Save buffer settings for items
 * @param {Array} bufferSettings - Buffer settings for items
 * @returns {Promise<Object>} - Response message
 */
export const saveBufferSettings = async (bufferSettings) => {
  try {
    console.log(`Saving buffer settings to: ${PO_API_URL}/api/po/buffers`, bufferSettings);
    const response = await axios.post(`${PO_API_URL}/api/po/buffers`, bufferSettings, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    return response.data;
  } catch (error) {
    return handleApiError(error, { success: false, message: "Failed to save buffer settings" }, "Error saving buffer settings");
  }
};

/**
 * Create a new purchase order
 * @param {Object} poData - Purchase order data
 * @returns {Promise<Object>} - Created PO data
 */
export const createPO = async (poData) => {
  try {
    console.log(`Creating PO at: ${PO_API_URL}/api/po/create`, poData);
    const response = await axios.post(`${PO_API_URL}/api/po/create`, poData, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    return response.data;
  } catch (error) {
    return handleApiError(error, { success: false, message: "Failed to create PO" }, "Error creating PO");
  }
};

/**
 * Send LINE notification about a purchase order
 * @param {Object} notificationData - Notification data
 * @returns {Promise<Object>} - Response message
 */
export const sendLineNotification = async (notificationData) => {
  try {
    console.log(`Sending Line notification to: ${PO_API_URL}/api/po/notify`, notificationData);
    const response = await axios.post(`${PO_API_URL}/api/po/notify`, notificationData, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    return response.data;
  } catch (error) {
    return handleApiError(error, { success: false, message: "Failed to send notification" }, "Error sending LINE notification");
  }
};

/**
 * Fetch buffer settings for items
 * @param {Array} itemIds - Array of item IDs
 * @returns {Promise<Object>} - Buffer settings by item ID
 */
export const fetchBufferSettings = async (itemIds) => {
  if (!itemIds || itemIds.length === 0) {
    return {};
  }
  
  try {
    console.log(`Fetching buffer settings from: ${PO_API_URL}/api/po/buffers/batch with ${itemIds.length} items`);
    
    // แก้ไขวิธีการส่ง itemIds แบบที่ URL ไม่ยาวเกินไป
    // ใช้ POST แทน GET เพื่อส่ง itemIds เป็น request body
    const response = await axios.post(`${PO_API_URL}/api/po/buffers/batch`, 
      { item_ids: itemIds },
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );
    return response.data;
  } catch (error) {
    // ถ้าเกิดข้อผิดพลาด ให้ส่งข้อมูลเปล่ากลับไป
    console.error("Error fetching buffer settings:", error);
    return {};
  }
};