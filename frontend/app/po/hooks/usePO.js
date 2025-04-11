// app/po/hooks/usePO.js
import { useState, useEffect, useCallback } from 'react';
import { 
  fetchInventoryData,
  fetchSalesByDay,
  saveBufferSettings,
  sendLineNotification,
  createPO,
  fetchBufferSettings
} from '@/app/api/poService';

// ฟังก์ชันช่วยในการจัดการรูปแบบวันที่
const formatDateForAPI = (date) => {
  if (!date) return '';
  
  // ให้แน่ใจว่าเป็น Date object
  const dateObj = new Date(date);
  
  // สร้างรูปแบบ ISO ที่มีข้อมูล timezone (เช่น 2025-03-31T17:00:00.000Z)
  return dateObj.toISOString();
};

// ฟังก์ชันสำหรับตัดรหัสสินค้าและแปลงเป็นรูปแบบที่ต้องการ
const formatItemName = (itemName) => {
  if (!itemName) return '';
  
  // แยกชื่อสินค้าและรหัส ID ยาว
  const parts = itemName.split(' ');
  const productId = parts[0]; // รหัสสินค้า (เช่น P101)
  
  // ตัดส่วนรหัส ID ยาวออก
  return parts.filter(part => !part.includes('-')).join(' ');
};

// ฟังก์ชันสำหรับดึงรหัสสินค้าสั้น (เช่น P101)
const extractProductCode = (itemName) => {
  if (!itemName) return '';
  
  // กรณีที่ชื่อสินค้าเริ่มต้นด้วย P ตามด้วยตัวเลข (เช่น P101)
  const match = itemName.match(/^(P\d+)/);
  return match ? match[1] : '';
};

// รายชื่อซัพพลายเออร์ที่ต้องการเรียงลำดับ
const supplierOrder = [
  'หมูลุงรวย', 
  'จัมโบ้', 
  'ลูกชิ้น', 
  'อั่ว', 
  'เนื้อริบอาย', 
  'เนื้อโคขุน', 
  'แหนมเล็ก', 
  'แหนมใหญ่'
];

