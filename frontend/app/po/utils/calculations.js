// app/po/utils/calculations.js
/**
 * Process item data with sales data
 * @param {Array} inventoryData Inventory stock data
 * @param {Object} salesData Sales data by day
 * @returns {Array} Processed items with sales data
 */
export const processItemsWithSalesData = (inventoryData, salesData) => {
    return inventoryData.map(item => {
      // Create map of sales by day
      const dailySales = {};
      
      if (salesData && salesData.days) {
        salesData.days.forEach(dayData => {
          const dateKey = new Date(dayData.date).toDateString();
          const itemSale = dayData.items.find(sale => sale.item_id === item.id);
          dailySales[dateKey] = itemSale ? itemSale.quantity : 0;
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
    
    const dateKey = targetDate.toDateString();
    const projectedSales = item.dailySales[dateKey] || 0;
    
    // Suggested quantity = target date sales - current stock + buffer
    let suggestedQuantity = projectedSales - item.currentStock + (item.buffer || 0);
    
    // No need to order if suggested quantity is negative
    return Math.max(0, suggestedQuantity);
  };
  
  /**
   * Group items by supplier
   * @param {Array} items Item list
   * @returns {Object} Items grouped by supplier
   */
  export const groupItemsBySupplier = (items) => {
    return items.reduce((grouped, item) => {
      if (!item.supplier_id || item.orderQuantity <= 0) return grouped;
      
      if (!grouped[item.supplier_id]) {
        grouped[item.supplier_id] = {
          supplier_name: item.supplier_name,
          items: []
        };
      }
      
      grouped[item.supplier_id].items.push({
        id: item.id,
        name: item.name,
        sku: item.sku,
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
    const orderItems = items.filter(item => item.orderQuantity > 0);
    if (orderItems.length === 0) return '';
    
    const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    const deliveryDateStr = deliveryDate.toLocaleDateString('th-TH', dateOptions);
    
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
  };
  
  /**
   * Calculate total order value
   * @param {Array} items Order items
   * @returns {number} Total order value
   */
  export const calculateTotalOrderValue = (items) => {
    return items.reduce((total, item) => {
      return total + (item.orderQuantity * (item.unit_price || 0));
    }, 0);
  };