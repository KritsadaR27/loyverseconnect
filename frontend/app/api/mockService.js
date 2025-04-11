// frontend/app/api/mockService.js
/**
 * Mock service to provide fallback data when the backend API is unavailable
 */

// Generate random number between min and max
const randomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Generate random date within range
const randomDate = (start, end) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

// Format date as ISO string
const formatDateISO = (date) => {
  return date.toISOString();
};

/**
 * Generate mock inventory data
 * @param {number} count Number of items to generate
 * @returns {Array} Mock inventory items
 */
export const generateMockInventoryData = (count = 15) => {
  const suppliers = [
    { id: 'sup_001', name: 'หมูลุงรวย' },
    { id: 'sup_002', name: 'จัมโบ้' },
    { id: 'sup_003', name: 'ลูกชิ้น' },
    { id: 'sup_004', name: 'อั่ว' },
    { id: 'sup_005', name: 'เนื้อริบอาย' },
    { id: 'sup_006', name: 'เนื้อโคขุน' },
    { id: 'sup_007', name: 'แหนมเล็ก' },
    { id: 'sup_008', name: 'แหนมใหญ่' }
  ];
  
  const categories = [
    { id: 'cat_001', name: 'เนื้อหมู' },
    { id: 'cat_002', name: 'เนื้อวัว' },
    { id: 'cat_003', name: 'ลูกชิ้น' },
    { id: 'cat_004', name: 'แหนม' },
    { id: 'cat_005', name: 'ผลิตภัณฑ์แปรรูป' }
  ];
  
  const items = [];
  
  for (let i = 1; i <= count; i++) {
    const supplier = suppliers[randomNumber(0, suppliers.length - 1)];
    const category = categories[randomNumber(0, categories.length - 1)];
    const currentStock = randomNumber(5, 100);
    const reserveQuantity = randomNumber(5, 15);
    
    items.push({
      id: `item_${i.toString().padStart(3, '0')}`,
      name: `สินค้าตัวอย่าง ${i}`,
      sku: `SKU${i.toString().padStart(4, '0')}`,
      currentStock,
      reserve_quantity: reserveQuantity,
      projected_stock: currentStock - reserveQuantity,
      unit_price: randomNumber(5, 20) * 10,
      cost: randomNumber(3, 15) * 10,
      selling_price: randomNumber(8, 25) * 10,
      supplier_id: supplier.id,
      supplier_name: supplier.name,
      category_id: category.id,
      category_name: category.name
    });
  }
  
  return items;
};

/**
 * Generate mock sales data for specified dates
 * @param {Array} dates Array of dates to generate sales for
 * @returns {Object} Mock sales data by day
 */
export const generateMockSalesData = (dates, items) => {
  const days = dates.map(date => {
    const dateString = date.toISOString();
    
    return {
      date: dateString,
      items: items.map(item => ({
        item_id: item.id,
        quantity: randomNumber(0, 20)
      }))
    };
  });
  
  return { days };
};

/**
 * Generate mock store stocks for items
 * @param {Array} itemIds Array of item IDs
 * @returns {Object} Mock store stocks by item ID
 */
export const generateMockStoreStocks = (items) => {
  const stores = [
    { id: 'store_001', name: 'ลุงรวย สาขาโกดังปทุม' },
    { id: 'store_002', name: 'ลุงรวย สาขาปทุมธานี' },
    { id: 'store_003', name: 'ลุงรวย สาขาโรงไก่' },
    { id: 'store_004', name: 'ลุงรวย สาขารังสิต' },
    { id: 'store_005', name: 'ลุงรวย สาขาคลอง4' }
  ];
  
  const storeStocks = {};
  
  items.forEach(item => {
    storeStocks[item.id] = stores.map(store => ({
      store_id: store.id,
      store_name: store.name,
      in_stock: randomNumber(1, 30)
    }));
  });
  
  return storeStocks;
};

/**
 * Generate mock line groups
 * @returns {Array} Mock LINE groups
 */
export const generateMockLineGroups = () => {
  return [
    { id: 'line_001', name: 'แจ้งเตือนสต็อกหมู' },
    { id: 'line_002', name: 'แจ้งเตือนสต็อกวัว' },
    { id: 'line_003', name: 'แจ้งเตือนสต็อกลูกชิ้น' },
    { id: 'line_004', name: 'แจ้งเตือนสต็อกแหนม' }
  ];
};

// Expose mock functions for PO service
export const mockPOService = {
  /**
   * Mock function to fetch inventory data
   * @returns {Promise<Array>} Mock inventory items
   */
  fetchInventoryData: () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(generateMockInventoryData());
      }, 300);
    });
  },
  
  /**
   * Mock function to fetch sales data for specified dates
   * @param {Array} dates Array of dates to fetch sales for
   * @returns {Promise<Object>} Mock sales data by day
   */
  fetchSalesData: (dates) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const items = generateMockInventoryData();
        resolve(generateMockSalesData(dates, items));
      }, 300);
    });
  },
  
  /**
   * Mock function to fetch store stock levels
   * @param {Array} itemIds Array of item IDs
   * @returns {Promise<Object>} Mock store stocks by item ID
   */
  fetchStoreStocks: (itemIds) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const items = itemIds.map(id => ({ id }));
        resolve(generateMockStoreStocks(items));
      }, 300);
    });
  },
  
  /**
   * Mock function to save buffer quantities
   * @param {Array} items Items with buffer quantities
   * @returns {Promise<Object>} Mock save result
   */
  saveBufferQuantities: (items) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, message: "Buffer quantities saved successfully" });
      }, 300);
    });
  },
  
  /**
   * Mock function to send LINE notification
   * @param {Object} notificationData Notification data
   * @returns {Promise<Object>} Mock notification result
   */
  sendLineNotification: (notificationData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, message: "LINE notification sent successfully" });
      }, 300);
    });
  },
  
  /**
   * Mock function to generate purchase order
   * @param {Object} purchaseOrderData Purchase order data
   * @returns {Promise<Object>} Mock generated purchase order
   */
  generatePurchaseOrder: (purchaseOrderData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          po_number: `PO-${new Date().getFullYear()}${new Date().getMonth() + 1}${new Date().getDate()}-${randomNumber(1000, 9999)}`,
          supplier_id: purchaseOrderData.supplier_id,
          delivery_date: purchaseOrderData.delivery_date,
          total_items: purchaseOrderData.items.length,
          total_amount: purchaseOrderData.total_amount
        });
      }, 300);
    });
  }
};