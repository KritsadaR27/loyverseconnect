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
  
  // สร้างรูปแบบ YYYY-MM-DD
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

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

  // ฟังก์ชันสำหรับการสร้างข้อมูลตัวอย่างในกรณีที่ไม่มีข้อมูลจริง
  const generateMockData = () => {
    // สร้างข้อมูลสินค้าตัวอย่าง
    const sampleItems = [
      { id: 'P101', name: 'หมูปั้มตด ไม่เน็ด', currentStock: 322, supplier: 'ซัพพลายเออร์ A', category: 'เนื้อหมู' },
      { id: 'P102', name: 'หมูแดง', currentStock: 180, supplier: 'ซัพพลายเออร์ A', category: 'เนื้อหมู' },
      { id: 'P103', name: 'หมูชิ้น', currentStock: 205, supplier: 'ซัพพลายเออร์ B', category: 'เนื้อหมู' },
      { id: 'P104', name: 'เนื้อวากิว', currentStock: 140, supplier: 'ซัพพลายเออร์ C', category: 'เนื้อวัว' },
      { id: 'P105', name: 'ลูกชิ้นหมู', currentStock: 250, supplier: 'ซัพพลายเออร์ D', category: 'ลูกชิ้น' }
    ];
    
    // สร้างข้อมูลยอดขายตัวอย่าง
    const nowDate = new Date();
    const sampleSales = futureDates.map((date, index) => {
      // สร้างยอดขายที่แตกต่างกันในแต่ละวัน
      const dateStr = formatDateForAPI(date);
      return sampleItems.map(item => ({
        date: dateStr,
        item_id: item.id,
        quantity: 50 + (index * 25) + Math.floor(Math.random() * 30) // เพิ่มยอดขายในแต่ละวัน
      }));
    }).flat();
    
    return {
      items: sampleItems,
      sales: sampleSales
    };
  };

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
        
        // ถ้าไม่มีข้อมูลจริง ให้ใช้ข้อมูลตัวอย่าง
        if (!inventoryData || inventoryData.length === 0) {
          console.warn('No real inventory data available, using mock data');
          const mockData = generateMockData();
          inventoryData = mockData.items;
        }
        
        // 2. Calculate date range for sales data
        const oneWeekBefore = new Date(deliveryDate);
        oneWeekBefore.setDate(oneWeekBefore.getDate() - 7);
        
        const endDateObj = targetCoverageDate || futureDates[2];
        
        // 3. Fetch sales data - ส่งในรูปแบบที่ถูกต้อง
        let salesDataResponse = await fetchSalesByDay(
          formatDateForAPI(oneWeekBefore), 
          formatDateForAPI(endDateObj)
        );
        
        console.log('Sales data loaded:', salesDataResponse);
        
        // ถ้าไม่มีข้อมูลจริง ให้ใช้ข้อมูลตัวอย่าง
        if (!salesDataResponse || salesDataResponse.length === 0) {
          console.warn('No real sales data available, using mock data');
          const mockData = generateMockData();
          salesDataResponse = mockData.sales;
        }
        
        setSalesData(salesDataResponse);
        
        // 4. Process inventory data
        const processedItems = inventoryData.map(item => {
          // Initialize with inventory data
          return {
            id: item.id || item.item_id,
            name: item.name || item.item_name,
            sku: item.id || item.item_id, // Using item_id as SKU if not available
            currentStock: item.currentStock || item.in_stock,
            supplier: item.supplier || item.supplier_name,
            category: item.category || item.category_name,
            buffer: 0, // Default buffer to 0, will be updated later
            dailySales: {}, // Will be populated below
            stockByStore: item.stockByStore || item.stock_by_store || [],
            orderQuantity: 0,
            suggestedOrderQuantity: 0
          };
        });
        
        // 5. Process sales data into the items
        if (salesDataResponse && Array.isArray(salesDataResponse)) {
          salesDataResponse.forEach(sale => {
            const dateStr = typeof sale.date === 'string' ? sale.date : formatDateForAPI(new Date(sale.date));
            
            // Find the item and add the sale
            const item = processedItems.find(i => i.id === sale.item_id);
            if (item) {
              item.dailySales[dateStr] = sale.quantity;
            }
          });
        }
        
        // 6. Fetch buffer settings or use default
        try {
          const itemIds = processedItems.map(item => item.id);
          const bufferSettings = await fetchBufferSettings(itemIds);
          
          // ตั้งค่า buffer สำหรับแต่ละรายการ
          processedItems.forEach(item => {
            item.buffer = bufferSettings[item.id] || 10; // default to 10 if not found
          });
        } catch (bufferError) {
          console.warn('Error fetching buffer settings:', bufferError);
          // ถ้าไม่สามารถดึง buffer ได้ ใช้ค่าเริ่มต้น
          processedItems.forEach(item => {
            item.buffer = 10; // default buffer value
          });
        }
        
        // 7. Process store stocks
        const storeStocksObj = {};
        processedItems.forEach(item => {
          storeStocksObj[item.id] = {};
          
          if (Array.isArray(item.stockByStore)) {
            item.stockByStore.forEach(store => {
              const storeName = store.store_name || store.storeName;
              const quantity = store.quantity || store.in_stock || 0;
              storeStocksObj[item.id][storeName] = quantity;
            });
          }
        });
        
        setItems(processedItems);
        setStoreStocks(storeStocksObj);
        
        // 8. Calculate projected sales and suggestions
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
        
        // ถ้าเกิดข้อผิดพลาด ให้แสดงข้อมูลตัวอย่างแทน
        const mockData = generateMockData();
        setItems(mockData.items.map(item => ({
          ...item,
          dailySales: {},
          buffer: 10,
          orderQuantity: 0,
          suggestedOrderQuantity: 0
        })));
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
    const targetDateStr = formatDateForAPI(targetDate);
    
    // Sort dates in ascending order for accumulation
    const sortedDates = futureDates
      .map(date => formatDateForAPI(date))
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
  }, [targetCoverageDate]);
  
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
      
      await saveBufferSettings(bufferSettings);
      
      setAlert({
        message: "บันทึกยอดเผื่อสำเร็จ",
        type: "success"
      });
      
      setEditingBuffers(false);
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
  
  // Open LINE notification dialog
  const handleOpenSendLineDialog = useCallback(() => {
    // Generate default message if empty
    if (!lineMessage) {
      const itemsWithQty = items.filter(item => item.orderQuantity > 0);
      
      if (itemsWithQty.length > 0) {
        let message = `รายการสั่งซื้อสินค้า วันที่ ${deliveryDate.toLocaleDateString('th-TH')}\n\n`;
        
        // Group by supplier
        const supplierGroups = {};
        itemsWithQty.forEach(item => {
          if (!supplierGroups[item.supplier]) {
            supplierGroups[item.supplier] = [];
          }
          supplierGroups[item.supplier].push(item);
        });
        
        // Generate message by supplier
        Object.entries(supplierGroups).forEach(([supplier, items]) => {
          message += `**${supplier}**\n`;
          items.forEach((item, idx) => {
            message += `${idx + 1}. ${item.name} จำนวน ${item.orderQuantity} ชิ้น\n`;
          });
          message += '\n';
        });
        
        setLineMessage(message);
      }
    }
    
    setShowSendLineDialog(true);
  }, [items, deliveryDate, lineMessage]);
  
  // Close LINE notification dialog
  const handleCloseSendLineDialog = useCallback(() => {
    setShowSendLineDialog(false);
  }, []);
  
  // Send LINE notification
  const handleSendLineNotification = useCallback(async () => {
    setProcessingAction(true);
    try {
      // Prepare notification data for API
      const notificationData = {
        group_ids: lineGroups,
        po: {
          supplier_name: "รายการรวม",
          po_number: `PO-${formatDateForAPI(new Date())}`,
          delivery_date: formatDateForAPI(deliveryDate),
          total_amount: items.reduce((total, item) => 
            total + (item.orderQuantity * (item.unit_price || 0)), 0),
          items: items
            .filter(item => item.orderQuantity > 0)
            .map(item => ({
              item_name: item.name,
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
  }, [items, deliveryDate, lineGroups, lineMessage, lineNote]);
  
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
      // Filter items with order quantities
      const itemsToOrder = items
        .filter(item => 
          item.orderQuantity > 0 && 
          (!selectedSupplier || item.supplier === selectedSupplier)
        )
        .map(item => ({
          item_id: item.id,
          item_name: item.name,
          quantity: item.orderQuantity,
          suggested_quantity: item.suggestedOrderQuantity,
          unit_price: item.unit_price || 0,
          total_price: item.orderQuantity * (item.unit_price || 0),
          buffer: item.buffer || 0,
          current_stock: item.currentStock || 0,
          projected_stock: (item.currentStock || 0) - (item.buffer || 0)
        }));
      
      if (itemsToOrder.length === 0) {
        throw new Error("ไม่มีรายการสั่งซื้อที่เลือก");
      }
      
      // Determine supplier
      const supplierName = selectedSupplier || 
        (itemsToOrder.length > 0 ? itemsToOrder[0].supplier : "รายการรวม");
      
      // Calculate total amount
      const totalAmount = itemsToOrder.reduce(
        (total, item) => total + item.total_price, 0
      );
      
      // Create PO data for API
      const poData = {
        supplier_id: selectedSupplier || "default",
        supplier_name: supplierName,
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
        message: "สร้างใบสั่งซื้อสำเร็จ",
        type: "success",
        description: `เลขที่ใบสั่งซื้อ: ${createdPO.po_number || 'PO-TEMP'}`
      });
      
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
  }, [items, selectedSupplier, deliveryDate, targetCoverageDate]);
  
  return {
    items,
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