const usePO = () => {
  const [items, setItems] = useState([]);
  const [deliveryDate, setDeliveryDate] = useState(new Date());
  const [targetCoverageDate, setTargetCoverageDate] = useState(null);
  const [futureDates, setFutureDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [storeStocks, setStoreStocks] = useState({});
  const [editingBuffers, setEditingBuffers] = useState(false);
  const [processingAction, setProcessingAction] = useState(false);
  const [alert, setAlert] = useState(null);
  const [error, setError] = useState(null);
  const [showSendLineDialog, setShowSendLineDialog] = useState(false);
  const [showCreatePODialog, setShowCreatePODialog] = useState(false);
  const [lineGroups, setLineGroups] = useState([]);
  const [lineMessage, setLineMessage] = useState('');
  const [lineNote, setLineNote] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [salesData, setSalesData] = useState([]);
  const [groupedItems, setGroupedItems] = useState({});
  
  // Create future dates for projection when delivery date changes
  useEffect(() => {
    const generateFutureDates = () => {
      const dates = [];
      const current = new Date(deliveryDate);
      
      // Create 3 future dates starting from delivery date
      for (let i = 0; i < 3; i++) {
        const date = new Date(current);
        date.setDate(date.getDate() + i);
        dates.push(date);
      }
      
      setFutureDates(dates);
      
      // Default target date to delivery date + 2 (third day)
      if (!targetCoverageDate || targetCoverageDate < current) {
        const defaultTarget = new Date(current);
        defaultTarget.setDate(defaultTarget.getDate() + 2);
        setTargetCoverageDate(defaultTarget);
      }
    };
    
    generateFutureDates();
  }, [deliveryDate]);

  // Load inventory and sales data
  useEffect(() => {
    const loadData = async () => {
      if (futureDates.length === 0) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // 1. Fetch inventory data
        let inventoryData = await fetchInventoryData();
        console.log('Inventory data loaded:', inventoryData);
        
        if (!inventoryData || inventoryData.length === 0) {
          console.warn('No inventory data available');
          setLoading(false);
          setError(new Error('ไม่พบข้อมูลสินค้าในระบบ'));
          return;
        }
        
        // 2. Calculate date range for sales data
        const oneWeekBefore = new Date(deliveryDate);
        oneWeekBefore.setDate(oneWeekBefore.getDate() - 7);
        
        const endDateObj = targetCoverageDate || futureDates[2];
        
        // 3. Fetch sales data - ส่งในรูปแบบที่ถูกต้อง (ISO string พร้อม timezone)
        // ปรับปรุงให้เวลาที่ส่งเป็น evening time (17:00:00) และ end time (16:59:59.999)
        // เพื่อให้ครอบคลุมทั้งวันในเขตเวลาไทย
        const startDateISO = new Date(oneWeekBefore);
        startDateISO.setHours(17, 0, 0, 0); // 17:00:00 UTC = 00:00 GMT+7
        
        const endDateISO = new Date(endDateObj);
        endDateISO.setHours(16, 59, 59, 999); // 16:59:59.999 UTC = 23:59:59.999 GMT+7
        
        let salesDataResponse = await fetchSalesByDay(
          startDateISO.toISOString(),
          endDateISO.toISOString()
        );
        
        console.log('Sales data loaded:', salesDataResponse);
        setSalesData(salesDataResponse);
        
        // 4. Process inventory data
        // กรอง stores ที่ไม่ต้องการออก
        const filteredInventoryData = inventoryData.filter(item => 
          !item.store_name.includes("รถส่งของ") && 
          !item.store_name.includes("อื่นๆ")
        );
        
        // สร้าง map เพื่อรวมข้อมูลสินค้าเดียวกันจากหลายสาขา
        const itemsMap = new Map();
        
        filteredInventoryData.forEach(item => {
          const itemId = item.item_id;
          const formattedItemName = formatItemName(item.item_name);
          const productCode = extractProductCode(item.item_name);
          
          // ถ้ามีสินค้านี้แล้วในแมพ ให้เพิ่มยอดสต็อก
          if (itemsMap.has(itemId)) {
            const existingItem = itemsMap.get(itemId);
            existingItem.currentStock += item.in_stock;
            
            // เก็บข้อมูลสต็อกตามสาขา
            if (!existingItem.stockByStore) {
              existingItem.stockByStore = [];
            }
            
            existingItem.stockByStore.push({
              store_name: item.store_name,
              in_stock: item.in_stock
            });
          } else {
            // สร้างข้อมูลสินค้าใหม่
            const newItem = {
              id: itemId,
              name: formattedItemName,
              code: productCode,
              currentStock: item.in_stock || 0,
              supplier: item.supplier_name,
              category: item.category_name,
              buffer: 0, // จะถูกอัปเดตในภายหลัง
              dailySales: {},
              stockByStore: [{
                store_name: item.store_name,
                in_stock: item.in_stock
              }],
              orderQuantity: 0,
              suggestedOrderQuantity: 0
            };
            
            itemsMap.set(itemId, newItem);
          }
        });
        
        // แปลงแมพเป็นอาร์เรย์
        const processedItems = Array.from(itemsMap.values());
        
        // 5. Process store stocks
        const storeStocksObj = {};
        processedItems.forEach(item => {
          storeStocksObj[item.id] = {};
          
          if (Array.isArray(item.stockByStore)) {
            item.stockByStore.forEach(store => {
              const storeName = store.store_name;
              const quantity = store.in_stock || 0;
              storeStocksObj[item.id][storeName] = quantity;
            });
          }
        });
        
        // 6. Fetch buffer settings or use default
        try {
          const itemIds = processedItems.map(item => item.id);
          const bufferSettings = await fetchBufferSettings(itemIds);
          
          // ตั้งค่า buffer สำหรับแต่ละรายการ
          processedItems.forEach(item => {
            item.buffer = bufferSettings[item.id] || 10; // default to 10 if not found
          });
          console.log("Successfully applied buffer settings to items");
        } catch (bufferError) {
          console.warn('Error fetching buffer settings, using default values:', bufferError);
          // ถ้าไม่สามารถดึง buffer ได้ ใช้ค่าเริ่มต้น
          processedItems.forEach(item => {
            item.buffer = 10; // default buffer value
          });
        }
        
        // 7. Process sales data into the items
        if (salesDataResponse && Array.isArray(salesDataResponse)) {
          salesDataResponse.forEach(sale => {
            const dateStr = typeof sale.sale_date === 'string' ? sale.sale_date : formatDateForAPI(new Date(sale.sale_date));
            
            // Find the item and add the sale
            const item = processedItems.find(i => i.id === sale.item_id);
            if (item) {
              item.dailySales[dateStr] = sale.total_quantity;
            }
          });
        }
        
        // 8. Group items by supplier
        const groupedBySupplier = processedItems.reduce((groups, item) => {
          const supplier = item.supplier || 'ไม่ระบุซัพพลายเออร์';
          if (!groups[supplier]) {
            groups[supplier] = [];
          }
          groups[supplier].push(item);
          return groups;
        }, {});
        
        // 9. Sort suppliers according to predefined order
        const sortedGroups = {};
        
        // First add suppliers in the predefined order
        supplierOrder.forEach(supplier => {
          if (groupedBySupplier[supplier]) {
            sortedGroups[supplier] = groupedBySupplier[supplier];
          }
        });
        
        // Then add any other suppliers
        Object.keys(groupedBySupplier).forEach(supplier => {
          if (!supplierOrder.includes(supplier)) {
            sortedGroups[supplier] = groupedBySupplier[supplier];
          }
        });
        
        setGroupedItems(sortedGroups);
        setItems(processedItems);
        setStoreStocks(storeStocksObj);
        
        // 10. Calculate projected sales and suggestions
        if (targetCoverageDate) {
          calculateProjectedSales(processedItems, targetCoverageDate);
        }
      } catch (err) {
        console.error("Error loading data:", err);
        setError(err);
        setAlert({
          message: "ไม่สามารถโหลดข้อมูลได้",
          type: "error",
          description: err.message
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [deliveryDate, futureDates]);
  
  // Update quantities when target date changes
  useEffect(() => {
    if (targetCoverageDate && items.length > 0) {
      calculateProjectedSales(items, targetCoverageDate);
    }
  }, [targetCoverageDate]);
  
  // Calculate projected sales and suggested order quantities
  const calculateProjectedSales = (itemsToCalculate, targetDate) => {
    // ทำให้แน่ใจว่า targetDate อยู่ในรูปแบบที่ถูกต้อง
            // ใช้วันที่ (เฉพาะ YYYY-MM-DD) โดยตัดเวลาออก
        const targetDateStr = formatDateForAPI(targetDate).split('T')[0];
    
    // Sort dates in ascending order for accumulation
    // เราต้องการเฉพาะส่วนวันที่ (YYYY-MM-DD) สำหรับใช้เป็น key
    const sortedDates = futureDates
      .map(date => formatDateForAPI(date).split('T')[0])
      .sort();
    
    // Clone items to avoid mutations while calculating
    const updatedItems = itemsToCalculate.map(item => {
      // Start with current stock
      let remainingStock = item.currentStock;
      
      // Calculate remaining stock for each day
      const projectedStock = {};
      let accumulatedSales = 0;
      
      sortedDates.forEach(dateStr => {
        const dailySale = item.dailySales[dateStr] || 0;
        accumulatedSales += dailySale;
        remainingStock -= dailySale;
        projectedStock[dateStr] = remainingStock;
      });
      
      // Determine if we need to order based on target date
      let suggestedQuantity = 0;
      
      // If projected stock on target date is negative, we need to order
      if (projectedStock[targetDateStr] < 0) {
        // Order enough to cover negative stock plus the buffer
        suggestedQuantity = Math.abs(projectedStock[targetDateStr]) + (item.buffer || 0);
      } else if (projectedStock[targetDateStr] < (item.buffer || 0)) {
        // If projected stock is less than buffer, order to reach buffer level
        suggestedQuantity = (item.buffer || 0) - projectedStock[targetDateStr];
      }
      
      // Round up suggested quantity
      suggestedQuantity = Math.ceil(suggestedQuantity);
      
      return {
        ...item,
        projectedStock,
        accumulatedSales,
        suggestedOrderQuantity: suggestedQuantity,
        orderQuantity: suggestedQuantity // Default order quantity to suggested
      };
    });
    
    setItems(updatedItems);
    
    // Update grouped items too
    const updatedGroupedItems = {};
    
    Object.keys(groupedItems).forEach(supplier => {
      updatedGroupedItems[supplier] = groupedItems[supplier].map(groupItem => {
        const updatedItem = updatedItems.find(item => item.id === groupItem.id);
        return updatedItem || groupItem;
      });
    });
    
    setGroupedItems(updatedGroupedItems);
  };
  
  // Update buffer quantities
  const handleBufferChange = useCallback((itemId, value) => {
    setItems(prevItems => 
      prevItems.map(item => {
        if (item.id === itemId) {
          const updatedItem = {
            ...item,
            buffer: value
          };
          
          // Recalculate suggested quantity if target date exists
          if (targetCoverageDate) {
            const targetDateStr = formatDateForAPI(targetCoverageDate);
            const projectedStock = item.projectedStock || {};
            
            let suggestedQuantity = 0;
            if (projectedStock[targetDateStr] < 0) {
              suggestedQuantity = Math.abs(projectedStock[targetDateStr]) + value;
            } else if (projectedStock[targetDateStr] < value) {
              suggestedQuantity = value - projectedStock[targetDateStr];
            }
            
            updatedItem.suggestedOrderQuantity = Math.ceil(suggestedQuantity);
            updatedItem.orderQuantity = Math.ceil(suggestedQuantity);
          }
          
          return updatedItem;
        }
        return item;
      })
    );
    
    // Update in grouped items too
    setGroupedItems(prevGrouped => {
      const newGrouped = {};
      Object.keys(prevGrouped).forEach(supplier => {
        newGrouped[supplier] = prevGrouped[supplier].map(groupItem => {
          if (groupItem.id === itemId) {
            const updatedItem = {
              ...groupItem,
              buffer: value
            };
            
            // Recalculate suggested quantity if target date exists
            if (targetCoverageDate) {
              const targetDateStr = formatDateForAPI(targetCoverageDate);
              const projectedStock = groupItem.projectedStock || {};
              
              let suggestedQuantity = 0;
              if (projectedStock[targetDateStr] < 0) {
                suggestedQuantity = Math.abs(projectedStock[targetDateStr]) + value;
              } else if (projectedStock[targetDateStr] < value) {
                suggestedQuantity = value - projectedStock[targetDateStr];
              }
              
              updatedItem.suggestedOrderQuantity = Math.ceil(suggestedQuantity);
              updatedItem.orderQuantity = Math.ceil(suggestedQuantity);
            }
            
            return updatedItem;
          }
          return groupItem;
        });
      });
      return newGrouped;
    });
  }, [targetCoverageDate, groupedItems]);
  
  // Update order quantities
  const handleOrderQuantityChange = useCallback((itemId, value) => {
    setItems(prevItems => 
      prevItems.map(item => {
        if (item.id === itemId) {
          return {
            ...item,
            orderQuantity: value
          };
        }
        return item;
      })
    );
    
    // Update in grouped items too
    setGroupedItems(prevGrouped => {
      const newGrouped = {};
      Object.keys(prevGrouped).forEach(supplier => {
        newGrouped[supplier] = prevGrouped[supplier].map(groupItem => {
          if (groupItem.id === itemId) {
            return {
              ...groupItem,
              orderQuantity: value
            };
          }
          return groupItem;
        });
      });
      return newGrouped;
    });
  }, []);
  
  // Save buffer settings
  const handleSaveBuffers = useCallback(async () => {
    setProcessingAction(true);
    try {
      // Prepare buffer settings data for API
      const bufferSettings = items.map(item => ({
        item_id: item.id,
        reserve_quantity: item.buffer || 0
      }));
      
      const result = await saveBufferSettings(bufferSettings);
      
      if (result.success) {
        setAlert({
          message: result.offline 
            ? "บันทึกยอดเผื่อสำเร็จ (โหมดออฟไลน์)" 
            : "บันทึกยอดเผื่อสำเร็จ",
          type: "success",
          description: result.offline 
            ? "ข้อมูลจะถูกซิงค์เมื่อมีการเชื่อมต่ออินเทอร์เน็ต" 
            : undefined
        });
        
        setEditingBuffers(false);
      } else {
        throw new Error(result.message || "ไม่สามารถบันทึกได้");
      }
    } catch (err) {
      console.error("Error saving buffer settings:", err);
      setAlert({
        message: "ไม่สามารถบันทึกยอดเผื่อได้",
        type: "error",
        description: err.message
      });
    } finally {
      setProcessingAction(false);
    }
  }, [items]);
  
  // Generate LINE notification by supplier
  const generateSupplierMessage = (supplier, supplierItems) => {
    const itemsWithQty = supplierItems.filter(item => item.orderQuantity > 0);
    
    if (itemsWithQty.length === 0) return '';
    
    let message = `**${supplier}**\n`;
    itemsWithQty.forEach((item, idx) => {
      message += `${idx + 1}. ${item.code ? `${item.code} ` : ''}${item.name} จำนวน ${item.orderQuantity} ชิ้น\n`;
    });
    
    return message + '\n';
  };
  
  // Open LINE notification dialog
  const handleOpenSendLineDialog = useCallback(() => {
    // Generate default message if empty
    if (!lineMessage) {
      let message = `รายการสั่งซื้อสินค้า วันที่ ${deliveryDate.toLocaleDateString('th-TH')}\n\n`;
      
      // Generate message by supplier
      Object.entries(groupedItems).forEach(([supplier, supplierItems]) => {
        const supplierMessage = generateSupplierMessage(supplier, supplierItems);
        if (supplierMessage) {
          message += supplierMessage;
        }
      });
      
      setLineMessage(message);
    }
    
    setShowSendLineDialog(true);
  }, [groupedItems, deliveryDate, lineMessage]);
  
  // Close LINE notification dialog
  const handleCloseSendLineDialog = useCallback(() => {
    setShowSendLineDialog(false);
  }, []);
  
  // Send LINE notification
  const handleSendLineNotification = useCallback(async () => {
    setProcessingAction(true);
    try {
      if (selectedSupplier) {
        // ส่งเฉพาะซัพพลายเออร์ที่เลือก
        const supplierItems = groupedItems[selectedSupplier] || [];
        const itemsToSend = supplierItems.filter(item => item.orderQuantity > 0);
        
        if (itemsToSend.length === 0) {
          throw new Error(`ไม่มีรายการสั่งซื้อสำหรับ ${selectedSupplier}`);
        }
        
        // Prepare notification data for API
        const notificationData = {
          group_ids: lineGroups,
          po: {
            supplier_name: selectedSupplier,
            po_number: `PO-${formatDateForAPI(new Date())}`,
            delivery_date: formatDateForAPI(deliveryDate),
            total_amount: itemsToSend.reduce((total, item) => 
              total + (item.orderQuantity * (item.unit_price || 0)), 0),
            items: itemsToSend.map(item => ({
              item_name: `${item.code} ${item.name}`.trim(),
              quantity: item.orderQuantity
            }))
          }
        };
        
        // Override default message if custom message is provided
        if (lineMessage) {
          notificationData.custom_message = lineMessage;
        }
        
        // Add note if provided
        if (lineNote) {
          notificationData.note = lineNote;
        }
        
        await sendLineNotification(notificationData);
      } else {
        // ส่งแยกตามซัพพลายเออร์
        for (const [supplier, supplierItems] of Object.entries(groupedItems)) {
          const itemsToSend = supplierItems.filter(item => item.orderQuantity > 0);
          
          if (itemsToSend.length === 0) continue;
          
          // สร้างข้อความเฉพาะสำหรับซัพพลายเออร์นี้
          let supplierMessage = `รายการสั่งซื้อสินค้า ${supplier} วันที่ ${deliveryDate.toLocaleDateString('th-TH')}\n\n`;
          
          itemsToSend.forEach((item, idx) => {
            supplierMessage += `${idx + 1}. ${item.code ? `${item.code} ` : ''}${item.name} จำนวน ${item.orderQuantity} ชิ้น\n`;
          });
          
          // Prepare notification data for API
          const notificationData = {
            group_ids: lineGroups,
            po: {
              supplier_name: supplier,
              po_number: `PO-${formatDateForAPI(new Date())}-${supplier}`,
              delivery_date: formatDateForAPI(deliveryDate),
              total_amount: itemsToSend.reduce((total, item) => 
                total + (item.orderQuantity * (item.unit_price || 0)), 0),
              items: itemsToSend.map(item => ({
                item_name: `${item.code} ${item.name}`.trim(),
                quantity: item.orderQuantity
              }))
            },
            custom_message: supplierMessage
          };
          
          // Add note if provided
          if (lineNote) {
            notificationData.note = lineNote;
          }
          
          await sendLineNotification(notificationData);
        }
      }
      
      setAlert({
        message: "ส่งแจ้งเตือน LINE สำเร็จ",
        type: "success"
      });
      
      setShowSendLineDialog(false);
    } catch (err) {
      console.error("Error sending LINE notification:", err);
      setAlert({
        message: "ไม่สามารถส่งแจ้งเตือน LINE ได้",
        type: "error",
        description: err.message
      });
    } finally {
      setProcessingAction(false);
    }
  }, [items, deliveryDate, lineGroups, lineMessage, lineNote, selectedSupplier, groupedItems]);
  
  // Open create PO dialog
  const handleOpenCreatePODialog = useCallback(() => {
    setShowCreatePODialog(true);
  }, []);
  
  // Close create PO dialog
  const handleCloseCreatePODialog = useCallback(() => {
    setShowCreatePODialog(false);
  }, []);
  
  // Create purchase order
  const handleCreatePO = useCallback(async () => {
    setProcessingAction(true);
    try {
      if (selectedSupplier) {
        // สร้าง PO เฉพาะซัพพลายเออร์ที่เลือก
        const supplierItems = groupedItems[selectedSupplier] || [];
        const itemsToOrder = supplierItems
          .filter(item => item.orderQuantity > 0)
          .map(item => ({
            item_id: item.id,
            item_name: `${item.code} ${item.name}`.trim(),
            quantity: item.orderQuantity,
            suggested_quantity: item.suggestedOrderQuantity,
            unit_price: item.unit_price || 0,
            total_price: item.orderQuantity * (item.unit_price || 0),
            buffer: item.buffer || 0,
            current_stock: item.currentStock || 0,
            projected_stock: (item.currentStock || 0) - (item.buffer || 0)
          }));
        
        if (itemsToOrder.length === 0) {
          throw new Error(`ไม่มีรายการสั่งซื้อสำหรับ ${selectedSupplier}`);
        }
        
        // Calculate total amount
        const totalAmount = itemsToOrder.reduce(
          (total, item) => total + item.total_price, 0
        );
        
        // Create PO data for API
        const poData = {
          supplier_id: selectedSupplier,
          supplier_name: selectedSupplier,
          status: "pending",
          delivery_date: formatDateForAPI(deliveryDate),
          target_coverage_date: formatDateForAPI(targetCoverageDate || deliveryDate),
          total_amount: totalAmount,
          items: itemsToOrder,
          notes: "",
          created_by: "system"
        };
        
        const createdPO = await createPO(poData);
        
        setAlert({
          message: `สร้างใบสั่งซื้อสำหรับ ${selectedSupplier} สำเร็จ`,
          type: "success",
          description: `เลขที่ใบสั่งซื้อ: ${createdPO.po_number || 'PO-TEMP'}`
        });
      } else {
        // สร้าง PO แยกตามซัพพลายเออร์
        let successCount = 0;
        
        for (const [supplier, supplierItems] of Object.entries(groupedItems)) {
          const itemsToOrder = supplierItems
            .filter(item => item.orderQuantity > 0)
            .map(item => ({
              item_id: item.id,
              item_name: `${item.code} ${item.name}`.trim(),
              quantity: item.orderQuantity,
              suggested_quantity: item.suggestedOrderQuantity,
              unit_price: item.unit_price || 0,
              total_price: item.orderQuantity * (item.unit_price || 0),
              buffer: item.buffer || 0,
              current_stock: item.currentStock || 0,
              projected_stock: (item.currentStock || 0) - (item.buffer || 0)
            }));
          
          if (itemsToOrder.length === 0) continue;
          
          // Calculate total amount
          const totalAmount = itemsToOrder.reduce(
            (total, item) => total + item.total_price, 0
          );
          
          // Create PO data for API
          const poData = {
            supplier_id: supplier,
            supplier_name: supplier,
            status: "pending",
            delivery_date: formatDateForAPI(deliveryDate),
            target_coverage_date: formatDateForAPI(targetCoverageDate || deliveryDate),
            total_amount: totalAmount,
            items: itemsToOrder,
            notes: "",
            created_by: "system"
          };
          
          await createPO(poData);
          successCount++;
        }
        
        if (successCount > 0) {
          setAlert({
            message: `สร้างใบสั่งซื้อสำเร็จ ${successCount} ใบ`,
            type: "success"
          });
        } else {
          throw new Error("ไม่มีรายการสั่งซื้อที่เลือก");
        }
      }
      
      setShowCreatePODialog(false);
    } catch (err) {
      console.error("Error creating PO:", err);
      setAlert({
        message: "ไม่สามารถสร้างใบสั่งซื้อได้",
        type: "error",
        description: err.message
      });
    } finally {
      setProcessingAction(false);
    }
  }, [groupedItems, selectedSupplier, deliveryDate, targetCoverageDate]);
  
  return {
    items,
    groupedItems,
    deliveryDate,
    setDeliveryDate,
    targetCoverageDate,
    setTargetCoverageDate,
    futureDates,
    loading,
    storeStocks,
    editingBuffers,
    setEditingBuffers,
    processingAction,
    handleBufferChange,
    handleOrderQuantityChange,
    handleSaveBuffers,
    // LINE notification
    showSendLineDialog,
    handleOpenSendLineDialog,
    handleCloseSendLineDialog,
    handleSendLineNotification,
    lineGroups,
    setLineGroups,
    lineMessage,
    setLineMessage,
    lineNote,
    setLineNote,
    // Create PO
    showCreatePODialog,
    handleOpenCreatePODialog,
    handleCloseCreatePODialog,
    handleCreatePO,
    selectedSupplier,
    setSelectedSupplier,
    // UI state
    alert,
    setAlert,
    error,
    // Sales data
    salesData
  };
};

export default usePO;