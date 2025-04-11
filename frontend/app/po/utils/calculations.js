// utils/calculations.js
/**
 * ประมวลผลข้อมูลสินค้าร่วมกับข้อมูลยอดขาย
 * @param {Array} inventoryData ข้อมูลสต็อกสินค้า
 * @param {Object} salesData ข้อมูลยอดขายตามวัน
 * @returns {Array} ข้อมูลสินค้าที่ประมวลผลแล้ว
 */
export const processItemsWithSalesData = (inventoryData, salesData) => {
    return inventoryData.map(item => {
      // สร้าง map ของยอดขายตามวัน
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
   * คำนวณยอดสั่งซื้อแนะนำ
   * @param {Object} item ข้อมูลสินค้า
   * @param {Date} targetDate วันที่ต้องการให้พอขาย
   * @returns {number} ยอดสั่งซื้อแนะนำ
   */
  export const calculateSuggestedOrderQuantity = (item, targetDate) => {
    if (!item || !targetDate) return 0;
    
    const dateKey = targetDate.toDateString();
    const projectedSales = item.dailySales[dateKey] || 0;
    
    // ยอดสั่งซื้อแนะนำ = ยอดขายในวันเป้าหมาย - สต็อกปัจจุบัน + ยอดเผื่อ
    let suggestedQuantity = projectedSales - item.currentStock + (item.buffer || 0);
    
    // กรณีไม่จำเป็นต้องสั่งเพิ่ม
    return Math.max(0, suggestedQuantity);
  };
  
  /**
   * จัดกลุ่มสินค้าตามซัพพลายเออร์
   * @param {Array} items รายการสินค้า
   * @returns {Object} สินค้าที่จัดกลุ่มตามซัพพลายเออร์
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
   * สร้างข้อความสำหรับส่งไลน์
   * @param {Array} items รายการสินค้า
   * @param {Date} deliveryDate วันที่รับสินค้า
   * @returns {string} ข้อความสำหรับส่งไลน์
   */
  export const generateLineMessage = (items, deliveryDate) => {
    const orderItems = items.filter(item => item.orderQuantity > 0);
    if (orderItems.length === 0) return '';
    
    const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    const deliveryDateStr = deliveryDate.toLocaleDateString('th-TH', dateOptions);
    
    let message = `แจ้งรายการสั่งซื้อสินค้า (${deliveryDateStr})\n\n`;
    
    // กลุ่มตามซัพพลายเออร์
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
   * คำนวณมูลค่ารวมของการสั่งซื้อ
   * @param {Array} items รายการสินค้า
   * @returns {number} มูลค่ารวม
   */
  export const calculateTotalOrderValue = (items) => {
    return items.reduce((total, item) => {
      return total + (item.orderQuantity * (item.unit_price || 0));
    }, 0);
  };
  
  /**
   * ฟอร์แมตจำนวนเงิน
   * @param {number} value จำนวนเงิน
   * @returns {string} จำนวนเงินที่ฟอร์แมตแล้ว
   */
  export const formatCurrency = (value) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 2
    }).format(value);
  };