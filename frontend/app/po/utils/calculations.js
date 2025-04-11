// app/po/utils/calculations.js
/**
 * Process item data with sales data
 * @param {Array} inventoryData Inventory stock data
 * @param {Object} salesData Sales data by day
 * @returns {Array} Processed items with sales data
 */
export const processItemsWithSalesData = (inventoryData, salesData) => {
    // Ensure inventory data is an array
    if (!Array.isArray(inventoryData)) {
      console.error('Invalid inventory data format', inventoryData);
      inventoryData = [];
    }
    
    return inventoryData.map(item => {
      // Create map of sales by day
      const dailySales = {};
      
      if (salesData && salesData.days && Array.isArray(salesData.days)) {
        salesData.days.forEach(dayData => {
          try {
            const dateKey = new Date(dayData.date).toDateString();
            if (dayData.items && Array.isArray(dayData.items)) {
              const itemSale = dayData.items.find(sale => sale && sale.item_id === item.id);
              dailySales[dateKey] = itemSale ? itemSale.quantity : 0;
            }
          } catch (e) {
            console.error('Error processing sales day data', e, dayData);
          }
        });
      }
      
      return {
        ...item,
        dailySales,
        buffer: item.reserve_quantity || 0,
        orderQuantity: 0
      };
    });
  };
  
  /**
   * Calculate suggested order quantity
   * @param {Object} item Item data
   * @param {Date} targetDate Target date for coverage
   * @returns {number} Suggested order quantity
   */
  export const calculateSuggestedOrderQuantity = (item, targetDate) => {
    if (!item || !targetDate) return 0;
    
    try {
      const dateKey = targetDate.toDateString();
      const projectedSales = item.dailySales && item.dailySales[dateKey] || 0;
      
      // Suggested quantity = target date sales - current stock + buffer
      let suggestedQuantity = projectedSales - (item.currentStock || 0) + (item.buffer || 0);
      
      // No need to order if suggested quantity is negative
      return Math.max(0, Math.round(suggestedQuantity));
    } catch (e) {
      console.error('Error calculating suggested order quantity', e, item, targetDate);
      return 0;
    }
  };
  
  /**
   * Group items by supplier
   * @param {Array} items Item list
   * @returns {Object} Items grouped by supplier
   */
  export const groupItemsBySupplier = (items) => {
    if (!Array.isArray(items)) {
      console.error('Invalid items format for grouping', items);
      return {};
    }
    
    return items.reduce((grouped, item) => {
      if (!item || !item.supplier_id || !item.orderQuantity || item.orderQuantity <= 0) return grouped;
      
      if (!grouped[item.supplier_id]) {
        grouped[item.supplier_id] = {
          supplier_name: item.supplier_name || 'Unknown Supplier',
          items: []
        };
      }
      
      grouped[item.supplier_id].items.push({
        id: item.id,
        name: item.name || 'Unknown Item',
        sku: item.sku || '',
        quantity: item.orderQuantity,
        unit_price: item.unit_price || 0
      });
      
      return grouped;
    }, {});
  };
  
  /**
   * Generate LINE message for order notification
   * @param {Array} items Order items
   * @param {Date} deliveryDate Delivery date
   * @returns {string} Formatted LINE message
   */
  export const generateLineMessage = (items, deliveryDate) => {
    if (!Array.isArray(items) || items.length === 0) {
      return 'ไม่มีรายการสั่งซื้อ';
    }
    
    try {
      const orderItems = items.filter(item => item && item.orderQuantity > 0);
      if (orderItems.length === 0) return 'ไม่มีรายการสั่งซื้อ';
      
      const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
      const deliveryDateStr = deliveryDate instanceof Date ? 
        deliveryDate.toLocaleDateString('th-TH', dateOptions) : 
        new Date().toLocaleDateString('th-TH', dateOptions);
      
      let message = `แจ้งรายการสั่งซื้อสินค้า (${deliveryDateStr})\n\n`;
      
      // Group by supplier
      const groupedBySupplier = groupItemsBySupplier(orderItems);
      
      Object.entries(groupedBySupplier).forEach(([supplierId, supplierData]) => {
        message += `** ${supplierData.supplier_name} **\n`;
        
        supplierData.items.forEach((item, index) => {
          message += `${index + 1}. ${item.name} - ${item.quantity} ชิ้น\n`;
        });
        
        message += '\n';
      });
      
      message += 'กรุณาจัดส่งสินค้าตามวันที่ระบุ ขอบคุณครับ/ค่ะ';
      
      return message;
    } catch (e) {
      console.error('Error generating LINE message', e);
      return 'เกิดข้อผิดพลาดในการสร้างข้อความ';
    }
  };
  
  /**
   * Calculate total order value
   * @param {Array} items Order items
   * @returns {number} Total order value
   */
  export const calculateTotalOrderValue = (items) => {
    if (!Array.isArray(items)) {
      console.error('Invalid items format for calculating total', items);
      return 0;
    }
    
    return items.reduce((total, item) => {
      if (!item) return total;
      const quantity = item.orderQuantity || 0;
      const price = item.unit_price || 0;
      return total + (quantity * price);
    }, 0);
  };